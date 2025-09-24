'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { 
  Brain, 
  Zap, 
  Target, 
  BarChart3, 
  Lightbulb,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react'
import { AdaptiveQuestionGenerator } from './AdaptiveQuestionGenerator'
import { AIInsightsPanel } from './AIInsightsPanel'
import { useEnhancedAI } from '@/hooks/useEnhancedAI'
import type { Question } from '@/types/quiz'
import type { AIInsight, AdaptiveQuestion } from '@/lib/ai/enhanced-ai-service'

interface StudentProfile {
  strengths: string[]
  weaknesses: string[]
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  interests: string[]
  previousPerformance: number
  averageTimePerQuestion: number
  commonMistakes: string[]
}

interface StudentAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
  timeSpent: number
}

interface EnhancedAIAssistantProps {
  quiz: {
    id: string
    title: string
    questions: Question[]
  }
  studentAnswers?: StudentAnswer[]
  onQuestionsGenerated: (questions: Question[]) => void
  onClose: () => void
  className?: string
}

type AssistantMode = 'generate' | 'analyze' | 'insights' | 'adaptive'

export function EnhancedAIAssistant({
  quiz,
  studentAnswers = [],
  onQuestionsGenerated,
  onClose,
  className = ''
}: EnhancedAIAssistantProps) {
  const [mode, setMode] = useState<AssistantMode>('generate')
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<AdaptiveQuestion[]>([])
  const [studentProfile] = useState<StudentProfile | undefined>(undefined)
  
  const {
    loading,
    error,
    analyzeStudentPerformance,
    generateFollowUpQuestions,
    clearError
  } = useEnhancedAI()

  // Analyze performance when student answers are available
  useEffect(() => {
    if (studentAnswers.length > 0 && mode === 'analyze') {
      handleAnalyzePerformance()
    }
  }, [studentAnswers, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnalyzePerformance = async () => {
    try {
      const analysisInsights = await analyzeStudentPerformance(quiz.questions, studentAnswers)
      setInsights(analysisInsights)
      setMode('insights')
    } catch (err) {
      console.error('Analysis failed:', err)
    }
  }

  const handleGenerateFollowUp = async (insights: AIInsight[]) => {
    try {
      const baseParams = {
        subject: 'Matematik', // This should come from quiz context
        grade: '6',
        difficulty: 'medel' as const,
        count: 5,
        type: 'mixed' as const
      }
      
      const followUpQuestions = await generateFollowUpQuestions(insights, baseParams)
      setAdaptiveQuestions(followUpQuestions)
      setMode('adaptive')
    } catch (err) {
      console.error('Follow-up generation failed:', err)
    }
  }

  const handleAcceptAdaptiveQuestions = () => {
    const questions = adaptiveQuestions.map(aq => aq.question)
    onQuestionsGenerated(questions)
    onClose()
  }

  const getPerformanceStats = () => {
    if (studentAnswers.length === 0) return null
    
    const totalQuestions = studentAnswers.length
    const correctAnswers = studentAnswers.filter(a => a.isCorrect).length
    const averageTime = studentAnswers.reduce((sum, a) => sum + a.timeSpent, 0) / totalQuestions
    const accuracy = (correctAnswers / totalQuestions) * 100
    
    return {
      totalQuestions,
      correctAnswers,
      accuracy: Math.round(accuracy),
      averageTime: Math.round(averageTime)
    }
  }

  const stats = getPerformanceStats()

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 text-primary-500" />
                <div>
                  <CardTitle className="text-xl">Förbättrad AI-assistent</CardTitle>
                  <Typography variant="body2" className="text-muted-foreground">
                    Intelligenta frågor och insikter för bättre lärande
                  </Typography>
                </div>
              </div>
              <Button onClick={onClose} variant="ghost" size="sm">
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => setMode('generate')}
                variant={mode === 'generate' ? 'primary' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Zap className="w-5 h-5" />
                <span className="text-sm">Generera frågor</span>
              </Button>
              
              {studentAnswers.length > 0 && (
                <Button
                  onClick={() => setMode('analyze')}
                  variant={mode === 'analyze' ? 'primary' : 'outline'}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm">Analysera prestationer</span>
                </Button>
              )}
              
              {insights.length > 0 && (
                <Button
                  onClick={() => setMode('insights')}
                  variant={mode === 'insights' ? 'primary' : 'outline'}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Lightbulb className="w-5 h-5" />
                  <span className="text-sm">AI-insikter</span>
                </Button>
              )}
              
              {adaptiveQuestions.length > 0 && (
                <Button
                  onClick={() => setMode('adaptive')}
                  variant={mode === 'adaptive' ? 'primary' : 'outline'}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Target className="w-5 h-5" />
                  <span className="text-sm">Adaptiva frågor</span>
                </Button>
              )}
            </div>

            {/* Performance Overview */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <Typography variant="h6" className="text-green-600 dark:text-green-400">
                    {stats.accuracy}%
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    Korrekthet
                  </Typography>
                </div>
                <div className="text-center">
                  <Typography variant="h6" className="text-blue-600 dark:text-blue-400">
                    {stats.correctAnswers}/{stats.totalQuestions}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    Rätt svar
                  </Typography>
                </div>
                <div className="text-center">
                  <Typography variant="h6" className="text-purple-600 dark:text-purple-400">
                    {stats.averageTime}s
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    Snittid
                  </Typography>
                </div>
                <div className="text-center">
                  <Typography variant="h6" className="text-orange-600 dark:text-orange-400">
                    {insights.length}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    Insikter
                  </Typography>
                </div>
              </div>
            )}

            {/* Content Area */}
            <AnimatePresence mode="wait">
              {mode === 'generate' && (
                <motion.div
                  key="generate"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <AdaptiveQuestionGenerator
                    onQuestionsGenerated={onQuestionsGenerated}
                    onClose={onClose}
                    studentProfile={studentProfile}
                  />
                </motion.div>
              )}

              {mode === 'analyze' && (
                <motion.div
                  key="analyze"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-center py-12"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-16 h-16 animate-spin text-primary-500 mx-auto mb-4" />
                      <Typography variant="h6" className="mb-2">
                        Analyserar prestationer...
                      </Typography>
                      <Typography variant="body2" className="text-muted-foreground">
                        AI:n granskar svar och identifierar mönster
                      </Typography>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                      <Typography variant="h6" className="mb-2">
                        Analys klar!
                      </Typography>
                      <Typography variant="body2" className="text-muted-foreground mb-4">
                        Klicka på &quot;AI-insikter&quot; för att se resultatet
                      </Typography>
                      <Button onClick={() => setMode('insights')}>
                        Visa insikter
                      </Button>
                    </>
                  )}
                </motion.div>
              )}

              {mode === 'insights' && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <AIInsightsPanel
                    questions={quiz.questions}
                    studentAnswers={studentAnswers}
                    onClose={onClose}
                    onGenerateFollowUp={handleGenerateFollowUp}
                  />
                </motion.div>
              )}

              {mode === 'adaptive' && (
                <motion.div
                  key="adaptive"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <Heading level={4} className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary-500" />
                      Adaptiva uppföljningsfrågor
                    </Heading>
                    <Button onClick={() => setMode('generate')} variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generera nya
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {adaptiveQuestions.map((aq, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                        <Typography variant="body1" className="font-semibold mb-2">
                          {aq.question.type === 'multiple-choice' 
                            ? (aq.question as { title: string }).title 
                            : (aq.question as { title: string }).title
                          }
                            </Typography>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {aq.learningObjective}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{aq.estimatedTime}s</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span>Svårighet: {aq.difficulty}/10</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {aq.prerequisites.length > 0 && (
                          <div className="mt-2">
                            <Typography variant="caption" className="text-muted-foreground">
                              Förkunskaper: {aq.prerequisites.join(', ')}
                            </Typography>
                          </div>
                        )}
                        
                        {aq.followUpSuggestions.length > 0 && (
                          <div className="mt-2">
                            <Typography variant="caption" className="text-primary-600">
                              Uppföljning: {aq.followUpSuggestions.join(', ')}
                            </Typography>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button onClick={() => setMode('insights')} variant="outline">
                      Tillbaka till insikter
                    </Button>
                    <Button onClick={handleAcceptAdaptiveQuestions} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Acceptera frågor
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <Typography variant="body2" className="font-semibold">
                    Ett fel uppstod
                  </Typography>
                </div>
                <Typography variant="body2" className="text-red-600 dark:text-red-400 mt-1">
                  {error}
                </Typography>
                <Button onClick={clearError} variant="outline" size="sm" className="mt-2">
                  Stäng
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
