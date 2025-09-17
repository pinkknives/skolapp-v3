'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Quiz, Question, MultipleChoiceQuestion } from '@/types/quiz'

interface TeacherReviewModeProps {
  quiz: Quiz
  onExit: () => void
}

export function TeacherReviewMode({ quiz, onExit }: TeacherReviewModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          if (showAnswer && !isLastQuestion) {
            nextQuestion()
          } else if (!showAnswer) {
            setShowAnswer(true)
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (currentQuestionIndex > 0) {
            previousQuestion()
          }
          break
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen()
          }
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentQuestionIndex, showAnswer, isLastQuestion, isFullscreen])

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowAnswer(false)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setShowAnswer(false)
    }
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    setShowAnswer(false)
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const exitFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
      case 'image':
        const mcQuestion = question as MultipleChoiceQuestion
        return (
          <div className="space-y-6">
            {question.type === 'image' && (question as any).imageUrl && (
              <div className="flex justify-center">
                <img
                  src={(question as any).imageUrl}
                  alt={(question as any).imageAlt || 'Question image'}
                  className="max-w-full max-h-96 rounded-lg shadow-md"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mcQuestion.options.map((option, index) => (
                <div
                  key={option.id}
                  className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                    showAnswer && option.isCorrect
                      ? 'border-success-500 bg-success-50 text-success-800'
                      : showAnswer && !option.isCorrect
                      ? 'border-neutral-300 bg-neutral-50 text-neutral-600'
                      : 'border-neutral-300 bg-white hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      showAnswer && option.isCorrect ? 'bg-success-500' : 'bg-primary-500'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Typography variant="h6" className="flex-1">
                      {option.text}
                    </Typography>
                    {showAnswer && option.isCorrect && (
                      <svg className="h-6 w-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'free-text':
        return (
          <div className="space-y-6">
            <div className="bg-neutral-50 p-6 rounded-lg">
              <Typography variant="body1" className="text-neutral-600 mb-2">
                Denna fråga kräver fritextsvar från eleverna.
              </Typography>
              {showAnswer && (question as any).expectedAnswer && (
                <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-md">
                  <Typography variant="body2" className="font-medium text-success-800 mb-1">
                    Förväntat svar:
                  </Typography>
                  <Typography variant="body1" className="text-success-700">
                    {(question as any).expectedAnswer}
                  </Typography>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen bg-neutral-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-neutral-800 border-b border-neutral-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <Typography variant="h6" className="text-white mb-1">
              {quiz.title}
            </Typography>
            <Typography variant="caption" className="text-neutral-400">
              Lärargranskningsläge - Fråga {currentQuestionIndex + 1} av {quiz.questions.length}
            </Typography>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white">
              {isFullscreen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onExit} className="text-white">
              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Avsluta
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <Card className="bg-white text-neutral-900">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-center mb-4">
              {currentQuestion.title}
            </CardTitle>
            <div className="flex justify-center space-x-4 text-sm text-neutral-600">
              <span>{currentQuestion.points} poäng</span>
              {currentQuestion.timeLimit && <span>{currentQuestion.timeLimit}s tidsgräns</span>}
            </div>
          </CardHeader>
          
          <CardContent>
            {renderQuestion(currentQuestion)}
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="mt-8 flex flex-col items-center space-y-6">
          {/* Answer Toggle */}
          <Button
            size="lg"
            onClick={() => setShowAnswer(!showAnswer)}
            className={showAnswer ? 'bg-success-600 hover:bg-success-700' : ''}
          >
            {showAnswer ? 'Dölj svar' : 'Visa svar'}
          </Button>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="text-white border-neutral-600 hover:bg-neutral-800"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Föregående
            </Button>

            {/* Question Navigator */}
            <div className="flex space-x-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={nextQuestion}
              disabled={isLastQuestion}
              className="text-white border-neutral-600 hover:bg-neutral-800"
            >
              Nästa
              <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="text-center text-sm text-neutral-400">
            <Typography variant="caption">
              Tangentbord: Piltangenter för navigering • Mellanslag för att visa/dölja svar • F för fullskärm • Esc för att avsluta
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}