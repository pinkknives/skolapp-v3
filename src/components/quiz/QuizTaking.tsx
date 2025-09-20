'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { 
  Quiz, 
  QuizSession, 
  Student, 
  MultipleChoiceQuestion, 
  ImageQuestion,
  QuizTakingState,
  StudentAnswer
} from '@/types/quiz'
import { motion, AnimatePresence } from 'framer-motion'

interface QuizTakingProps {
  quiz: Quiz
  session: QuizSession
  student: Student
  onComplete: (result: { answers: StudentAnswer[], timeSpent: number }) => void
  onExit: () => void
}

export function QuizTaking({ quiz, session, student, onComplete, onExit }: QuizTakingProps) {
  const [quizState, setQuizState] = useState<QuizTakingState>(() => ({
    quiz,
    session,
    student,
    progress: {
      currentQuestionIndex: 0,
      totalQuestions: quiz.questions.length,
      answers: [],
      startedAt: new Date(),
      timeElapsed: 0
    },
    status: 'starting'
  }))

  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('')
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [showFeedback, setShowFeedback] = useState(false)

  // Handle different execution modes
  const isTeacherControlled = quiz.settings.executionMode === 'teacher-controlled'

  // For now, all modes use self-paced progression
  // TODO: Add teacher-controlled progression in future update
  const currentQuestionIndex = quizState.progress.currentQuestionIndex

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

  // Timer for tracking time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setQuizState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          timeElapsed: prev.progress.timeElapsed + 1
        }
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Start the quiz
  useEffect(() => {
    if (quizState.status === 'starting') {
      setQuizState(prev => ({ ...prev, status: 'in-progress' }))
      setQuestionStartTime(Date.now())
    }
  }, [quizState.status])

  // Handle answer submission
  const proceedToNextQuestion = useCallback((updatedAnswers: StudentAnswer[], questionTimeSpent: number) => {
    if (isLastQuestion) {
      // Quiz completed
      setQuizState(prev => ({ 
        ...prev, 
        status: 'completed' 
      }))
      // Use callback to get current state instead of stale closure
      setQuizState(prev => {
        onComplete({
          answers: updatedAnswers,
          timeSpent: prev.progress.timeElapsed + questionTimeSpent
        })
        return prev
      })
    } else if (!isTeacherControlled) {
      // Move to next question (only in self-paced mode)
      setQuizState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          currentQuestionIndex: prev.progress.currentQuestionIndex + 1
        }
      }))
      setSelectedAnswer('')
      setQuestionStartTime(Date.now())
    } else {
      // In teacher-controlled mode, just wait for teacher to advance
      setSelectedAnswer('')
      setQuestionStartTime(Date.now())
    }
  }, [isLastQuestion, isTeacherControlled, onComplete])

  const handleAnswerSubmit = useCallback(() => {
    const questionTimeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    
    const answer: StudentAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      timeSpent: questionTimeSpent,
      answeredAt: new Date()
    }

    // Use state updater to get current answers
    setQuizState(prev => {
      const updatedAnswers = [...prev.progress.answers, answer]
      
      // Show immediate feedback if configured
      if (quiz.settings.showCorrectAnswers && currentQuestion.type === 'multiple-choice') {
        setShowFeedback(true)
        
        // Hide feedback after 2 seconds
        setTimeout(() => {
          setShowFeedback(false)
          proceedToNextQuestion(updatedAnswers, questionTimeSpent)
        }, 2000)
      } else {
        proceedToNextQuestion(updatedAnswers, questionTimeSpent)
      }

      return {
        ...prev,
        progress: {
          ...prev.progress,
          answers: updatedAnswers
        }
      }
    })
  }, [currentQuestion.id, selectedAnswer, questionStartTime, quiz.settings.showCorrectAnswers, currentQuestion.type, proceedToNextQuestion])

  // Handle multiple choice selection
  const handleMultipleChoiceSelect = (optionId: string) => {
    setSelectedAnswer(optionId)
  }

  // Handle free text input
  const handleFreeTextChange = (value: string) => {
    setSelectedAnswer(value)
  }

  // Check if answer is valid
  const isAnswerValid = () => {
    if (currentQuestion.type === 'free-text') {
      return typeof selectedAnswer === 'string' && selectedAnswer.trim().length > 0
    }
    return selectedAnswer !== '' && selectedAnswer !== undefined
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Render question based on type
  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
      case 'image':
        return <MultipleChoiceQuestionView 
          question={currentQuestion as MultipleChoiceQuestion | ImageQuestion}
          selectedAnswer={selectedAnswer as string}
          onAnswerSelect={handleMultipleChoiceSelect}
          showFeedback={showFeedback}
        />
      
      case 'free-text':
        return <FreeTextQuestionView 
          answer={selectedAnswer as string}
          onAnswerChange={handleFreeTextChange}
        />
      
      default:
        return null
    }
  }

  if (quizState.status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success-50 to-neutral-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-xl">Quiz Slutförd!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Typography variant="body1" className="text-neutral-600 mb-4">
              Du har slutfört quizet. Tack för ditt deltagande!
            </Typography>
            <Typography variant="caption" className="text-neutral-500">
              Tid: {formatTime(quizState.progress.timeElapsed)}
            </Typography>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div>
            <Typography variant="h6" className="text-neutral-900">{quiz.title}</Typography>
            <Typography variant="caption" className="text-neutral-500">
              {student.alias}
            </Typography>
          </div>
          <div className="text-right">
            <Typography variant="body2" className="text-neutral-600">
              Fråga {currentQuestionIndex + 1} av {quizState.progress.totalQuestions}
            </Typography>
            <Typography variant="caption" className="text-neutral-500">
              Tid: {formatTime(quizState.progress.timeElapsed)}
            </Typography>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Typography variant="caption" className="text-neutral-600">Framsteg</Typography>
            <Typography variant="caption" className="text-neutral-600">
              {Math.round((quizState.progress.currentQuestionIndex / quizState.progress.totalQuestions) * 100)}%
            </Typography>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <motion.div 
              className="bg-primary-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(currentQuestionIndex / quizState.progress.totalQuestions) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl text-center mb-4">
                  {currentQuestion.title}
                </CardTitle>
                <div className="flex justify-center space-x-4 text-sm text-neutral-600">
                  <span>{currentQuestion.points} poäng</span>
                  {currentQuestion.timeLimit && (
                    <span>{currentQuestion.timeLimit}s tidsgräns</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {renderQuestion()}
                
                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
                  <Button
                    variant="outline"
                    onClick={onExit}
                  >
                    Avsluta Quiz
                  </Button>
                  
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!isAnswerValid()}
                    size="lg"
                  >
                    {isTeacherControlled 
                      ? 'Skicka svar' 
                      : isLastQuestion 
                        ? 'Slutför Quiz' 
                        : 'Nästa Fråga'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Multiple Choice Question Component
function MultipleChoiceQuestionView({ 
  question, 
  selectedAnswer, 
  onAnswerSelect,
  showFeedback = false
}: {
  question: MultipleChoiceQuestion | ImageQuestion
  selectedAnswer: string
  onAnswerSelect: (optionId: string) => void
  showFeedback?: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Image for image questions */}
      {question.type === 'image' && (question as ImageQuestion).imageUrl && (
        <div className="flex justify-center">
          <Image
            src={(question as ImageQuestion).imageUrl!}
            alt={(question as ImageQuestion).imageAlt || 'Frågans bild'}
            width={800}
            height={400}
            className="max-w-full max-h-96 rounded-lg shadow-md object-contain"
            priority={false}
          />
        </div>
      )}
      
      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(question.options || []).map((option, index) => (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => onAnswerSelect(option.id)}
              disabled={showFeedback}
              className={`w-full p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                showFeedback && option.isCorrect
                  ? 'border-success-500 bg-success-50 text-success-800'
                  : showFeedback && selectedAnswer === option.id && !option.isCorrect
                  ? 'border-error-500 bg-error-50 text-error-800'
                  : selectedAnswer === option.id
                  ? 'border-primary-500 bg-primary-50 text-primary-800'
                  : 'border-neutral-300 bg-white hover:border-primary-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  showFeedback && option.isCorrect
                    ? 'bg-success-500'
                    : showFeedback && selectedAnswer === option.id && !option.isCorrect
                    ? 'bg-error-500'
                    : selectedAnswer === option.id 
                    ? 'bg-primary-500' 
                    : 'bg-neutral-400'
                }`}>
                  {showFeedback && option.isCorrect && (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {showFeedback && selectedAnswer === option.id && !option.isCorrect && (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {!showFeedback && String.fromCharCode(65 + index)}
                </div>
                <Typography variant="h6" className="flex-1">
                  {option.text}
                </Typography>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Free Text Question Component
function FreeTextQuestionView({ 
  answer, 
  onAnswerChange 
}: {
  answer: string
  onAnswerChange: (value: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="bg-neutral-50 p-4 rounded-lg">
        <Typography variant="body2" className="text-neutral-600">
          Skriv ditt svar i textfältet nedan. Var så detaljerad som möjligt.
        </Typography>
      </div>
      
      <textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Skriv ditt svar här..."
        rows={6}
        className="flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-all duration-200 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-neutral-400 focus:border-primary-500 resize-none"
      />
    </div>
  )
}