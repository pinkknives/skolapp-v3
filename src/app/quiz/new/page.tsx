'use client'

import React from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const quizOptions = [
  {
    id: 'empty',
    title: 'Tomt quiz',
    description: 'Börja med ett helt tomt quiz och lägg till frågor manuellt',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    estimatedTime: '5-15 min',
    href: '/quiz/new/wizard?type=empty'
  },
  {
    id: 'template', 
    title: 'Mall',
    description: 'Välj en förberedd mall baserat på ämne och årskurs',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    estimatedTime: '2-8 min',
    href: '/quiz/new/wizard?type=template',
    disabled: true // Will be enabled in future iteration
  },
  {
    id: 'ai-draft',
    title: 'AI-utkast',
    description: 'Låt AI skapa frågor baserat på ämne, årskurs och nivå',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    estimatedTime: '30 sek - 2 min',
    href: '/quiz/new/wizard?type=ai-draft'
  }
]

export default function QuizNewPage() {
  const router = useRouter()

  return (
    <Layout>
      <Section spacing="lg">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Heading level={1} className="mb-4">
                Skapa nytt quiz
              </Heading>
              <Typography variant="subtitle1" className="text-neutral-600 max-w-2xl mx-auto">
                Välj hur du vill komma igång. Du kan alltid ändra och anpassa ditt quiz senare.
              </Typography>
            </div>

            {/* Quiz Type Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {quizOptions.map((option) => (
                <Card 
                  key={option.id} 
                  className={`relative h-full transition-all duration-200 hover:shadow-lg ${
                    option.disabled ? 'opacity-60' : 'hover:border-primary-300 cursor-pointer'
                  }`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                      {option.icon}
                    </div>
                    <CardTitle className="text-xl mb-2">{option.title}</CardTitle>
                    <Typography variant="body2" className="text-neutral-600 mb-4">
                      {option.description}
                    </Typography>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="mb-6">
                      <div className="flex items-center justify-center mb-4">
                        <svg className="h-4 w-4 mr-2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <Typography variant="caption" className="text-neutral-600">
                          {option.estimatedTime}
                        </Typography>
                      </div>
                    </div>

                    <Button 
                      fullWidth
                      disabled={option.disabled}
                      asChild={!option.disabled}
                    >
                      {option.disabled ? (
                        'Kommer snart'
                      ) : (
                        <Link href={option.href}>
                          Välj detta alternativ
                        </Link>
                      )}
                    </Button>
                  </CardContent>

                  {option.disabled && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-warning-100 text-warning-700 text-xs rounded-md font-medium">
                        Kommer snart
                      </span>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Help Section */}
            <Card className="bg-neutral-50">
              <CardContent className="text-center py-8">
                <Typography variant="h6" className="mb-4">
                  Behöver du hjälp att välja?
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div>
                    <Typography variant="body2" className="font-medium mb-2 text-primary-600">
                      Tomt quiz
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Bäst när du vet exakt vilka frågor du vill ha och vill ha full kontroll över innehållet från början.
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="font-medium mb-2 text-primary-600">
                      Mall
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Perfekt för vanliga ämnesområden. Sparar tid genom att ge dig en grund att bygga vidare på.
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="font-medium mb-2 text-primary-600">
                      AI-utkast
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Snabbaste sättet att komma igång. Ange ämne och årskurs så skapar AI frågor som du kan granska och redigera.
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/teacher/quiz">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Tillbaka till mina quiz
                </Link>
              </Button>
              
              <Typography variant="caption" className="text-neutral-500">
                Steg 1 av 4 - Välj typ
              </Typography>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}