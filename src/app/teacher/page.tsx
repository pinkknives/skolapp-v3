import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import Link from 'next/link'
import { Plus, ClipboardList, Users, BarChart3, Building2 } from 'lucide-react'

const features = [
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
    title: 'Statistik & Rapporter',
    description: 'Analysera elevernas prestationer och få insikter för att förbättra undervisningen.',
    icon: <BarChart3 size={24} strokeWidth={2} />,
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
                    <Link href="/teacher/quiz/create" className="gap-x-2">
                      <Plus size={20} strokeWidth={2} />
                      Skapa ditt första quiz
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="gap-x-2">
                    <Link href="/teacher/classes">
                      <Users size={20} strokeWidth={2} />
                      Skapa din första klass
                    </Link>
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