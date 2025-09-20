'use client'

import React, { useState } from 'react'
import { LiveQuizStudentView } from '@/components/quiz/LiveQuizStudentView'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// Demo data matching teacher demo
const demoQuiz = {
  id: 'demo-quiz-123',
  title: 'Demo Quiz - Svenska Verb',
  questions: [
    {
      id: 'q1',
      title: 'Vad är presens av verbet "att springa"?',
      type: 'multiple-choice' as const,
      options: [
        { id: 'opt1', text: 'spring' },
        { id: 'opt2', text: 'springer' },
        { id: 'opt3', text: 'sprang' },
        { id: 'opt4', text: 'sprungit' }
      ]
    },
    {
      id: 'q2', 
      title: 'Vilket av följande är ett starkt verb?',
      type: 'multiple-choice' as const,
      options: [
        { id: 'opt1', text: 'hoppa' },
        { id: 'opt2', text: 'sjunga' },
        { id: 'opt3', text: 'prata' },
        { id: 'opt4', text: 'leka' }
      ]
    },
    {
      id: 'q3',
      title: 'Förklara skillnaden mellan presens och preteritum.',
      type: 'free-text' as const
    }
  ]
}

export default function LiveQuizStudentDemo() {
  const [studentName, setStudentName] = useState('')
  const [hasJoined, setHasJoined] = useState(false)

  // Check if feature is enabled
  const isFeatureEnabled = process.env.NEXT_PUBLIC_FEATURE_LIVE_QUIZ === 'true'

  if (!isFeatureEnabled) {
    return (
      <Layout>
        <Section spacing="xl">
          <Container>
            <div className="text-center py-12">
              <Heading level={1} className="mb-4">Live Quiz-funktionen är inaktiverad</Heading>
              <Typography variant="body1" className="text-neutral-600">
                Aktivera NEXT_PUBLIC_FEATURE_LIVE_QUIZ i miljövariablerna för att testa live quiz.
              </Typography>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  if (!hasJoined) {
    return (
      <Layout>
        <Section spacing="xl">
          <Container>
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <Heading level={1} className="mb-4">
                  Gå med i Live Quiz (Demo)
                </Heading>
                <Typography variant="body1" className="text-neutral-600">
                  Ange ditt namn för att delta i demo-quizet.
                </Typography>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="studentName" className="block text-sm font-medium text-neutral-700 mb-2">
                    Ditt namn
                  </label>
                  <Input
                    id="studentName"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Ange ditt namn..."
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={() => setHasJoined(true)}
                  disabled={!studentName.trim()}
                  className="w-full"
                >
                  Gå med i quiz
                </Button>

                <div className="text-center text-sm text-neutral-500">
                  <p>Quiz ID: {demoQuiz.id}</p>
                  <p>Öppna lärarvyn i en annan flik för att styra quizet</p>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout>
      <Section spacing="xl">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <Heading level={1} className="mb-4">
                Live Quiz - Elevvy (Demo)
              </Heading>
              <Typography variant="body1" className="text-neutral-600">
                Välkommen {studentName}! Vänta på att läraren startar quizet.
              </Typography>
            </div>

            <LiveQuizStudentView
              quizId={demoQuiz.id}
              questions={demoQuiz.questions}
              studentName={studentName}
            />
          </div>
        </Container>
      </Section>
    </Layout>
  )
}