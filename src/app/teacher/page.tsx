import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import Link from 'next/link'
import { Plus, ClipboardList, Users, BarChart3, Building2, Library, Bot, Radio } from 'lucide-react'
import { GettingStartedChecklist } from '@/components/teacher/GettingStartedChecklist'

interface FeatureItem {
  title: string
  description: string
  icon: React.ReactNode
  href?: string
  buttonText?: string
  disabled?: boolean
}

const features: FeatureItem[] = [
  {
    title: 'Skapa Quiz',
    description: 'Skapa engagerande quiz med AI-hjälp eller manuellt. Välj mellan olika frågetyper och genomförandelägen.',
    icon: <Plus size={24} strokeWidth={2} />,
    href: '/teacher/quiz/create',
    buttonText: 'Skapa nytt quiz'
  },
  {
    title: 'Hantera Quiz',
    description: 'Se alla dina quiz, redigera befintliga och hantera publicering och arkivering.',
    icon: <ClipboardList size={24} strokeWidth={2} />,
    href: '/teacher/quiz',
    buttonText: 'Hantera quiz'
  },
  {
    title: 'Organisation',
    description: 'Skapa och hantera din organisation, bjud in andra lärare och samarbeta kring quiz.',
    icon: <Building2 size={24} strokeWidth={2} />,
    href: '/teacher/org',
    buttonText: 'Hantera organisation'
  },
  {
    title: 'Klasser & Elever',
    description: 'Organisera dina klasser, hantera elevlister och få översikt över resultat och framsteg.',
    icon: <Users size={24} strokeWidth={2} />,
    href: '/teacher/classes',
    buttonText: 'Hantera klasser'
  },
  {
    title: 'Sammanslagningsbegäran',
    description: 'Se och följ upp begäran om att slå ihop elevdata.',
    icon: <Users size={24} strokeWidth={2} />,
    href: '/teacher/merge-requests',
    buttonText: 'Öppna listan'
  },
  {
    title: 'Statistik & Rapporter',
    description: 'Analysera elevernas prestationer och få insikter för att förbättra undervisningen.',
    icon: <BarChart3 size={24} strokeWidth={2} />,
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

          {/* Getting started checklist */}
          <div className="mb-12">
            <GettingStartedChecklist />
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="text-center py-8">
                <Typography variant="h6" className="mb-4 text-primary-800">
                  Kom igång snabbt
                </Typography>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild>
                    <Link href="/teacher/quiz/create">Skapa quiz</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/teacher/library">Öppna bibliotek</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {feature.href && (
                    <Button asChild disabled={feature.disabled}>
                      <Link href={feature.href}>{feature.buttonText || 'Öppna'}</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-950/95 border-t border-neutral-200 dark:border-neutral-800 safe-area-inset-bottom:px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-2 p-3">
            <Button variant="outline" asChild className="justify-center">
              <Link href="/teacher/quiz/create" aria-label="AI & Skapa">
                <Bot className="w-4 h-4" />
                <span className="sr-only">AI & Skapa</span>
              </Link>
            </Button>
            <Button asChild className="justify-center">
              <Link href="/live/join" aria-label="Live">
                <Radio className="w-4 h-4" />
                <span className="sr-only">Live</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-center">
              <Link href="/teacher/library" aria-label="Bibliotek">
                <Library className="w-4 h-4" />
                <span className="sr-only">Bibliotek</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}