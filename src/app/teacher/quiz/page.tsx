'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import { QuizStatus } from '@/types/quiz'
import { getOrganizationQuizzes, updateQuizWithOrganization, deleteQuizWithOrganization } from '@/lib/quiz-utils'
import { getUserOrganizations, Organization } from '@/lib/orgs'
import Link from 'next/link'
import { Plus, Share2, Play, BarChart3, HelpCircle, Edit, Copy, Archive } from 'lucide-react'

// Database quiz interface (simplified from Supabase)
interface DatabaseQuiz {
  id: string
  title: string
  description?: string
  status: 'draft' | 'published'
  join_code?: string
  owner_id: string
  org_id?: string
  created_at: string
  updated_at: string
}

export default function QuizManagementPage() {
  const [quizzes, setQuizzes] = useState<DatabaseQuiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<DatabaseQuiz | null>(null)
  const [showSharing, setShowSharing] = useState(false)
  const [showReviewMode, setShowReviewMode] = useState(false)
  const [filterStatus, setFilterStatus] = useState<QuizStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Organization-related state
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  useEffect(() => {
    loadOrganizations()
  }, [])

  useEffect(() => {
    if (!loadingOrgs) {
      loadQuizzes()
    }
  }, [selectedOrgId, loadingOrgs])

  const loadOrganizations = async () => {
    try {
      setLoadingOrgs(true)
      const { data, error } = await getUserOrganizations()
      if (error) {
        console.error('Error loading organizations:', error)
        return
      }
      
      setOrganizations(data || [])
      
      // Auto-select first organization if available
      if (data && data.length > 0) {
        setSelectedOrgId(data[0].id)
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    } finally {
      setLoadingOrgs(false)
    }
  }

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await getOrganizationQuizzes(selectedOrgId || undefined)
      if (error) {
        setError('Kunde inte ladda quiz: ' + error.message)
        return
      }
      setQuizzes(data || [])
    } catch (err) {
      setError('Ett oväntat fel inträffade vid laddning av quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId)
  }

  // Sort quizzes by last updated (senaste uppdaterade överst)
  const sortedQuizzes = [...quizzes].sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )

  const filteredQuizzes = filterStatus === 'all' 
    ? sortedQuizzes 
    : sortedQuizzes.filter(quiz => quiz.status === filterStatus)

  const getStatusColor = (status: QuizStatus) => {
    switch (status) {
      case 'published':
        return 'text-success-700 bg-success-100'
      case 'draft':
        return 'text-warning-700 bg-warning-100'
      case 'archived':
        return 'text-neutral-700 bg-neutral-100'
      default:
        return 'text-neutral-700 bg-neutral-100'
    }
  }

  const getStatusText = (status: QuizStatus) => {
    switch (status) {
      case 'published':
        return 'Publikt'
      case 'draft':
        return 'Utkast'
      case 'archived':
        return 'Arkiverat'
      default:
        return status
    }
  }

  const handleShareQuiz = (quiz: DatabaseQuiz) => {
    setSelectedQuiz(quiz)
    setShowSharing(true)
  }

  const handleReviewMode = (quiz: DatabaseQuiz) => {
    setSelectedQuiz(quiz)
    setShowReviewMode(true)
  }

  const handlePublishQuiz = async (quiz: DatabaseQuiz) => {
    try {
      const { error } = await updateQuizWithOrganization(quiz.id, { status: 'published' })
      if (error) {
        setError('Kunde inte publicera quiz: ' + error.message)
        return
      }
      await loadQuizzes() // Reload to get updated status
    } catch (err) {
      setError('Ett oväntat fel inträffade vid publicering av quiz')
    }
  }

  const handleUnpublishQuiz = async (quiz: DatabaseQuiz) => {
    try {
      const { error } = await updateQuizWithOrganization(quiz.id, { status: 'draft' })
      if (error) {
        setError('Kunde inte avpublicera quiz: ' + error.message)
        return
      }
      await loadQuizzes() // Reload to get updated status
    } catch (err) {
      setError('Ett oväntat fel inträffade vid avpublicering av quiz')
    }
  }

  const handleArchiveQuiz = async (quiz: DatabaseQuiz) => {
    if (!confirm(`Är du säker på att du vill arkivera &quot;${quiz.title}&quot;?`)) return
    
    try {
      // For now, we'll delete the quiz since we don't have an archived status in the migration
      const { error } = await deleteQuizWithOrganization(quiz.id)
      if (error) {
        setError('Kunde inte arkivera quiz: ' + error.message)
        return
      }
      await loadQuizzes() // Reload to remove deleted quiz
    } catch (err) {
      setError('Ett oväntat fel inträffade vid arkivering av quiz')
    }
  }

  if (showReviewMode && selectedQuiz) {
    // For now, we'll just close review mode since we don't have the component implemented for database quizzes
    return (
      <Layout>
        <Section spacing="lg">
          <Container>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">
                  Granskningsläge för &quot;{selectedQuiz.title}&quot;
                </Typography>
                <Typography variant="body1" className="mb-4">
                  Denna funktion är under utveckling.
                </Typography>
                <Button onClick={() => {
                  setShowReviewMode(false)
                  setSelectedQuiz(null)
                }}>
                  Tillbaka till quiz-lista
                </Button>
              </CardContent>
            </Card>
          </Container>
        </Section>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <Section spacing="lg">
          <Container>
            <div className="text-center">
              <Typography variant="body1">Laddar quiz...</Typography>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout>
      <Section spacing="lg">
        <Container>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Heading level={1} className="mb-2">
                  Mina Quiz
                </Heading>
                <Typography variant="subtitle1" className="text-neutral-600">
                  Hantera dina quiz, se statistik och dela med dina elever.
                </Typography>
              </div>
              <Button 
                asChild 
                leftIcon={<Plus size={16} />}
              >
                <Link href="/teacher/quiz/create">
                  Skapa nytt quiz
                </Link>
              </Button>
            </div>
          </div>

          {error && (
            <Card className="mb-6">
              <CardContent>
                <Typography variant="body1" color="error">{error}</Typography>
                <Button onClick={() => {
                  setError(null)
                  loadQuizzes()
                }} className="mt-2" size="sm">
                  Försök igen
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Organization Selection */}
          {!loadingOrgs && organizations.length > 1 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Typography variant="body2" className="font-medium text-neutral-700">
                    Organisation:
                  </Typography>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => handleOrgChange(e.target.value)}
                    className="px-3 py-1 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show current organization for single org users */}
          {!loadingOrgs && organizations.length === 1 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Typography variant="body2" className="font-medium text-neutral-700">
                    Organisation:
                  </Typography>
                  <Typography variant="body2" className="text-neutral-600">
                    {organizations[0].name}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter Controls */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Alla ({quizzes.length})
              </button>
              <button
                onClick={() => setFilterStatus('published')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'published'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Publicerade ({quizzes.filter(q => q.status === 'published').length})
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'draft'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Utkast ({quizzes.filter(q => q.status === 'draft').length})
              </button>
            </div>
          </div>

          {/* Quiz Grid */}
          {filteredQuizzes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle size={32} className="text-neutral-400" />
                </div>
                {quizzes.length === 0 ? (
                  <>
                    <Typography variant="h6" className="mb-2">
                      Inga quiz ännu
                    </Typography>
                    <Typography variant="body2" className="text-neutral-600 mb-4">
                      Skapa ditt första quiz för att komma igång.
                    </Typography>
                    <Button asChild>
                      <Link href="/teacher/quiz/create">
                        Skapa nytt quiz
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" className="mb-2">
                      Inga quiz matchar filtret
                    </Typography>
                    <Typography variant="body2" className="text-neutral-600">
                      Prova att ändra filtret för att se fler quiz.
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <Card key={quiz.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {quiz.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {quiz.description || 'Ingen beskrivning'}
                        </CardDescription>
                      </div>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status as QuizStatus)}`}>
                        {getStatusText(quiz.status as QuizStatus)}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-neutral-500">
                      <div>Skapad: {new Date(quiz.created_at).toLocaleDateString('sv-SE')}</div>
                      {quiz.join_code && (
                        <div>Delningskod: <span className="font-mono font-bold">{quiz.join_code}</span></div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardFooter className="mt-auto">
                    <div className="flex flex-wrap gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link href={`/teacher/quiz/${quiz.id}/edit`}>
                          <Edit size={14} />
                          <span className="ml-1">Redigera</span>
                        </Link>
                      </Button>
                      
                      {quiz.status === 'published' && quiz.join_code && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareQuiz(quiz)}
                          className="flex-1"
                        >
                          <Share2 size={14} />
                          <span className="ml-1">Dela</span>
                        </Button>
                      )}
                      
                      {quiz.status === 'draft' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublishQuiz(quiz)}
                          className="flex-1"
                        >
                          <Play size={14} />
                          <span className="ml-1">Publicera</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnpublishQuiz(quiz)}
                          className="flex-1"
                        >
                          <span className="ml-1">Avpublicera</span>
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchiveQuiz(quiz)}
                        className="text-error-600 hover:text-error-700 hover:bg-error-50"
                      >
                        <Archive size={14} />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Sharing Modal */}
          {showSharing && selectedQuiz && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <Typography variant="h6" className="mb-4">
                    Dela &quot;{selectedQuiz.title}&quot;
                  </Typography>
                  {selectedQuiz.join_code ? (
                    <div>
                      <Typography variant="body1" className="mb-2">
                        Delningskod: <span className="font-mono font-bold text-lg">{selectedQuiz.join_code}</span>
                      </Typography>
                      <Typography variant="body2" className="text-neutral-600 mb-4">
                        Dela denna kod med dina elever så de kan gå med i quizet.
                      </Typography>
                    </div>
                  ) : (
                    <Typography variant="body1" className="mb-4">
                      Detta quiz har ingen delningskod ännu.
                    </Typography>
                  )}
                  <Button 
                    onClick={() => {
                      setShowSharing(false)
                      setSelectedQuiz(null)
                    }}
                  >
                    Stäng
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  )
}