'use client'

import React from 'react'
import { Typography } from '@/components/ui/Typography'
import { Card, CardContent } from '@/components/ui/Card'
import { Quiz } from '@/types/quiz'
import { calculateTotalPoints, estimateCompletionTime } from '@/lib/quiz-utils'

interface QuizMobilePreviewProps {
  quiz: Partial<Quiz>
}

export function QuizMobilePreview({ quiz }: QuizMobilePreviewProps) {
  const totalPoints = quiz.questions ? calculateTotalPoints(quiz.questions) : 0
  const estimatedTime = quiz.questions ? estimateCompletionTime(quiz.questions) : 0

  return (
    <div className="p-6 bg-neutral-50 min-h-full">
      {/* Mobile Frame */}
      <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-neutral-200">
        {/* Phone Header Bar */}
        <div className="bg-neutral-900 h-6 flex items-center justify-center relative">
          <div className="absolute left-4 flex items-center gap-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
          <div className="text-white text-xs font-medium">9:41</div>
          <div className="absolute right-4 flex items-center gap-1">
            <div className="text-white text-xs">100%</div>
            <div className="w-4 h-2 border border-white rounded-sm">
              <div className="w-full h-full bg-white rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* App Content */}
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <Typography variant="h6" className="text-primary-900 font-bold mb-2">
              {quiz.title || 'Quiz utan titel'}
            </Typography>
            
            <Typography variant="caption" className="text-primary-700">
              {quiz.description || 'Ingen beskrivning'}
            </Typography>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-primary-800">
                  {quiz.questions?.length || 0}
                </div>
                <div className="text-xs text-primary-600">
                  {(quiz.questions?.length || 0) === 1 ? 'fråga' : 'frågor'}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-primary-800">
                  {totalPoints}
                </div>
                <div className="text-xs text-primary-600">poäng</div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-primary-800">
                  ~{estimatedTime}
                </div>
                <div className="text-xs text-primary-600">minuter</div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-primary-800">
                  📱
                </div>
                <div className="text-xs text-primary-600">mobil</div>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          {quiz.tags && quiz.tags.length > 0 && (
            <div>
              <Typography variant="caption" className="text-neutral-600 mb-2 block">
                Taggar
              </Typography>
              <div className="flex flex-wrap gap-2">
                {quiz.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700"
                  >
                    {tag}
                  </span>
                ))}
                {quiz.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-600">
                    +{quiz.tags.length - 3} till
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Sample Questions Preview */}
          {quiz.questions && quiz.questions.length > 0 && (
            <div>
              <Typography variant="caption" className="text-neutral-600 mb-3 block">
                Exempel på frågor
              </Typography>
              <div className="space-y-3">
                {quiz.questions.slice(0, 2).map((question, index) => (
                  <Card key={question.id || index} className="border border-neutral-200">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <Typography variant="body2" className="font-medium text-sm">
                          {question.title || 'Fråga utan titel'}
                        </Typography>
                      </div>
                      
                      {question.type === 'multiple-choice' && question.options && (
                        <div className="space-y-2 ml-7">
                          {question.options.slice(0, 2).map((option, optIndex) => (
                            <div key={option.id || optIndex} className="flex items-center gap-2">
                              <div className="w-3 h-3 border border-neutral-300 rounded-full"></div>
                              <Typography variant="caption" className="text-neutral-600">
                                {option.text}
                              </Typography>
                            </div>
                          ))}
                          {question.options.length > 2 && (
                            <Typography variant="caption" className="text-neutral-500 ml-5">
                              +{question.options.length - 2} fler alternativ
                            </Typography>
                          )}
                        </div>
                      )}
                      
                      {question.type === 'free-text' && (
                        <div className="ml-7">
                          <div className="w-full h-8 bg-neutral-100 rounded border border-neutral-200 flex items-center px-2">
                            <Typography variant="caption" className="text-neutral-500">
                              Skriv ditt svar här...
                            </Typography>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2 ml-7">
                        <Typography variant="caption" className="text-neutral-500">
                          {question.points} {question.points === 1 ? 'poäng' : 'poäng'}
                        </Typography>
                        <Typography variant="caption" className="text-primary-600">
                          {question.type === 'multiple-choice' && 'Flerval'}
                          {question.type === 'free-text' && 'Fritext'}
                          {question.type === 'image' && 'Bild'}
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {quiz.questions.length > 2 && (
                  <Card className="border-dashed border-neutral-300">
                    <CardContent className="p-3 text-center">
                      <Typography variant="caption" className="text-neutral-500">
                        +{quiz.questions.length - 2} fler {quiz.questions.length - 2 === 1 ? 'fråga' : 'frågor'}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Start Button */}
          <div className="pt-4">
            <button className="w-full bg-primary-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Starta quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}