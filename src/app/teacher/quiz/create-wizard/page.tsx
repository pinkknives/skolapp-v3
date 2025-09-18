'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'
import { QuizCreationWizard } from '@/components/quiz/QuizCreationWizard'
import { Quiz } from '@/types/quiz'
import { createDefaultQuiz } from '@/lib/quiz-utils'
import { useSearchParams, useRouter } from 'next/navigation'

function CreateWizardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Partial<Quiz>>(() => createDefaultQuiz('teacher-1'))
  const [creationType, setCreationType] = useState<string>('empty')

  useEffect(() => {
    const type = searchParams.get('type') || 'empty'
    setCreationType(type)
    
    // Initialize quiz based on creation type
    let initialQuiz = createDefaultQuiz('teacher-1')
    
    switch (type) {
      case 'template':
        // For template, we could pre-populate with some structure
        initialQuiz = {
          ...initialQuiz,
          title: 'Mall: ',
          description: 'Skapat från mall',
        }
        break
      case 'ai-draft':
        // For AI draft, we could show the AI panel immediately
        initialQuiz = {
          ...initialQuiz,
          title: '',
          description: 'Skapat med AI-hjälp',
        }
        break
      default:
        // Empty quiz - use defaults
        break
    }
    
    setQuiz(initialQuiz)
  }, [searchParams])

  const handleQuizComplete = (completedQuiz: Quiz) => {
    console.log('Quiz created:', completedQuiz)
    // In real implementation, this would save to database and redirect
    router.push(`/teacher/quiz/${completedQuiz.id || 'new'}?created=true`)
  }

  const getPageTitle = () => {
    switch (creationType) {
      case 'template':
        return 'Skapa quiz från mall'
      case 'ai-draft':
        return 'Skapa quiz med AI'
      default:
        return 'Skapa nytt quiz'
    }
  }

  const getPageSubtitle = () => {
    switch (creationType) {
      case 'template':
        return 'Anpassa den valda mallen efter dina behov'
      case 'ai-draft':
        return 'Låt AI:n hjälpa dig att skapa ett komplett quiz'
      default:
        return 'Bygg ditt quiz steg för steg med vår guide'
    }
  }

  return (
    <Layout>
      <Section className="py-12">
        <Container>
          <div className="mb-8 text-center">
            <Heading level={1} className="mb-4">
              {getPageTitle()}
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600">
              {getPageSubtitle()}
            </Typography>
          </div>

          <QuizCreationWizard
            initialQuiz={quiz}
            onComplete={handleQuizComplete}
            creationType={creationType}
          />
        </Container>
      </Section>
    </Layout>
  )
}

export default function CreateWizardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateWizardContent />
    </Suspense>
  )
}