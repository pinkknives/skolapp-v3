'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import type { Question } from '@/types/quiz'
import { enhancedAIService, type AIInsight } from '@/lib/ai/enhanced-ai-service'

interface StudentAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
  timeSpent: number
}

interface AIInsightsPanelProps {
  questions: Question[]
  studentAnswers: StudentAnswer[]
  onClose: () => void
  onGenerateFollowUp?: (insights: AIInsight[]) => void
  className?: string
}

const insightIcons = {
  strength: <TrendingUp className="w-5 h-5 text-green-500" />,
  weakness: <TrendingDown className="w-5 h-5 text-red-500" />,
  suggestion: <Lightbulb className="w-5 h-5 text-blue-500" />,
  pattern: <Target className="w-5 h-5 text-purple-500" />
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
}

export function AIInsightsPanel({
  questions,
  studentAnswers,
  onClose,
  onGenerateFollowUp,
  className = ''
}: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)

  useEffect(() => {
    analyzePerformance()
  }, [questions, studentAnswers]) // eslint-disable-line react-hooks/exhaustive-deps

  const analyzePerformance = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const analysisInsights = await enhancedAIService.analyzeStudentPerformance(questions, studentAnswers)
      setInsights(analysisInsights)
    } catch (err) {
      console.error('AI analysis error:', err)
      setError('Kunde inte analysera prestationer just nu')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFollowUp = () => {
    if (onGenerateFollowUp) {
      onGenerateFollowUp(insights)
    }
  }

  const getInsightStats = () => {
    const stats = {
      strengths: insights.filter(i => i.type === 'strength').length,
      weaknesses: insights.filter(i => i.type === 'weakness').length,
      suggestions: insights.filter(i => i.type === 'suggestion').length,
      patterns: insights.filter(i => i.type === 'pattern').length
    }
    return stats
  }

  const stats = getInsightStats()

  if (loading) {
    return (
      <Card className={`w-full max-w-4xl ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
            <Typography variant="body1" className="ml-3">
              Analyserar elevprestationer...
            </Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`w-full max-w-4xl ${className}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <Typography variant="h6" className="mb-2 text-red-600">
              Analys misslyckades
            </Typography>
            <Typography variant="body2" className="text-muted-foreground mb-4">
              {error}
            </Typography>
            <Button onClick={analyzePerformance} variant="outline">
              Försök igen
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full max-w-4xl ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-primary-500" />
            <div>
              <CardTitle className="text-xl">AI-insikter</CardTitle>
              <Typography variant="body2" className="text-muted-foreground">
                Automatisk analys av elevprestationer
              </Typography>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <Typography variant="h6" className="text-green-700 dark:text-green-400">
              {stats.strengths}
            </Typography>
            <Typography variant="caption" className="text-green-600 dark:text-green-500">
              Styrkor
            </Typography>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <Typography variant="h6" className="text-red-700 dark:text-red-400">
              {stats.weaknesses}
            </Typography>
            <Typography variant="caption" className="text-red-600 dark:text-red-500">
              Förbättringsområden
            </Typography>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Lightbulb className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <Typography variant="h6" className="text-blue-700 dark:text-blue-400">
              {stats.suggestions}
            </Typography>
            <Typography variant="caption" className="text-blue-600 dark:text-blue-500">
              Förslag
            </Typography>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Target className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <Typography variant="h6" className="text-purple-700 dark:text-purple-400">
              {stats.patterns}
            </Typography>
            <Typography variant="caption" className="text-purple-600 dark:text-purple-500">
              Mönster
            </Typography>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          <Heading level={4} className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary-500" />
            Detaljerade insikter
          </Heading>
          
          <AnimatePresence>
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {insightIcons[insight.type]}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Typography variant="body1" className="font-semibold">
                          {insight.title}
                        </Typography>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[insight.priority]}`}>
                          {insight.priority}
                        </span>
                        {insight.actionable && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Handlingsbar
                          </span>
                        )}
                      </div>
                      <Typography variant="body2" className="text-muted-foreground">
                        {insight.description}
                      </Typography>
                      {insight.relatedQuestions && insight.relatedQuestions.length > 0 && (
                        <Typography variant="caption" className="text-primary-600 mt-2 block">
                          Relaterade frågor: {insight.relatedQuestions.length}
                        </Typography>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button onClick={analyzePerformance} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Uppdatera analys
          </Button>
          {onGenerateFollowUp && (
            <Button onClick={handleGenerateFollowUp} size="sm">
              <Lightbulb className="w-4 h-4 mr-2" />
              Generera uppföljning
            </Button>
          )}
        </div>
      </CardContent>

      {/* Insight Detail Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {insightIcons[selectedInsight.type]}
                  <div>
                    <Heading level={4}>{selectedInsight.title}</Heading>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[selectedInsight.priority]}`}>
                        {selectedInsight.priority}
                      </span>
                      {selectedInsight.actionable && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Handlingsbar
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button onClick={() => setSelectedInsight(null)} variant="ghost" size="sm">
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              <Typography variant="body1" className="mb-4">
                {selectedInsight.description}
              </Typography>
              
              {selectedInsight.relatedQuestions && selectedInsight.relatedQuestions.length > 0 && (
                <div className="mt-4">
                  <Typography variant="body2" className="font-semibold mb-2">
                    Relaterade frågor:
                  </Typography>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedInsight.relatedQuestions.map((questionId, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {questionId}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
