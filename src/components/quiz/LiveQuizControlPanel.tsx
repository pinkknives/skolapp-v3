'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Play, SkipForward, Square, Users, Loader2 } from 'lucide-react'
import { useQuizControl } from '@/hooks/useQuizControl'
import { useQuizAnswers } from '@/hooks/useQuizAnswers'
import { startQuiz, nextQuestion, endQuiz, joinRoom } from '@/lib/realtime/quiz'

interface LiveQuizControlPanelProps {
  quizId: string
  questions: Array<{ id: string; title: string }>
  teacherName: string
  className?: string
}

export function LiveQuizControlPanel({ 
  quizId, 
  questions, 
  teacherName,
  className = ''
}: LiveQuizControlPanelProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false)

  const { state, participants, isConnected, studentCount } = useQuizControl(quizId, 'teacher')
  const { getAnswerCountForQuestion } = useQuizAnswers(quizId)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex >= questions.length - 1

  // Auto-join room when component mounts
  React.useEffect(() => {
    if (!hasJoinedRoom && quizId && teacherName) {
      joinRoom(quizId, 'teacher', teacherName)
        .then(() => setHasJoinedRoom(true))
        .catch(console.error)
    }
  }, [quizId, teacherName, hasJoinedRoom])

  const handleStartQuiz = async () => {
    setIsLoading('start')
    try {
      await startQuiz(quizId)
      if (questions.length > 0) {
        await nextQuestion(quizId, questions[0].id)
        setCurrentQuestionIndex(0)
      }
    } catch (error) {
      console.error('Error starting quiz:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleNextQuestion = async () => {
    if (isLastQuestion) return
    
    setIsLoading('next')
    try {
      const nextIndex = currentQuestionIndex + 1
      await nextQuestion(quizId, questions[nextIndex].id)
      setCurrentQuestionIndex(nextIndex)
    } catch (error) {
      console.error('Error going to next question:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleEndQuiz = async () => {
    setIsLoading('end')
    try {
      await endQuiz(quizId)
    } catch (error) {
      console.error('Error ending quiz:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const currentAnswerCount = currentQuestion 
    ? getAnswerCountForQuestion(currentQuestion.id) 
    : 0

  const responseRate = studentCount > 0 
    ? Math.round((currentAnswerCount / studentCount) * 100) 
    : 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Typography variant="body2" className="text-neutral-600">
                {isConnected ? 'Ansluten till realtid' : 'Ansluter till realtid...'}
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-neutral-500" />
              <Typography variant="body2" className="text-neutral-600">
                {studentCount} elever anslutna
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz-kontroller</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.phase === 'idle' && (
            <Button
              onClick={handleStartQuiz}
              disabled={!isConnected || isLoading === 'start' || questions.length === 0}
              className="w-full"
            >
              {isLoading === 'start' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Starta quiz
            </Button>
          )}

          {state.phase === 'running' && (
            <div className="space-y-3">
              <div className="text-center">
                <Typography variant="body1" className="font-medium">
                  Fråga {currentQuestionIndex + 1} av {questions.length}
                </Typography>
                {currentQuestion && (
                  <Typography variant="body2" className="text-neutral-600 mt-1">
                    {currentQuestion.title}
                  </Typography>
                )}
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="body2" className="text-neutral-600">
                    Svar mottagna
                  </Typography>
                  <Typography variant="body2" className="font-medium">
                    {currentAnswerCount} / {studentCount} ({responseRate}%)
                  </Typography>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(responseRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {!isLastQuestion && (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={isLoading === 'next'}
                    variant="outline"
                    className="flex-1"
                  >
                    {isLoading === 'next' ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <SkipForward className="w-4 h-4 mr-2" />
                    )}
                    Nästa fråga
                  </Button>
                )}
                <Button
                  onClick={handleEndQuiz}
                  disabled={isLoading === 'end'}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading === 'end' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Square className="w-4 h-4 mr-2" />
                  )}
                  Avsluta quiz
                </Button>
              </div>
            </div>
          )}

          {state.phase === 'ended' && (
            <div className="text-center py-4">
              <Typography variant="body1" className="font-medium text-green-600">
                Quiz avslutad
              </Typography>
              <Typography variant="body2" className="text-neutral-600 mt-1">
                Alla svar har samlats in
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants List */}
      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deltagare ({participants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {participants.map((participant, index) => (
                <div 
                  key={`${participant.clientId}-${index}`}
                  className="flex items-center justify-between p-2 bg-neutral-50 rounded"
                >
                  <Typography variant="body2">
                    {participant.data.name}
                  </Typography>
                  <Typography variant="caption" className="text-neutral-500">
                    {participant.data.role === 'teacher' ? 'Lärare' : 'Elev'}
                  </Typography>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}