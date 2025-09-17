import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import Link from 'next/link'

const features = [
  {
    title: 'Skapa Quiz',
    description: 'Skapa engagerande quiz med AI-hjälp eller manuellt. Välj mellan olika frågetyper och genomförandelägen.',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    href: '/teacher/quiz/create',
    buttonText: 'Skapa nytt quiz'
  },
  {
    title: 'Hantera Quiz',
    description: 'Se alla dina quiz, redigera befintliga och hantera publicering och arkivering.',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    href: '/teacher/quiz',
    buttonText: 'Hantera quiz'
  },
  {
    title: 'Klasser & Elever',
    description: 'Organisera dina klasser, hantera elevlister och få översikt över resultat och framsteg.',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    href: '/teacher/classes',
    buttonText: 'Kommer snart',
    disabled: true
  },
  {
    title: 'Statistik & Rapporter',
    description: 'Analysera elevernas prestationer och få insikter för att förbättra undervisningen.',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    href: '/teacher/analytics',
    buttonText: 'Kommer snart',
    disabled: true
  }
]

export default function TeacherPage() {
  return (
    <Layout>
      <Section spacing="xl">
        <Container>
          <div className="text-center mb-12">
            <Heading level={1} className="mb-6">
              Lärarportal
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600 max-w-2xl mx-auto">
              Välkommen till din lärarportal. Här kan du skapa quiz, hantera klasser och följa elevernas utveckling.
            </Typography>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="text-center py-8">
                <Typography variant="h6" className="mb-4 text-primary-800">
                  Kom igång snabbt
                </Typography>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/teacher/quiz/create">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Skapa ditt första quiz
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" disabled>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Lägg till elever (kommer snart)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-neutral-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant={feature.disabled ? "outline" : "primary"}
                    fullWidth
                    disabled={feature.disabled}
                    asChild={!feature.disabled}
                  >
                    {feature.disabled ? (
                      feature.buttonText
                    ) : (
                      <Link href={feature.href}>
                        {feature.buttonText}
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Tips för att komma igång</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Typography variant="body2" className="font-medium mb-2 text-primary-600">
                      Quiz med AI-hjälp
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Använd AI-utkast för att snabbt skapa quiz baserat på ämne och årskurs. 
                      Kom ihåg att alltid granska och anpassa innehållet innan publicering.
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="font-medium mb-2 text-primary-600">
                      Genomförandelägen
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Välj mellan självtempo, lärarstyrt tempo eller lärargranskningsläge 
                      för att passa olika undervisningssituationer.
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="font-medium mb-2 text-primary-600">
                      Delning och QR-koder
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Varje publicerat quiz får en unik fyrteckenskod och QR-kod 
                      som eleverna kan använda för att enkelt gå med.
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="font-medium mb-2 text-primary-600">
                      Tillgänglighet
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Alla quiz är designade för att vara tillgängliga för alla elever, 
                      inklusive stöd för skärmläsare och tangentbordsnavigation.
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