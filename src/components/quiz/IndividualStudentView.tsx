'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Quiz, ParticipantResult } from '@/types/quiz'
import { motion } from 'framer-motion'

interface IndividualStudentViewProps {
  quiz: Quiz
  student: ParticipantResult
  showAnonymized: boolean
  onBack: () => void
}

export function IndividualStudentView({ 
  quiz, 
  student, 
  showAnonymized, 
  onBack 
}: IndividualStudentViewProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDisplayName = () => {
    return showAnonymized ? 'Anonym elev' : student.studentAlias
  }

  const getAnswerStatus = (questionId: string) => {
    const answer = student.answers.find(a => a.questionId === questionId)
    if (!answer) return { status: 'unanswered', color: 'neutral' }

    const question = quiz.questions.find(q => q.id === questionId)
    if (!question) return { status: 'unknown', color: 'neutral' }

    if (question.type === 'multiple-choice') {
      const correctOption = question.options?.find(opt => opt.isCorrect)
      const isCorrect = correctOption && answer.answer === correctOption.id
      return { 
        status: isCorrect ? 'correct' : 'incorrect', 
        color: isCorrect ? 'success' : 'error',
        answer: answer.answer
      }
    }

    // For free-text questions, we can't automatically determine correctness
    return { status: 'answered', color: 'primary', answer: answer.answer }
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple-choice': return 'Flerval'
      case 'free-text': return 'Fritext'
      case 'image': return 'Bild'
      default: return 'Okänd'
    }
  }

  return (
    <div className="space-y-6">
      {/* Student Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Typography variant="h6" className="text-primary-700 font-bold">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </Typography>
                </div>
                <div>
                  <Typography variant="h5">{getDisplayName()}</Typography>
                  <Typography variant="body2" className="text-neutral-600">
                    Individuell rapport
                  </Typography>
                </div>
              </CardTitle>
            </div>
            <Button variant="outline" onClick={onBack}>
              ← Tillbaka till lista
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center bg-primary-50 p-4 rounded-lg">
                <Typography variant="h5" className="text-primary-800 mb-1">
                  {Math.round(student.accuracy)}%
                </Typography>
                <Typography variant="caption" className="text-primary-600">
                  Totalresultat
                </Typography>
              </div>
              
              <div className="text-center bg-success-50 p-4 rounded-lg">
                <Typography variant="h5" className="text-success-800 mb-1">
                  {student.score}/{student.totalPoints}
                </Typography>
                <Typography variant="caption" className="text-success-600">
                  Poäng
                </Typography>
              </div>
              
              <div className="text-center bg-warning-50 p-4 rounded-lg">
                <Typography variant="h5" className="text-warning-800 mb-1">
                  {formatTime(student.timeSpent)}
                </Typography>
                <Typography variant="caption" className="text-warning-600">
                  Total tid
                </Typography>
              </div>
              
              <div className="text-center bg-neutral-50 p-4 rounded-lg">
                <Typography variant="h5" className="text-neutral-800 mb-1">
                  {student.completedAt ? 'Slutförd' : 'Pågår'}
                </Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Status
                </Typography>
              </div>
            </div>
            
            {student.completedAt && (
              <div className="mt-4 text-center">
                <Typography variant="caption" className="text-neutral-500">
                  Slutförd: {student.completedAt.toLocaleString('sv-SE')}
                </Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Answer Review */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Detaljerad genomgång</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {quiz.questions.map((question, index) => {
                const answerStatus = getAnswerStatus(question.id)
                const studentAnswer = student.answers.find(a => a.questionId === question.id)
                
                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`border rounded-lg p-6 ${
                      answerStatus.color === 'success' ? 'border-success-200 bg-success-50' :
                      answerStatus.color === 'error' ? 'border-error-200 bg-error-50' :
                      answerStatus.color === 'primary' ? 'border-primary-200 bg-primary-50' :
                      'border-neutral-200 bg-neutral-50'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Typography variant="h6">
                            Fråga {index + 1}
                          </Typography>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            answerStatus.color === 'success' ? 'bg-success-100 text-success-700' :
                            answerStatus.color === 'error' ? 'bg-error-100 text-error-700' :
                            answerStatus.color === 'primary' ? 'bg-primary-100 text-primary-700' :
                            'bg-neutral-100 text-neutral-700'
                          }`}>
                            {answerStatus.status === 'correct' ? 'Korrekt' :
                             answerStatus.status === 'incorrect' ? 'Felaktig' :
                             answerStatus.status === 'answered' ? 'Besvarad' : 'Ej besvarad'}
                          </span>
                          <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs">
                            {getQuestionTypeLabel(question.type)}
                          </span>
                        </div>
                        <Typography variant="body1" className="mb-2">
                          {question.title}
                        </Typography>
                        <div className="flex items-center space-x-4 text-sm text-neutral-600">
                          <span>{question.points} poäng</span>
                          {studentAnswer && (
                            <span>Tid: {formatTime(studentAnswer.timeSpent)}</span>
                          )}
                        </div>
                      </div>
                      
                      {answerStatus.status === 'correct' && (
                        <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      
                      {answerStatus.status === 'incorrect' && (
                        <div className="w-8 h-8 bg-error-500 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Image for image questions */}
                    {question.type === 'image' && question.imageUrl && (
                      <div className="mb-4 flex justify-center">
                        <img
                          src={question.imageUrl}
                          alt={question.imageAlt || 'Frågans bild'}
                          className="max-w-full max-h-64 rounded-lg shadow-sm"
                        />
                      </div>
                    )}

                    {/* Answer Details */}
                    <div className="space-y-4">
                      {question.type === 'multiple-choice' && question.options && (
                        <div>
                          <Typography variant="body2" className="font-medium mb-3">
                            Svarsalternativ:
                          </Typography>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {question.options.map((option, optionIndex) => {
                              const isSelected = studentAnswer?.answer === option.id
                              const isCorrect = option.isCorrect
                              
                              return (
                                <div
                                  key={option.id}
                                  className={`p-3 rounded-lg border ${
                                    isSelected && isCorrect
                                      ? 'border-success-500 bg-success-100'
                                      : isSelected && !isCorrect
                                      ? 'border-error-500 bg-error-100'
                                      : isCorrect
                                      ? 'border-success-300 bg-success-50'
                                      : 'border-neutral-200 bg-white'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      isSelected && isCorrect
                                        ? 'bg-success-500 text-white'
                                        : isSelected && !isCorrect
                                        ? 'bg-error-500 text-white'
                                        : isCorrect
                                        ? 'bg-success-300 text-success-800'
                                        : 'bg-neutral-200 text-neutral-600'
                                    }`}>
                                      {String.fromCharCode(65 + optionIndex)}
                                    </span>
                                    <Typography variant="body2" className="flex-1">
                                      {option.text}
                                    </Typography>
                                    {isSelected && (
                                      <span className="text-xs font-medium">
                                        (Vald)
                                      </span>
                                    )}
                                    {isCorrect && (
                                      <span className="text-xs font-medium text-success-600">
                                        ✓ Korrekt
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {question.type === 'free-text' && (
                        <div>
                          <Typography variant="body2" className="font-medium mb-2">
                            Elevens svar:
                          </Typography>
                          <div className="bg-white border border-neutral-200 rounded-lg p-4">
                            <Typography variant="body1">
                              {studentAnswer ? studentAnswer.answer : 'Inget svar lämnat'}
                            </Typography>
                          </div>
                          {question.expectedAnswer && (
                            <div className="mt-3">
                              <Typography variant="body2" className="font-medium mb-2 text-success-700">
                                Förväntat svar:
                              </Typography>
                              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                                <Typography variant="body1" className="text-success-800">
                                  {question.expectedAnswer}
                                </Typography>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}