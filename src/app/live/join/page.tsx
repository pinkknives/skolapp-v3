'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Users, Loader2 } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'

interface SessionData {
  id: string
  pin: string
  status: string
  quizTitle: string
  totalQuestions: number
}

export default function LiveJoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = supabaseBrowser()
  
  const [pin, setPin] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [user, setUser] = useState<any>(null)

  // Get PIN from URL if available
  useEffect(() => {
    const urlPin = searchParams.get('pin')
    if (urlPin) {
      setPin(urlPin.toUpperCase())
    }
  }, [searchParams])

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Get display name from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single()
        
        if (profile?.display_name) {
          setDisplayName(profile.display_name)
        }
      }
    }
    
    getUser()
  }, [supabase])

  const handleFindSession = async () => {
    if (!pin || pin.length !== 6) {
      setError('PIN måste vara 6 tecken')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Find session by PIN
      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .select('id, pin, status, quiz_id')
        .eq('pin', pin.toUpperCase())
        .single()

      if (sessionError || !session) {
        setError('Ingen session hittades med denna PIN')
        return
      }

      if (session.status === 'ENDED') {
        setError('Denna session har avslutats')
        return
      }

      // Get quiz details separately
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('title, questions')
        .eq('id', session.quiz_id)
        .single()

      if (quizError || !quiz) {
        setError('Quiz hittades inte')
        return
      }

      setSessionData({
        id: session.id,
        pin: session.pin,
        status: session.status,
        quizTitle: quiz.title || 'Quiz',
        totalQuestions: quiz.questions?.length || 0
      })

    } catch (error) {
      console.error('Error finding session:', error)
      setError('Ett fel uppstod när sessionen skulle hittas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinSession = async () => {
    if (!sessionData || !displayName.trim()) {
      setError('Visningsnamn krävs')
      return
    }

    if (!user) {
      setError('Du måste vara inloggad för att gå med')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/live-sessions/${sessionData.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: displayName.trim(),
          userId: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Kunde inte gå med i sessionen')
        return
      }

      // Redirect to session lobby/play page
      router.push(`/live/session/${sessionData.id}`)

    } catch (error) {
      console.error('Error joining session:', error)
      setError('Ett fel uppstod när du skulle gå med i sessionen')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length === 6) {
      handleFindSession()
    }
  }

  const handleDisplayNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && displayName.trim()) {
      handleJoinSession()
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <Typography variant="h4" className="mb-2">
            Gå med i Live Quiz
          </Typography>
          <Typography variant="body2" className="text-neutral-600">
            Ange 6-teckens PIN för att gå med i quizet
          </Typography>
        </div>

        {!sessionData ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-neutral-700 mb-2">
                Session PIN
              </label>
              <Input
                id="pin"
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase().slice(0, 6))}
                onKeyPress={handlePinKeyPress}
                placeholder="A1B2C3"
                className="text-center text-lg font-mono tracking-wider"
                maxLength={6}
                autoFocus
                data-testid="pin-input"
              />
            </div>

            {error && (
              <div className="text-error-600 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              onClick={handleFindSession}
              disabled={pin.length !== 6 || isLoading}
              className="w-full flex items-center gap-2"
              variant="primary"
              data-testid="find-session"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Söker...
                </>
              ) : (
                'Hitta session'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <Typography variant="h6" className="text-primary-800 mb-1">
                {sessionData.quizTitle}
              </Typography>
              <Typography variant="body2" className="text-primary-600">
                {sessionData.totalQuestions} frågor • PIN: {sessionData.pin}
              </Typography>
              <Typography variant="caption" className="text-primary-600">
                Status: {sessionData.status === 'LOBBY' ? 'Väntar på start' : 
                         sessionData.status === 'ACTIVE' ? 'Pågående' : 'Okänd'}
              </Typography>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700 mb-2">
                Ditt namn
              </label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyPress={handleDisplayNameKeyPress}
                placeholder="Ange ditt namn"
                maxLength={50}
                autoFocus
                data-testid="display-name"
              />
            </div>

            {error && (
              <div className="text-error-600 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setSessionData(null)}
                variant="secondary"
                className="flex-1"
              >
                Tillbaka
              </Button>
              <Button
                onClick={handleJoinSession}
                disabled={!displayName.trim() || isLoading}
                className="flex-1 flex items-center gap-2"
                variant="primary"
                data-testid="join-session"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Går med...
                  </>
                ) : (
                  'Gå med'
                )}
              </Button>
            </div>
          </div>
        )}

        {!user && (
          <div className="mt-4 text-center">
            <Typography variant="caption" className="text-neutral-600">
              Du måste vara inloggad för att delta i live quiz.
            </Typography>
          </div>
        )}
      </Card>
    </div>
  )
}