'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { ImprovedStudentJoin } from '@/components/quiz/ImprovedStudentJoin'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

function JoinContent() {
  const router = useRouter()
  // const searchParams = useSearchParams()
  const supabase = supabaseBrowser()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    getUser()
  }, [supabase])

  const handleJoinSuccess = async ({ pin, name }: { pin: string; name: string }) => {
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

      // Get quiz details
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('title, questions')
        .eq('id', session.quiz_id)
        .single()

      if (quizError || !quiz) {
        setError('Quiz hittades inte')
        return
      }

      // Join the session
      const { error: joinError } = await supabase
        .from('live_quiz_participants')
        .insert({
          session_id: session.id,
          user_id: user?.id,
          display_name: name,
          role: 'student',
          has_answered: false
        })
        .select()
        .single()

      if (joinError) {
        setError('Kunde inte gå med i sessionen')
        return
      }

      // Redirect to live session
      router.push(`/live/session/${session.id}`)

    } catch (error) {
      console.error('Error joining session:', error)
      setError('Ett fel uppstod när sessionen skulle hittas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQrCodeScan = () => {
    // For now, just show a message
    // In a real implementation, this would open the camera
    alert('QR-kod scanning kommer snart! Använd PIN-koden istället.')
  }

  return (
    <Layout>
      <Section className="py-8">
        <Container size="sm">
          <ImprovedStudentJoin
            onJoinSuccess={handleJoinSuccess}
            onQrCodeScan={handleQrCodeScan}
            isLoading={isLoading}
            error={error}
          />
        </Container>
      </Section>
    </Layout>
  )
}

export default function ImprovedLiveJoinPage() {
  return (
    <Suspense fallback={
      <Layout>
        <Section className="py-8">
          <Container size="sm">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Laddar...</p>
              </div>
            </div>
          </Container>
        </Section>
      </Layout>
    }>
      <JoinContent />
    </Suspense>
  )
}
