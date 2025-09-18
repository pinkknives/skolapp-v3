'use client'

import React from 'react'
import { Typography } from '@/components/ui/Typography'
import { Card, CardContent } from '@/components/ui/Card'
import { Quiz } from '@/types/quiz'
import { calculateTotalPoints, estimateCompletionTime, formatExecutionMode } from '@/lib/quiz-utils'

interface QuizClassroomPreviewProps {
  quiz: Partial<Quiz>
}

export function QuizClassroomPreview({ quiz }: QuizClassroomPreviewProps) {
  const totalPoints = quiz.questions ? calculateTotalPoints(quiz.questions) : 0
  const estimatedTime = quiz.questions ? estimateCompletionTime(quiz.questions) : 0

  return (
    <div className="p-8 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 min-h-full">
      {/* Large projector view */}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white bg-opacity-20 rounded-full mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <Typography variant="h2" className="text-white font-bold mb-4 text-5xl">
            {quiz.title || 'Quiz utan titel'}
          </Typography>
          
          <Typography variant="h6" className="text-white text-opacity-90 mb-8 text-xl">
            {quiz.description || 'Ingen beskrivning'}
          </Typography>

          {/* Large stats display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-4xl font-bold text-white mb-2">
                {quiz.questions?.length || 0}
              </div>
              <div className="text-white text-opacity-80 text-lg">
                {(quiz.questions?.length || 0) === 1 ? 'fråga' : 'frågor'}
              </div>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-4xl font-bold text-white mb-2">
                {totalPoints}
              </div>
              <div className="text-white text-opacity-80 text-lg">poäng</div>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-4xl font-bold text-white mb-2">
                ~{estimatedTime}
              </div>
              <div className="text-white text-opacity-80 text-lg">minuter</div>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-white mb-2">
                📺
              </div>
              <div className="text-white text-opacity-80 text-lg">klassrum</div>
            </div>
          </div>
        </div>

        {/* Quiz Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Left side - Quiz details */}
          <Card className="bg-white bg-opacity-95 backdrop-blur-sm border-0">
            <CardContent className="p-8">
              <Typography variant="h5" className="font-bold mb-6 text-primary-900">
                Quiz-information
              </Typography>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                  <Typography variant="body1" className="text-neutral-600">
                    Antal frågor
                  </Typography>
                  <Typography variant="body1" className="font-semibold">
                    {quiz.questions?.length || 0}
                  </Typography>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                  <Typography variant="body1" className="text-neutral-600">
                    Totala poäng
                  </Typography>
                  <Typography variant="body1" className="font-semibold">
                    {totalPoints}
                  </Typography>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                  <Typography variant="body1" className="text-neutral-600">
                    Beräknad tid
                  </Typography>
                  <Typography variant="body1" className="font-semibold">
                    {quiz.settings?.timeLimit ? `${quiz.settings.timeLimit} min` : `~${estimatedTime} min`}
                  </Typography>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                  <Typography variant="body1" className="text-neutral-600">
                    Läge
                  </Typography>
                  <Typography variant="body1" className="font-semibold">
                    {formatExecutionMode(quiz.settings?.executionMode || 'self-paced')}
                  </Typography>
                </div>
              </div>

              {/* Tags */}
              {quiz.tags && quiz.tags.length > 0 && (
                <div className="mt-6">
                  <Typography variant="body1" className="text-neutral-600 mb-3">
                    Taggar
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {quiz.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right side - Sample question */}
          <Card className="bg-white bg-opacity-95 backdrop-blur-sm border-0">
            <CardContent className="p-8">
              <Typography variant="h5" className="font-bold mb-6 text-primary-900">
                Exempel på fråga
              </Typography>
              
              {quiz.questions && quiz.questions.length > 0 ? (
                <div>
                  <div className="mb-6">
                    <Typography variant="h6" className="font-semibold mb-4 text-lg">
                      {quiz.questions[0].title || 'Fråga utan titel'}
                    </Typography>
                    
                    {quiz.questions[0].type === 'multiple-choice' && quiz.questions[0].options && (
                      <div className="space-y-3">
                        {quiz.questions[0].options.map((option, index) => (
                          <div key={option.id || index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                            <div className="w-6 h-6 border-2 border-neutral-300 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
                            </div>
                            <Typography variant="body1">
                              {option.text}
                            </Typography>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {quiz.questions[0].type === 'free-text' && (
                      <div className="p-4 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300">
                        <Typography variant="body1" className="text-neutral-500 italic">
                          Eleverna skriver sitt svar här...
                        </Typography>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <Typography variant="body2" className="text-neutral-600">
                      {quiz.questions[0].points} {quiz.questions[0].points === 1 ? 'poäng' : 'poäng'}
                    </Typography>
                    <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-primary-100 text-primary-700 font-medium">
                      {quiz.questions[0].type === 'multiple-choice' && 'Flerval'}
                      {quiz.questions[0].type === 'free-text' && 'Fritext'}
                      {quiz.questions[0].type === 'image' && 'Bild'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <Typography variant="body1" className="text-neutral-500">
                    Inga frågor än
                  </Typography>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Large start button */}
        <div className="text-center">
          <button className="bg-white text-primary-800 font-bold py-6 px-12 rounded-2xl hover:bg-neutral-50 transition-colors text-2xl flex items-center justify-center gap-4 mx-auto shadow-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Starta quiz i klassrummet
          </button>
          
          <Typography variant="body1" className="text-white text-opacity-80 mt-4 text-lg">
            Eleverna ansluter med sina egna enheter
          </Typography>
        </div>
      </div>
    </div>
  )
}