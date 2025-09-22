'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Users, Clock, AlertCircle } from 'lucide-react'
import { liveSession } from '@/locales/sv/quiz'

interface SessionData {
  id: string
  code: string
  status: string
  mode: string
  quiz: {
    id: string
    title: string
    questionCount: number
  }
  class: {
    id: string
    name: string
  } | null
}

export default function JoinSessionPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  
  const [session, setSession] = useState<SessionData | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  const fetchSession = useCallback(async () => {
    try {
      const supabase = supabaseBrowser()
      
      // Find session by code
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          id,
          code,
          status,
          mode,
          quizzes!inner(id, title, questions),
          classes(id, name)
        `)
        .eq('code', code.toUpperCase())
        .single()

      if (sessionError || !sessionData) {
        setError(liveSession.errors.sessionNotFound)
        return
      }

      if (sessionData.status === 'ended') {
        setError(liveSession.errors.sessionEnded)
        return
      }

      const quiz = Array.isArray(sessionData.quizzes) ? sessionData.quizzes[0] : sessionData.quizzes
      const classData = Array.isArray(sessionData.classes) ? sessionData.classes[0] : sessionData.classes

      setSession({
        id: sessionData.id,
        code: sessionData.code,
        status: sessionData.status,
        mode: sessionData.mode,
        quiz: {
          id: quiz?.id || '',
          title: quiz?.title || '',
          questionCount: quiz?.questions?.length || 0
        },
        class: classData ? {
          id: classData.id,
          name: classData.name
        } : null
      })
    } catch (error) {
      console.error('Error fetching session:', error)
      setError(liveSession.errors.sessionNotFound)
    } finally {
      setIsLoading(false)
    }
  }, [code])

  useEffect(() => {
    if (code) {
      fetchSession()
    }
  }, [code, fetchSession])

  const handleJoin = async () => {
    if (!session || !displayName.trim()) return

    setIsJoining(true)
    setError('')

    try {
      const supabase = supabaseBrowser()
      
      // Get current user (if authenticated)
      const { data: { user } } = await supabase.auth.getUser()
      
      // Check if already participating
      if (user) {
        const { data: existingParticipant } = await supabase
          .from('session_participants')
          .select('id')
          .eq('session_id', session.id)
          .or(`student_id.eq.${user.id},student_profile_id.eq.${user.id}`)
          .single()

        if (existingParticipant) {
          setError(liveSession.errors.alreadyJoined)
          setIsJoining(false)
          return
        }
      }

      // Join session as participant
      const { error: joinError } = await supabase
        .from('session_participants')
        .insert({
          session_id: session.id,
          student_id: user?.id || null, // Authenticated user
          student_profile_id: user?.id || null, // For GDPR: null in Korttidsläge
          display_name: displayName.trim(),
          status: 'joined'
        })

      if (joinError) {
        console.error('Error joining session:', joinError)
        if (joinError.code === '23505') { // Unique constraint violation
          setError(liveSession.errors.alreadyJoined)
        } else {
          setError('Ett fel uppstod vid anslutning till sessionen')
        }
        return
      }

      // Publish realtime event
      const channel = supabase.channel(`session:${session.id}`)
      await channel.send({
        type: 'broadcast',
        event: 'participant_joined',
        payload: {
          displayName: displayName.trim(),
          joinedAt: new Date().toISOString()
        }
      })

      // Redirect to play page
      router.push(`/play/${session.code}`)

    } catch (error) {
      console.error('Error joining session:', error)
      setError('Ett oväntat fel uppstod')
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
  <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <Typography variant="body1">Laddar session...</Typography>
        </div>
      </div>
    )
  }

  if (error) {
    return (
  <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
        <Card className="w-full max-w-md">
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <Typography variant="h2" className="mb-2">
              Något gick fel
            </Typography>
            <Typography variant="body1" className="text-neutral-600 mb-4">
              {error}
            </Typography>
            <Button 
              onClick={() => router.push('/')}
              variant="primary"
            >
              Tillbaka till startsidan
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
  <div className="min-h-screen bg-neutral-50 p-4 dark:bg-neutral-950">
      <div className="max-w-md mx-auto pt-20">
        <Card>
          <div className="p-6">
            <div className="text-center mb-6">
              <Typography variant="h1" className="mb-2">
                {liveSession.student.join.title}
              </Typography>
              <Typography variant="body1" className="text-neutral-600">
                {session.quiz.title}
              </Typography>
              {session.class && (
                <Typography variant="body2" className="text-neutral-500">
                  {session.class.name}
                </Typography>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg dark:bg-neutral-900">
                <Users className="w-5 h-5 text-primary-600" />
                <div>
                  <Typography variant="body2" className="font-medium">
                    Sessionskod
                  </Typography>
                  <Typography variant="caption" className="text-neutral-600">
                    {session.code}
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg dark:bg-neutral-900">
                <Clock className="w-5 h-5 text-primary-600" />
                <div>
                  <Typography variant="body2" className="font-medium">
                    Sessiontyp
                  </Typography>
                  <Typography variant="caption" className="text-neutral-600">
                    {session.mode === 'sync' ? 'Live (Realtid)' : 'Självgående'}
                  </Typography>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700 mb-2">
                  {liveSession.student.join.nameLabel}
                </label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={liveSession.student.join.namePlaceholder}
                  maxLength={50}
                  className="w-full"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Typography variant="caption" className="text-blue-800">
                  {liveSession.student.join.gdprNotice.korttid}
                </Typography>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Typography variant="caption" className="text-red-800">
                    {error}
                  </Typography>
                </div>
              )}

              <Button
                onClick={handleJoin}
                disabled={!displayName.trim() || isJoining}
                loading={isJoining}
                variant="primary"
                className="w-full"
              >
                {liveSession.student.join.submit}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}