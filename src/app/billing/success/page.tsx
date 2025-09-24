'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { CheckCircle, ArrowRight, Mail, Phone, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function BillingSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [sessionData, setSessionData] = useState<{
    customer_email?: string
    amount_total?: number
    currency?: string
    subscription?: {
      id: string
      status: string
    }
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // In a real app, you would fetch session data from your backend
      // For now, we'll simulate the data
      setTimeout(() => {
        setSessionData({
          customer_email: 'user@example.com',
          amount_total: 8900, // 89.00 SEK in cents
          currency: 'sek',
          subscription: {
            id: 'sub_example',
            status: 'trialing'
          }
        })
        setLoading(false)
      }, 1000)
    }
  }, [sessionId])

  if (loading) {
    return (
      <Layout>
        <Section>
          <Container>
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <Typography variant="body1">Verifierar din betalning...</Typography>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout>
      <Section>
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <Heading level={1} className="text-3xl font-bold text-foreground mb-2">
                Välkommen till Skolapp!
              </Heading>
              <Typography variant="subtitle1" className="text-muted-foreground">
                Din betalning har genomförts framgångsrikt
              </Typography>
            </div>

            {/* Order Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Orderbekräftelse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <Typography variant="body1">Abonnemang</Typography>
                  <Typography variant="body1" className="font-semibold">
                    Standard Plan
                  </Typography>
                </div>
                <div className="flex justify-between items-center">
                  <Typography variant="body1">Belopp</Typography>
                  <Typography variant="body1" className="font-semibold">
                    {sessionData?.amount_total ? (sessionData.amount_total / 100).toFixed(2) : '89.00'} SEK
                  </Typography>
                </div>
                <div className="flex justify-between items-center">
                  <Typography variant="body1">Status</Typography>
                  <Typography variant="body1" className="font-semibold text-green-600">
                    Aktiv (14 dagars provperiod)
                  </Typography>
                </div>
                <div className="border-t pt-4">
                  <Typography variant="caption" className="text-muted-foreground">
                    Du kommer att faktureras automatiskt efter provperioden.
                  </Typography>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Nästa steg</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-600">1</span>
                  </div>
                  <div>
                    <Typography variant="h6" className="text-foreground">
                      Kontrollera din e-post
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                      Vi har skickat en bekräftelse och instruktioner till {sessionData?.customer_email || 'din e-postadress'}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-600">2</span>
                  </div>
                  <div>
                    <Typography variant="h6" className="text-foreground">
                      Kom igång med ditt första quiz
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                      Logga in och börja skapa engagerande quiz för dina elever
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-600">3</span>
                  </div>
                  <div>
                    <Typography variant="h6" className="text-foreground">
                      Utforska alla funktioner
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                      Testa AI-assistenten, live-sessioner och avancerade analyser
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/teacher/quiz/create">
                  Skapa ditt första quiz
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/teacher">
                  Gå till dashboard
                </Link>
              </Button>
            </div>

            {/* Support Information */}
            <div className="mt-12 p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <Typography variant="h6" className="text-foreground mb-4">
                Behöver du hjälp?
              </Typography>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@skolapp.se"
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  support@skolapp.se
                </a>
                <a
                  href="tel:+46123456789"
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +46 123 456 789
                </a>
                <a
                  href="/contact"
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Boka demo
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}
