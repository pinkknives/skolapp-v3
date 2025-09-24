'use client'

import React from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { XCircle, ArrowLeft, Mail, Phone, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function BillingCancelPage() {
  return (
    <Layout>
      <Section>
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            {/* Cancel Icon */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <Heading level={1} className="text-3xl font-bold text-foreground mb-2">
                Betalning avbruten
              </Heading>
              <Typography variant="subtitle1" className="text-muted-foreground">
                Din betalning har avbrutits. Inga avgifter har debiterats.
              </Typography>
            </div>

            {/* Information Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Vad händer nu?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <Typography variant="h6" className="text-foreground">
                      Inga avgifter
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                      Inga pengar har dragits från ditt konto
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <Typography variant="h6" className="text-foreground">
                      Fortsätt med gratis versionen
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                      Du kan fortfarande använda Skolapp med begränsade funktioner
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">3</span>
                  </div>
                  <div>
                    <Typography variant="h6" className="text-foreground">
                      Prova igen senare
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                      Du kan när som helst försöka betala igen från din profil
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild size="lg">
                <Link href="/pricing">
                  Se priser igen
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/teacher">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Tillbaka till dashboard
                </Link>
              </Button>
            </div>

            {/* Help Section */}
            <Card className="bg-neutral-50 dark:bg-neutral-800">
              <CardHeader>
                <CardTitle className="text-center">Behöver du hjälp?</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="body1" className="text-center text-muted-foreground mb-6">
                  Om du stötte på problem under betalningen eller har frågor om våra priser, 
                  hjälper vi dig gärna.
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href="mailto:support@skolapp.se"
                    className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <Mail className="w-6 h-6 text-primary-600 mb-2" />
                    <Typography variant="h6" className="text-foreground mb-1">
                      E-post
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground text-center">
                      support@skolapp.se
                    </Typography>
                  </a>

                  <a
                    href="tel:+46123456789"
                    className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <Phone className="w-6 h-6 text-primary-600 mb-2" />
                    <Typography variant="h6" className="text-foreground mb-1">
                      Telefon
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground text-center">
                      +46 123 456 789
                    </Typography>
                  </a>

                  <a
                    href="/contact"
                    className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <MessageCircle className="w-6 h-6 text-primary-600 mb-2" />
                    <Typography variant="h6" className="text-foreground mb-1">
                      Live-chat
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground text-center">
                      Tillgänglig 24/7
                    </Typography>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <div className="mt-8">
              <Typography variant="body2" className="text-muted-foreground">
                Har du frågor om våra priser eller funktioner?{' '}
                <Link href="/#faq" className="text-primary-600 hover:text-primary-700 underline">
                  Läs våra vanliga frågor
                </Link>
              </Typography>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}
