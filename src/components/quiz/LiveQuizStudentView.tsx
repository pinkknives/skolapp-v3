'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Clock, CheckCircle, Loader2, Users } from 'lucide-react'
import { useQuizControl } from '@/hooks/useQuizControl'
import { submitAnswer, joinRoom } from '@/lib/realtime/quiz'

interface Question {
  id: string
  title: string
  type: 'multiple-choice' | 'free-text'
  options?: Array<{ id: string; text: string }>
}

interface LiveQuizStudentViewProps {
  quizId: string
  questions: Question[]
  studentName: string
  className?: string
}

export function LiveQuizStudentView({ 
  quizId, 
  questions, 
  studentName,
  className = ''
}: LiveQuizStudentViewProps) {
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState<string>('')
  const [submittedAnswers, setSubmittedAnswers] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { state, isConnected, studentCount } = useQuizControl(quizId, 'student')

  // Auto-join room when component mounts
  useEffect(() => {
    if (!hasJoinedRoom && quizId && studentName) {
      joinRoom(quizId, 'student', studentName)
        .then(() => setHasJoinedRoom(true))
        .catch(console.error)
    }
  }, [quizId, studentName, hasJoinedRoom])

  // Reset current answer when question changes
  useEffect(() => {
    if (state.questionId) {
      setCurrentAnswer('')
    }
  }, [state.questionId])

  const currentQuestion = questions.find(q => q.id === state.questionId)
  const hasSubmittedCurrent = currentQuestion ? submittedAnswers.has(currentQuestion.id) : false

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !currentAnswer.trim() || hasSubmittedCurrent) return

    setIsSubmitting(true)
    try {
      await submitAnswer(quizId, {
        questionId: currentQuestion.id,
        answer: currentAnswer,
        timestamp: Date.now()
      })
      
      setSubmittedAnswers(prev => new Set([...prev, currentQuestion.id]))
      setCurrentAnswer('')
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOptionSelect = (optionId: string) => {
    if (!hasSubmittedCurrent) {
      setCurrentAnswer(optionId)
    }
  }

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
            <Typography variant="body1">Ansluter till quiz...</Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Typography variant="body2" className="text-neutral-600">
                Ansluten som: {studentName}
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-neutral-500" />
              <Typography variant="body2" className="text-neutral-600">
                {studentCount} elever
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz State */}
      {state.phase === 'idle' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <Typography variant="body1" className="font-medium mb-2">
                Väntar på att quizet ska starta
              </Typography>
              <Typography variant="body2" className="text-neutral-600">
                Läraren kommer starta quizet snart
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}

      {state.phase === 'running' && currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>{currentQuestion.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasSubmittedCurrent ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <Typography variant="body1" className="font-medium text-green-600">
                  Svar skickat!
                </Typography>
                <Typography variant="body2" className="text-neutral-600 mt-1">
                  Väntar på nästa fråga...
                </Typography>
              </div>
            ) : (
              <>
                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option) => (
                      <Button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        variant={currentAnswer === option.id ? 'primary' : 'outline'}
                        className="w-full justify-start text-left h-auto py-3 px-4"
                      >
                        {option.text}
                      </Button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'free-text' && (
                  <div className="space-y-3">
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Skriv ditt svar här..."
                      className="w-full h-32 p-3 border border-neutral-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                )}

                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Skicka svar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {state.phase === 'running' && !currentQuestion && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
              <Typography variant="body1">Laddar fråga...</Typography>
            </div>
          </CardContent>
        </Card>
      )}

      {state.phase === 'ended' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <Typography variant="body1" className="font-medium text-green-600">
                Quiz avslutat!
              </Typography>
              <Typography variant="body2" className="text-neutral-600 mt-1">
                Tack för att du deltog
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}