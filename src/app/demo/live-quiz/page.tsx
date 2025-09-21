import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Users, BookOpen, Monitor, Zap } from 'lucide-react'

export default function LiveQuizDemo() {
  // Check if feature is enabled
  const isFeatureEnabled = process.env.NEXT_PUBLIC_FEATURE_LIVE_QUIZ === 'true'

  if (!isFeatureEnabled) {
    return (
      <Layout>
        <Section spacing="xl">
          <Container>
            <div className="text-center py-12">
              <Heading level={1} className="mb-4">Live Quiz-funktionen är inaktiverad</Heading>
              <Typography variant="body1" className="text-neutral-600 mb-6">
                Aktivera NEXT_PUBLIC_FEATURE_LIVE_QUIZ i miljövariablerna för att testa live quiz.
              </Typography>
              <div className="bg-neutral-50 p-4 rounded-lg max-w-md mx-auto">
                <Typography variant="body2" className="font-mono text-sm">
                  NEXT_PUBLIC_FEATURE_LIVE_QUIZ=true
                </Typography>
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
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Heading level={1} className="mb-4">
                Live Quiz med Ably - Demo
              </Heading>
              <Typography variant="body1" className="text-neutral-600 mb-6">
                Testa realtidsfunktionen för live quiz med token-autentisering och Ably-integration.
              </Typography>
              
              <div className="bg-primary-50 p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-primary-600" />
                  <Typography variant="body2" className="font-medium text-primary-800">
                    Realtidsfunktioner
                  </Typography>
                </div>
                <Typography variant="body2" className="text-primary-700">
                  Token-auth • Presence • Control-meddelanden • Svar i realtid
                </Typography>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Lärarvy</CardTitle>
                </CardHeader>
                <CardContent>
                  <Typography variant="body2" className="text-neutral-600 mb-4">
                    Styr quizet, se deltagare och övervaka svar i realtid.
                  </Typography>
                  <Button asChild className="w-full">
                    <Link href="/demo/live-quiz/teacher">
                      Öppna Lärarvy
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Elevvy</CardTitle>
                </CardHeader>
                <CardContent>
                  <Typography variant="body2" className="text-neutral-600 mb-4">
                    Delta i quizet, svara på frågor och se status i realtid.
                  </Typography>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/demo/live-quiz/student">
                      Öppna Elevvy
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Monitor className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Klassrumsskärm</CardTitle>
                </CardHeader>
                <CardContent>
                  <Typography variant="body2" className="text-neutral-600 mb-4">
                    Visa quiz-status på klassrumsskärm (read-only).
                  </Typography>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/demo/live-quiz/display">
                      Öppna Display
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="bg-neutral-50 p-6 rounded-lg">
              <Heading level={3} className="mb-4">Testinstruktioner</Heading>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <p>Öppna lärarvyn i en webbläsarflik</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <p>Öppna elevvyn i en annan flik (eller flera för att simulera flera elever)</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <p>Valfritt: Öppna klassrumsskärmen för att se den stora vyn</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <p>Starta quizet från lärarvyn och se hur alla vyer uppdateras i realtid</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 p-6 rounded-lg">
              <Heading level={3} className="mb-4">Teknisk Information</Heading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <Typography variant="body2" className="font-medium mb-2">Ably-kanaler:</Typography>
                  <ul className="space-y-1 text-neutral-600">
                    <li>• quiz:demo-quiz-123:control</li>
                    <li>• quiz:demo-quiz-123:answers</li>
                    <li>• quiz:demo-quiz-123:room</li>
                  </ul>
                </div>
                <div>
                  <Typography variant="body2" className="font-medium mb-2">Funktioner:</Typography>
                  <ul className="space-y-1 text-neutral-600">
                    <li>• Token-baserad autentisering</li>
                    <li>• Capability-scoping per roll</li>
                    <li>• Presence-meddelanden</li>
                    <li>• Real-time svar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}