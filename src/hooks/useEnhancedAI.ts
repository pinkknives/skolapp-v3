'use client'

import { useState, useCallback } from 'react'
import type { Question } from '@/types/quiz'
import type { EnhancedAIParams, AIInsight, AdaptiveQuestion } from '@/lib/ai/enhanced-ai-service'

interface StudentProfile {
  strengths: string[]
  weaknesses: string[]
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  interests: string[]
  previousPerformance: number
  averageTimePerQuestion?: number
  commonMistakes?: string[]
}

interface StudentAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
  timeSpent: number
}

export function useEnhancedAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateAdaptiveQuestions = useCallback(async (params: EnhancedAIParams): Promise<AdaptiveQuestion[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/enhanced-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate questions')
      }

      const data = await response.json()
      return data.questions || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const generatePersonalizedQuestions = useCallback(async (
    studentProfile: StudentProfile,
    params: EnhancedAIParams
  ): Promise<AdaptiveQuestion[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/enhanced-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentProfile,
          params
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate personalized questions')
      }

      const data = await response.json()
      return data.questions || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const analyzeStudentPerformance = useCallback(async (
    questions: Question[],
    answers: StudentAnswer[]
  ): Promise<AIInsight[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: questions.map(q => ({
            id: q.id,
            type: q.type,
            title: q.type === 'multiple-choice' ? (q as { title: string }).title : (q as { title: string }).title,
            points: q.points
          })),
          answers
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze performance')
      }

      const data = await response.json()
      return data.insights || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const generateFollowUpQuestions = useCallback(async (
    insights: AIInsight[],
    baseParams: EnhancedAIParams
  ): Promise<AdaptiveQuestion[]> => {
    setLoading(true)
    setError(null)
    
    try {
      // Extract weaknesses and suggestions from insights
      const weaknesses = insights
        .filter(i => i.type === 'weakness')
        .map(i => i.description)
      
      const suggestions = insights
        .filter(i => i.type === 'suggestion')
        .map(i => i.description)

      // Create enhanced parameters based on insights
      const enhancedParams: EnhancedAIParams = {
        ...baseParams,
        extraContext: `${baseParams.extraContext || ''}\n\nFokusera på följande förbättringsområden: ${weaknesses.join(', ')}\n\nFörslag: ${suggestions.join(', ')}`,
        difficulty: weaknesses.length > 2 ? 'lätt' : baseParams.difficulty, // Easier questions if many weaknesses
        count: Math.min(baseParams.count + 2, 20) // Add a few more questions
      }

      return await generateAdaptiveQuestions(enhancedParams)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [generateAdaptiveQuestions])

  return {
    loading,
    error,
    generateAdaptiveQuestions,
    generatePersonalizedQuestions,
    analyzeStudentPerformance,
    generateFollowUpQuestions,
    clearError: () => setError(null)
  }
}
