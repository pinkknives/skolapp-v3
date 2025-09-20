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
    
    // Store session and participant data for the next page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('current_session', JSON.stringify(session))
      sessionStorage.setItem('current_participant', JSON.stringify(participant))
    }
    
    // Redirect based on session mode and status
    if (session.mode === 'sync') {
      // For sync mode, go to the sync quiz interface
      window.location.href = `/quiz/sync/${session.id}`
    } else {
      // For async mode, redirect based on session status
      if (session.status === 'lobby') {
        // Go to waiting room
        window.location.href = `/quiz/wait/${session.id}`
      } else if (session.status === 'live') {
        // Go to quiz taking interface
        window.location.href = `/quiz/take/${session.id}`
      } else {
        // Session ended or other status
        window.location.href = `/quiz/join`
      }
    }
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