'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SessionOverview, StudentResult, QuestionAnalysis, AttemptDetail, AIInsightResponse } from '@/types/quiz'
import { motion } from 'framer-motion'
import { Download, Eye, FileText, BarChart3, Users, TrendingUp, Brain, AlertCircle, CheckCircle, Info, Lightbulb } from 'lucide-react'

export default function SessionResultsPage() {
  const params = useParams()
  const sessionId = params?.id as string

  const [overview, setOverview] = useState<SessionOverview | null>(null)
  const [students, setStudents] = useState<StudentResult[]>([])
  const [questions, setQuestions] = useState<QuestionAnalysis[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [attemptDetail, setAttemptDetail] = useState<AttemptDetail | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsightResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  // Load data when component mounts
  useEffect(() => {
    if (!sessionId) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load overview, students, and questions in parallel
        const [overviewRes, studentsRes, questionsRes] = await Promise.all([
          fetch(`/api/sessions/${sessionId}/results/overview`),
          fetch(`/api/sessions/${sessionId}/results/students`),
          fetch(`/api/sessions/${sessionId}/results/questions`)
        ])

        if (!overviewRes.ok || !studentsRes.ok || !questionsRes.ok) {
          throw new Error('Ett fel uppstod vid hämtning av resultat')
        }

        const overviewData = await overviewRes.json()
        const studentsData = await studentsRes.json()
        const questionsData = await questionsRes.json()

        if (overviewData.success) setOverview(overviewData.data)
        if (studentsData.success) setStudents(studentsData.data)
        if (questionsData.success) setQuestions(questionsData.data)
      } catch (err) {
        console.error('Error loading results:', err)
        setError(err instanceof Error ? err.message : 'Ett fel uppstod')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [sessionId])

  // Load attempt detail when student is selected
  useEffect(() => {
    if (!selectedStudent || !sessionId) return

    const loadAttemptDetail = async () => {
      try {
        const attemptId = `${sessionId}:${selectedStudent}`
        const response = await fetch(`/api/attempts/${attemptId}`)
        
        if (!response.ok) {
          throw new Error('Ett fel uppstod vid hämtning av försöksdetaljer')
        }

        const data = await response.json()
        if (data.success) {
          setAttemptDetail(data.data)
        }
      } catch (err) {
        console.error('Error loading attempt detail:', err)
      }
    }

    loadAttemptDetail()
  }, [selectedStudent, sessionId])

  // Generate AI insights
  const handleGenerateInsights = async () => {
    if (!sessionId) return

    try {
      setAiLoading(true)
      const response = await fetch(`/api/sessions/${sessionId}/ai-insight`, {
        method: 'POST'
      })

      if (!response.ok) {
        if (response.status === 403) {
          alert('AI-analys är inte aktiverat på denna installation.')
          return
        }
        throw new Error('AI-insikter kunde inte genereras')
      }

      const data = await response.json()
      if (data.success) {
        setAiInsights(data.data)
      }
    } catch (err) {
      console.error('AI insights error:', err)
      alert('Ett fel uppstod vid generering av AI-insikter. Försök igen.')
    } finally {
      setAiLoading(false)
    }
  }

  // Get icon for insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'concern': return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'opportunity': return <Lightbulb className="w-5 h-5 text-yellow-600" />
      default: return <Info className="w-5 h-5 text-blue-600" />
    }
  }
  const handleExport = async (allAttempts = false) => {
    if (!sessionId) return

    try {
      setExportLoading(true)
      const url = `/api/sessions/${sessionId}/export?allAttempts=${allAttempts}`
      
      // Create a temporary link to download the file
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Export misslyckades')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = response.headers.get('content-disposition')?.split('filename=')[1] || 'resultat.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Export error:', err)
      alert('Export misslyckades. Försök igen.')
    } finally {
      setExportLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <Container>
          <Section>
            <div className="flex items-center justify-center min-h-64">
              <Typography>Laddar resultat...</Typography>
            </div>
          </Section>
        </Container>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <Container>
          <Section>
            <Card>
              <CardContent>
                <Typography variant="body1" className="text-red-600">
                  {error}
                </Typography>
              </CardContent>
            </Card>
          </Section>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container>
        <Section>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Heading level={1} className="mb-2">
                  Resultat & Analys
                </Heading>
                <Typography variant="body1" className="text-neutral-600">
                  Detaljerad översikt av elevprestationer och frågeanalys
                </Typography>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleGenerateInsights}
                  disabled={aiLoading}
                  className="flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  {aiLoading ? 'Genererar...' : 'AI-insikter'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport(false)}
                  disabled={exportLoading}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {exportLoading ? 'Exporterar...' : 'Exportera CSV'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport(true)}
                  disabled={exportLoading}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Alla försök
                </Button>
              </div>
            </div>
          </motion.div>

          {/* AI Insights */}
          {aiInsights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI-insikter
                  </CardTitle>
                  <CardDescription>
                    Automatiskt genererade insikter baserade på elevernas prestationer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiInsights.insights.map((insight, index) => (
                      <div key={index} className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <Typography variant="subtitle1" className="font-medium mb-1">
                              {insight.title}
                            </Typography>
                            <Typography variant="body2" className="text-neutral-700 mb-2">
                              {insight.description}
                            </Typography>
                            <Typography variant="caption" className="text-neutral-600 bg-neutral-50 px-2 py-1 rounded">
                              💡 {insight.action}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Typography variant="caption" className="text-yellow-800 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {aiInsights.disclaimer}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Overview */}
          {overview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Översikt
                  </CardTitle>
                  <CardDescription>
                    Sammanfattning av sessionens resultat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Typography variant="h3" className="mb-1">
                        {overview.totalParticipants}
                      </Typography>
                      <Typography variant="caption" className="text-neutral-600">
                        Deltagare
                      </Typography>
                    </div>
                    <div className="text-center">
                      <Typography variant="h3" className="mb-1">
                        {overview.submittedCount}
                      </Typography>
                      <Typography variant="caption" className="text-neutral-600">
                        Inskickade
                      </Typography>
                    </div>
                    <div className="text-center">
                      <Typography variant="h3" className="mb-1">
                        {overview.avgScore.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" className="text-neutral-600">
                        Medelpoäng
                      </Typography>
                    </div>
                    <div className="text-center">
                      <Typography variant="h3" className="mb-1">
                        {overview.completionRate.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" className="text-neutral-600">
                        Färdigställda
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Students Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Elevresultat
                </CardTitle>
                <CardDescription>
                  Detaljerade resultat per elev
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-2">Elev</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Poäng</th>
                        <th className="text-left py-3 px-2">Frågor</th>
                        <th className="text-left py-3 px-2">Försök</th>
                        <th className="text-left py-3 px-2">Senaste aktivitet</th>
                        <th className="text-left py-3 px-2">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.userId} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="py-3 px-2">
                            <Typography variant="body2" className="font-medium">
                              {student.displayName}
                            </Typography>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              student.status === 'submitted' ? 'bg-green-100 text-green-800' :
                              student.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              student.status === 'late' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {student.status === 'submitted' ? 'Inskickad' :
                               student.status === 'in_progress' ? 'Pågår' :
                               student.status === 'late' ? 'Försenad' :
                               'Ej startat'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <Typography variant="body2">
                              {student.bestScore}
                            </Typography>
                          </td>
                          <td className="py-3 px-2">
                            <Typography variant="body2">
                              {student.questionsAttempted}
                            </Typography>
                          </td>
                          <td className="py-3 px-2">
                            <Typography variant="body2">
                              {student.totalAttempts}
                            </Typography>
                          </td>
                          <td className="py-3 px-2">
                            <Typography variant="caption" className="text-neutral-600">
                              {student.lastActivityAt ? 
                                new Date(student.lastActivityAt).toLocaleString('sv-SE') : 
                                'Ingen aktivitet'}
                            </Typography>
                          </td>
                          <td className="py-3 px-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStudent(student.userId)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Granska
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Question Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Frågeanalys
                </CardTitle>
                <CardDescription>
                  Prestationsöversikt per fråga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.questionId} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <div className="flex-1">
                          <Typography variant="subtitle1" className="font-medium mb-1">
                            {question.questionTitle}
                          </Typography>
                          <Typography variant="caption" className="text-neutral-600">
                            {question.questionType} • {question.questionPoints} poäng
                          </Typography>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
                          <div className="text-center">
                            <Typography variant="body2" className="font-medium">
                              {question.correctRate}%
                            </Typography>
                            <Typography variant="caption" className="text-neutral-600">
                              Rätt
                            </Typography>
                          </div>
                          <div className="text-center">
                            <Typography variant="body2">
                              {question.correctCount}/{question.totalAttempts}
                            </Typography>
                            <Typography variant="caption" className="text-neutral-600">
                              Försök
                            </Typography>
                          </div>
                          {question.avgTimeSeconds && (
                            <div className="text-center">
                              <Typography variant="body2">
                                {Math.round(question.avgTimeSeconds)}s
                              </Typography>
                              <Typography variant="caption" className="text-neutral-600">
                                Tid
                              </Typography>
                            </div>
                          )}
                        </div>
                      </div>
                      <ProgressBar 
                        value={question.correctRate} 
                        className="w-full"
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attempt Detail Modal */}
          {selectedStudent && attemptDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedStudent(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <Typography variant="h3" className="mb-1">
                        {attemptDetail.participantName}
                      </Typography>
                      <Typography variant="body2" className="text-neutral-600">
                        {attemptDetail.totalScore}/{attemptDetail.maxPossibleScore} poäng ({attemptDetail.percentage}%)
                      </Typography>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedStudent(null)}
                    >
                      Stäng
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {attemptDetail.questions.map((q) => (
                      <div key={q.questionIndex} className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Typography variant="subtitle1" className="font-medium">
                            {q.questionTitle}
                          </Typography>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              q.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {q.isCorrect ? 'Rätt' : 'Fel'}
                            </span>
                            <Typography variant="body2">
                              {q.score}/{q.questionPoints}p
                            </Typography>
                          </div>
                        </div>
                        
                        {q.studentAnswer && (
                          <div className="mb-2">
                            <Typography variant="caption" className="text-neutral-600 block mb-1">
                              Elevens svar:
                            </Typography>
                            <Typography variant="body2" className="bg-neutral-50 p-2 rounded">
                              {q.studentAnswer}
                            </Typography>
                          </div>
                        )}

                        {attemptDetail.canRevealAnswers && q.correctAnswer && (
                          <div className="mb-2">
                            <Typography variant="caption" className="text-neutral-600 block mb-1">
                              Korrekt svar:
                            </Typography>
                            <Typography variant="body2" className="bg-green-50 p-2 rounded">
                              {q.correctAnswer}
                            </Typography>
                          </div>
                        )}

                        {q.timeSpentSeconds && (
                          <Typography variant="caption" className="text-neutral-600">
                            Tid: {q.timeSpentSeconds}s
                          </Typography>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </Section>
      </Container>
    </Layout>
  )
}