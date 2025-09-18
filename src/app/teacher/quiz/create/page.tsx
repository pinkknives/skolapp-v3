'use client'

import React from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'

export default function CreateQuizPage() {
  const router = useRouter()

  const handleCreateEmpty = () => {
    router.push('/teacher/quiz/create-wizard?type=empty')
  }

  const handleCreateFromTemplate = () => {
    router.push('/teacher/quiz/create-wizard?type=template')
  }

  const handleCreateWithAI = () => {
    router.push('/teacher/quiz/create-wizard?type=ai-draft')
  }

  return (
    <Layout>
      <Section spacing="lg">
        <Container>
          <div className="mb-8 text-center">
            <Heading level={1} className="mb-4">
              Skapa nytt quiz
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600">
              Välj hur du vill skapa ditt quiz. Du kan alltid ändra och anpassa efter att du har börjat.
            </Typography>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Empty Quiz Option */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleCreateEmpty}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-neutral-200 transition-colors">
                  <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Tomt quiz</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Typography variant="body2" className="text-neutral-600 mb-4">
                  Börja från början och bygg ditt quiz steg för steg. Ger dig full kontroll över innehållet.
                </Typography>
                <Typography variant="caption" className="text-neutral-500">
                  Rekommenderat för erfarna användare
                </Typography>
              </CardContent>
            </Card>

            {/* Template Option */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleCreateFromTemplate}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Mall</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Typography variant="body2" className="text-neutral-600 mb-4">
                  Använd en förberedd mall med vanliga frågetyper och strukturer för ditt ämne.
                </Typography>
                <Typography variant="caption" className="text-neutral-500">
                  Snabb start med beprövade strukturer
                </Typography>
              </CardContent>
            </Card>

            {/* AI Draft Option */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-2 border-success-200 bg-success-50" onClick={handleCreateWithAI}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-success-200 transition-colors">
                  <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">AI-utkast</CardTitle>
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-600 text-white">
                  Rekommenderat
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <Typography variant="body2" className="text-neutral-600 mb-4">
                  Låt AI:n skapa ett komplett quiz baserat på dina inställningar. Du kan sedan redigera och anpassa.
                </Typography>
                <Typography variant="caption" className="text-neutral-500">
                  Snabbast väg till ett färdigt quiz
                </Typography>
              </CardContent>
            </Card>

          </div>

          {/* Help Section */}
          <div className="max-w-2xl mx-auto mt-12">
            <Card className="bg-neutral-50">
              <CardHeader>
                <CardTitle className="text-base text-center">Behöver du hjälp att välja?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <Typography variant="body2" className="font-medium mb-1">Tomt quiz</Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Bäst när du vet exakt vad du vill ha och har tid att bygga från grunden.
                    </Typography>
                  </div>
                  <div className="text-center">
                    <Typography variant="body2" className="font-medium mb-1">Mall</Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Perfekt när du vill ha en beprövad struktur att utgå från.
                    </Typography>
                  </div>
                  <div className="text-center">
                    <Typography variant="body2" className="font-medium mb-1">AI-utkast</Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Idealiskt när du vill spara tid och få förslag på innehåll.
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </Container>
      </Section>
    </Layout>
  )
}