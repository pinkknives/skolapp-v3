'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'
import { SessionJoinForm } from '@/components/quiz/SessionJoinForm'
import { QuizSession, SessionParticipant } from '@/types/quiz'

export default function QuizJoinPage() {
  const [prefilledCode, setPrefilledCode] = useState<string>('')

  // Check for pre-filled code from QR code scanning
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCode = sessionStorage.getItem('quiz_join_code')
      if (storedCode) {
        setPrefilledCode(storedCode)
        // Clear the stored code
        sessionStorage.removeItem('quiz_join_code')
      }
    }
  }, [])

  const handleJoinSuccess = (session: QuizSession, participant: SessionParticipant) => {
    console.log('Successfully joined session:', session, participant)
    
    // TODO: Redirect to appropriate page based on session status
    // For now, just show success message
    // In the future, this could redirect to:
    // - Waiting room if session is in 'lobby' state
    // - Quiz taking interface if session is 'live' 
    // - Results page if session is 'ended'
  }

  return (
    <Layout>
      <Section className="py-12">
        <Container size="sm">
          <div className="text-center mb-8">
            <Heading level={1} className="mb-4">
              Gå med i Quiz
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600">
              Ange koden från din lärare för att gå med i quizet
            </Typography>
          </div>

          <SessionJoinForm 
            prefilledCode={prefilledCode}
            onJoinSuccess={handleJoinSuccess}
          />
        </Container>
      </Section>
    </Layout>
  )
}