'use client'

import React, { useState } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { QuizCreationWizard } from '@/components/quiz/QuizCreationWizard'
import { Quiz } from '@/types/quiz'
import { createDefaultQuiz } from '@/lib/quiz-utils'

export default function CreateWizardPage() {
  const [quiz, setQuiz] = useState<Partial<Quiz>>(() => createDefaultQuiz('teacher-1'))

  const handleQuizComplete = (completedQuiz: Quiz) => {
    // In real implementation, this would save to database and redirect
  }

  return (
    <Layout>
      <Section className="py-12">
        <Container>
          <div className="mb-8 text-center">
            <Heading level={1} className="mb-4">
              Skapa quiz - Design Prototype
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600">
              Prototyp för förbättrat quiz-skapande flöde med wizard och AI-hjälp
            </Typography>
          </div>

          <QuizCreationWizard
            initialQuiz={quiz}
            onComplete={handleQuizComplete}
          />
        </Container>
      </Section>
    </Layout>
  )
}