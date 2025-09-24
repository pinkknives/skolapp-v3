'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import { useAuth } from '@/contexts/AuthContext'
import { getStudentAssignments } from '@/app/actions/sessions'
import { AssignmentCard as AssignmentCardType } from '@/types/quiz'
import { AssignmentCard } from '@/components/student/AssignmentCard'
import { Clock, BookOpen, Users, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [assignments, setAssignments] = useState<AssignmentCardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAssignments = useCallback(async () => {
    if (!user?.id) return

    try {
      const result = await getStudentAssignments(user.id)
      if (result.success && result.assignments) {
        setAssignments(result.assignments)
      } else {
        setError(result.error || 'Kunde inte ladda uppgifter')
      }
    } catch (err) {
      console.error('Error loading assignments:', err)
      setError('Ett oväntat fel inträffade')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadAssignments()
    }
  }, [isAuthenticated, user?.id, loadAssignments])

  if (!isAuthenticated) {
    return (
      <Layout>
        <Section spacing="xl" className="min-h-screen flex items-center">
          <Container>
            <Card className="max-w-lg mx-auto text-center">
              <CardHeader>
                <CardTitle>Logga in krävs</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="body1" className="mb-4">
                  Du måste logga in för att se dina uppgifter.
                </Typography>
                <Button asChild>
                  <Link href="/auth/login">Logga in</Link>
                </Button>
              </CardContent>
            </Card>
          </Container>
        </Section>
      </Layout>
    )
  }

  const upcomingAssignments = assignments.filter(a => a.status !== 'submitted' && a.timeRemaining > 0)
  const overdueAssignments = assignments.filter(a => a.status === 'late' || (a.timeRemaining <= 0 && a.status !== 'submitted'))
  const completedAssignments = assignments.filter(a => a.status === 'submitted')

  return (
    <Layout>
      <Section spacing="lg">
        <Container>
          <div className="mb-8">
            <Heading level={1} className="mb-2">
              Mina Uppgifter
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600">
              Översikt över dina läxor och quiz
            </Typography>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning-600" />
                </div>
                <div>
                  <Typography variant="h3" className="font-bold text-warning-600">
                    {upcomingAssignments.length}
                  </Typography>
                  <Typography variant="body2" className="text-neutral-600">
                    Pågående uppgifter
                  </Typography>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-error-600" />
                </div>
                <div>
                  <Typography variant="h3" className="font-bold text-error-600">
                    {overdueAssignments.length}
                  </Typography>
                  <Typography variant="body2" className="text-neutral-600">
                    Försenade
                  </Typography>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-success-600" />
                </div>
                <div>
                  <Typography variant="h3" className="font-bold text-success-600">
                    {completedAssignments.length}
                  </Typography>
                  <Typography variant="body2" className="text-neutral-600">
                    Klara
                  </Typography>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="text-center py-8">
                <Typography variant="body1">Laddar dina uppgifter...</Typography>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-error-200 bg-error-50">
              <CardContent className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-error-600 mx-auto mb-2" />
                <Typography variant="body1" className="text-error-700 mb-4">
                  {error}
                </Typography>
                <Button onClick={loadAssignments} variant="outline">
                  Försök igen
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && !error && assignments.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <Typography variant="h6" className="mb-2">
                  Inga uppgifter än
                </Typography>
                <Typography variant="body2" className="text-neutral-600 mb-6">
                  Du har inga aktiva uppgifter just nu. Gå med i en klass för att få tillgång till quiz och läxor.
                </Typography>
                <Button asChild>
                  <Link href="/join/class">Gå med i klass</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Assignment Lists */}
          {!isLoading && !error && assignments.length > 0 && (
            <div className="space-y-8">
              {/* Upcoming Assignments */}
              {upcomingAssignments.length > 0 && (
                <div>
                  <Heading level={2} className="mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-warning-600" />
                    Pågående uppgifter
                  </Heading>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingAssignments.map(assignment => (
                      <AssignmentCard 
                        key={assignment.sessionId} 
                        assignment={assignment}
                        onUpdate={loadAssignments}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Overdue Assignments */}
              {overdueAssignments.length > 0 && (
                <div>
                  <Heading level={2} className="mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-error-600" />
                    Försenade uppgifter
                  </Heading>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {overdueAssignments.map(assignment => (
                      <AssignmentCard 
                        key={assignment.sessionId} 
                        assignment={assignment}
                        onUpdate={loadAssignments}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Assignments */}
              {completedAssignments.length > 0 && (
                <div>
                  <Heading level={2} className="mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-success-600" />
                    Klara uppgifter
                  </Heading>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedAssignments.map(assignment => (
                      <AssignmentCard 
                        key={assignment.sessionId} 
                        assignment={assignment}
                        onUpdate={loadAssignments}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  )
}