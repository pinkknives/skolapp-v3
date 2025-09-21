import { useEffect, useState } from 'react'
import { getAbly } from '@/lib/ablyClient'
import type { AnswerMsg } from '@/lib/realtime/quiz'

type AnswerEvent = AnswerMsg & {
  clientId: string
  receivedAt: number
}

export function useQuizAnswers(quizId: string) {
  const [answers, setAnswers] = useState<AnswerEvent[]>([])
  const [answerCounts, setAnswerCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!quizId) return

    const ably = getAbly('teacher-listener', 'teacher')
    const answersChannel = ably.channels.get(`quiz:${quizId}:answers`)

    const handleAnswerMessage = (msg: { name?: string; data?: unknown; clientId?: string }) => {
      if (msg.name === 'answer' && msg.data && msg.clientId) {
        const answerEvent: AnswerEvent = {
          ...(msg.data as AnswerMsg),
          clientId: msg.clientId,
          receivedAt: Date.now()
        }

        setAnswers(prev => [...prev, answerEvent])
        
        // Update answer counts by question
        setAnswerCounts(prev => ({
          ...prev,
          [(msg.data as AnswerMsg).questionId]: (prev[(msg.data as AnswerMsg).questionId] || 0) + 1
        }))
      }
    }

    const setupSubscription = async () => {
      try {
        await answersChannel.subscribe(handleAnswerMessage)
      } catch (error) {
        console.error('Error setting up answer subscription:', error)
      }
    }

    setupSubscription()

    return () => {
      answersChannel.unsubscribe(handleAnswerMessage)
      answersChannel.detach()
    }
  }, [quizId])

  const getAnswersForQuestion = (questionId: string) => {
    return answers.filter(answer => answer.questionId === questionId)
  }

  const getAnswerCountForQuestion = (questionId: string) => {
    return answerCounts[questionId] || 0
  }

  const clearAnswers = () => {
    setAnswers([])
    setAnswerCounts({})
  }

  return {
    answers,
    answerCounts,
    totalAnswers: answers.length,
    getAnswersForQuestion,
    getAnswerCountForQuestion,
    clearAnswers
  }
}