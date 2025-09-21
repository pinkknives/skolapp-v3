import { Layout, Container, Section } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import { ClassList } from '@/components/classroom/ClassList'
import { CreateClassButton } from '@/components/classroom/CreateClassButton'
import { getTeacherClasses } from '@/app/actions/classes'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Plus, Users, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TeacherClassesPage() {
  // Soft redirect to login if not authenticated/teacher
  const user = await getCurrentUser()
  if (!user || !user.profile || user.profile.role !== 'teacher') {
    redirect(`/login?next=${encodeURIComponent('/teacher/classes')}`)
  }

  const classes = await getTeacherClasses()

  return (
    <Layout>
      <Section spacing="xl">
        <Container>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Heading level={1} className="mb-2">
                  Mina klasser
                </Heading>
                <Typography variant="subtitle1" className="text-neutral-600">
                  Skapa och hantera dina klasser. Bjud in elever och kör quiz tillsammans.
                </Typography>
              </div>
              <CreateClassButton />
            </div>
          </div>

          {classes.length === 0 ? (
            <div className="text-center py-12">
              <Card className="max-w-lg mx-auto">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-primary-600" />
                  </div>
                  <Heading level={3} className="mb-4">
                    Skapa din första klass
                  </Heading>
                  <Typography variant="body1" className="text-neutral-600 mb-6">
                    Organisera dina elever i klasser för att enkelt köra quiz och följa resultat.
                  </Typography>
                  <div className="space-y-4">
                    <CreateClassButton size="lg" className="w-full">
                      <Plus size={20} strokeWidth={2} />
                      Skapa klass
                    </CreateClassButton>
                    <Typography variant="body2" className="text-neutral-500">
                      Elever kan sedan gå med via en 6-teckens kod
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Quick stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <Typography variant="h6" className="font-semibold">
                          {classes.length}
                        </Typography>
                        <Typography variant="body2" className="text-neutral-600">
                          {classes.length === 1 ? 'Klass' : 'Klasser'}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-success-600" />
                      </div>
                      <div>
                        <Typography variant="h6" className="font-semibold">
                          {classes.reduce((sum, cls) => sum + cls.memberCount, 0)}
                        </Typography>
                        <Typography variant="body2" className="text-neutral-600">
                          Totalt elever
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-info-100 rounded-lg flex items-center justify-center">
                        <Plus className="w-6 h-6 text-info-600" />
                      </div>
                      <div>
                        <CreateClassButton variant="ghost" size="sm">
                          Skapa ny klass
                        </CreateClassButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Classes list */}
              <ClassList classes={classes} />
            </>
          )}
        </Container>
      </Section>
    </Layout>
  )
}