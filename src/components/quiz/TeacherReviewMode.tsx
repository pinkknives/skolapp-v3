'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Quiz, Question, MultipleChoiceQuestion, FreeTextQuestion, ImageQuestion, QuizResult, Student, Rubric } from '@/types/quiz'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { type User } from '@/types/auth'
import { isAIGradingSupported } from '@/lib/ai-grading'
import { toast } from '@/components/ui/Toast'

// Dynamically import AI components for better performance
const AISuggestionsPanel = dynamic(() => import('./AISuggestionsPanel').then(mod => ({ default: mod.AISuggestionsPanel })), {
  loading: () => (
    <div className="fixed right-4 top-20 w-96 bg-white rounded-xl shadow-xl border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="animate-spin w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full"></div>
        <Typography variant="body2">Laddar AI-bedömning...</Typography>
      </div>
    </div>
  ),
  ssr: false
})

interface TeacherReviewModeProps {
  quiz: Quiz
  onExit: () => void
  results?: QuizResult[]
  students?: Student[]
  showStudentResponses?: boolean
  user?: User
  onQuizUpdate?: (quiz: Quiz) => void
}

export function TeacherReviewMode({ 
  quiz, 
  onExit, 
  results = [], 
  students = [], 
  showStudentResponses = false,
  user,
  onQuizUpdate
}: TeacherReviewModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [anonymizeNames, setAnonymizeNames] = useState(false)
  const [showResponses, setShowResponses] = useState(showStudentResponses)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [localQuiz, setLocalQuiz] = useState(quiz)

  const currentQuestion = localQuiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === localQuiz.questions.length - 1

  const handleQuizUpdate = (questionId: string, rubric: Rubric | undefined) => {
    const updatedQuiz = {
      ...localQuiz,
      questions: localQuiz.questions.map(q => 
        q.id === questionId ? { ...q, rubric } : q
      )
    }
    setLocalQuiz(updatedQuiz)
    
    // Toast feedback
    toast.success('Bedömningskriterier uppdaterade!')
    
    // Notify parent component
    if (onQuizUpdate) {
      onQuizUpdate(updatedQuiz)
    }
  }

  // Helper functions for student response analysis
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId)
    if (!student) return 'Okänd elev'
    return anonymizeNames ? `Elev ${students.indexOf(student) + 1}` : student.alias
  }

  const getStudentResponsesForCurrentQuestion = () => {
    return results.map(result => {
      const answer = result.answers.find(a => a.questionId === currentQuestion.id)
      return {
        studentId: result.studentId,
        studentName: getStudentName(result.studentId),
        answer: answer?.answer,
        isCorrect: isAnswerCorrect(answer?.answer, currentQuestion)
      }
    }).filter(response => response.answer !== undefined)
  }

  const isAnswerCorrect = (answer: string | string[] | undefined, question: Question): boolean => {
    if (!answer || question.type !== 'multiple-choice') return false
    
    const mcQuestion = question as MultipleChoiceQuestion
    const correctOption = mcQuestion.options.find(opt => opt.isCorrect)
    return correctOption?.id === answer
  }

  // Navigation functions - declared before useEffect to avoid dependency hoisting issues
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < localQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowAnswer(false)
      toast.success(`Fråga ${currentQuestionIndex + 2} av ${localQuiz.questions.length}`)
    }
  }, [currentQuestionIndex, localQuiz.questions.length])

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setShowAnswer(false)
      toast.success(`Fråga ${currentQuestionIndex} av ${localQuiz.questions.length}`)
    }
  }, [currentQuestionIndex, localQuiz.questions.length])

  const goToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index)
    setShowAnswer(false)
    toast.success(`Fråga ${index + 1} av ${localQuiz.questions.length}`)
  }, [localQuiz.questions.length])

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }, [isFullscreen])

  const exitFullscreen = useCallback(() => {
    if (isFullscreen) {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }, [isFullscreen])

  const getOptionStats = (optionId: string) => {
    const responses = getStudentResponsesForCurrentQuestion()
    const count = responses.filter(r => r.answer === optionId).length
    const percentage = responses.length > 0 ? (count / responses.length) * 100 : 0
    return { count, percentage }
  }

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
  }, [currentQuestionIndex, showAnswer, isLastQuestion, isFullscreen, nextQuestion, previousQuestion, toggleFullscreen, exitFullscreen])

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
      case 'image':
        const mcQuestion = question as MultipleChoiceQuestion
        return (
          <div className="space-y-6">
            {question.type === 'image' && (question as ImageQuestion).imageUrl && (
              <div className="flex justify-center">
                <Image
                  src={(question as ImageQuestion).imageUrl!}
                  alt={(question as ImageQuestion).imageAlt || 'Question image'}
                  width={800}
                  height={400}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 800px"
                  className="max-w-full max-h-96 rounded-lg shadow-md object-contain"
                  priority={false}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mcQuestion.options.map((option, index) => {
                const optionStats = showResponses ? getOptionStats(option.id) : { count: 0, percentage: 0 }
                
                return (
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
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          showAnswer && option.isCorrect ? 'bg-success-500' : 'bg-primary-500'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <Typography variant="h6" className="flex-1">
                          {option.text}
                        </Typography>
                      </div>
                      <div className="flex items-center space-x-2">
                        {showResponses && (
                          <div className="text-right">
                            <Typography variant="caption" className="text-neutral-600 block">
                              {optionStats.count} elever ({optionStats.percentage.toFixed(0)}%)
                            </Typography>
                          </div>
                        )}
                        {showAnswer && option.isCorrect && (
                          <svg className="h-6 w-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {/* Response bar */}
                    {showResponses && results.length > 0 && (
                      <div className="mt-3">
                        <ProgressBar 
                          value={optionStats.percentage}
                          variant={option.isCorrect ? 'success' : 'primary'}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Student response list */}
            {showResponses && showAnswer && results.length > 0 && (
              <div className="mt-6 bg-neutral-50 p-4 rounded-lg">
                <Typography variant="subtitle2" className="font-medium mb-3">
                  Elevernas svar:
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getStudentResponsesForCurrentQuestion().map((response, idx) => (
                    <div
                      key={`${response.studentId}-${idx}`}
                      className={`flex items-center justify-between p-3 rounded ${
                        response.isCorrect ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
                      }`}
                    >
                      <Typography variant="body2" className="font-medium">
                        {response.studentName}
                      </Typography>
                      <div className="flex items-center space-x-2">
                        <Typography variant="body2">
                          {mcQuestion.options.find(opt => opt.id === response.answer)?.text?.substring(0, 20) || 'Okänt svar'}
                        </Typography>
                        {response.isCorrect ? (
                          <svg className="h-4 w-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'free-text':
        return (
          <div className="space-y-6">
            <div className="bg-neutral-50 dark:bg-neutral-800 p-6 rounded-lg">
              <Typography variant="body1" className="text-neutral-600 dark:text-neutral-300 mb-2">
                Denna fråga kräver fritextsvar från eleverna.
              </Typography>
              {showAnswer && (question as FreeTextQuestion).expectedAnswer && (
                <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-md">
                  <Typography variant="body2" className="font-medium text-success-800 mb-1">
                    Förväntat svar:
                  </Typography>
                  <Typography variant="body1" className="text-success-700">
                    {(question as FreeTextQuestion).expectedAnswer}
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
            {/* AI Suggestions toggle */}
            {isAIGradingSupported(currentQuestion.type) && (
              <Button 
                variant={showAIPanel ? "primary" : "ghost"} 
                size="sm" 
                onClick={() => setShowAIPanel(!showAIPanel)}
                className="text-white"
              >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI-förslag
              </Button>
            )}
            
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
          {/* Primary Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Answer Toggle */}
            <Button
              size="lg"
              onClick={() => setShowAnswer(!showAnswer)}
              className={showAnswer ? 'bg-success-600 hover:bg-success-700' : ''}
            >
              {showAnswer ? 'Dölj svar' : 'Visa svar'}
            </Button>

            {/* Student Responses Toggle */}
            {results.length > 0 && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowResponses(!showResponses)}
                className={`text-white border-neutral-600 hover:bg-neutral-800 ${
                  showResponses ? 'bg-neutral-700' : ''
                }`}
              >
                {showResponses ? 'Dölj elevdata' : 'Visa elevdata'}
              </Button>
            )}

            {/* Anonymization Toggle */}
            {showResponses && results.length > 0 && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setAnonymizeNames(!anonymizeNames)}
                className="text-white border-neutral-600 hover:bg-neutral-800"
              >
                {anonymizeNames ? 'Visa namn' : 'Anonymisera'}
              </Button>
            )}
          </div>

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

      {/* AI Suggestions Modal */}
      {showAIPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <AISuggestionsPanel
              quiz={{ id: localQuiz.id, questions: localQuiz.questions }}
              results={results}
              currentQuestionIndex={currentQuestionIndex}
              user={user}
              onClose={() => setShowAIPanel(false)}
              onQuizUpdate={handleQuizUpdate}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}