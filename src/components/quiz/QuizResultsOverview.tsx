'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Quiz, QuizAnalytics } from '@/types/quiz'
import { motion } from 'framer-motion'

interface QuizResultsOverviewProps {
  quiz: Quiz
  analytics: QuizAnalytics
  showAnonymized: boolean
}

export function QuizResultsOverview({ quiz, analytics, showAnonymized }: QuizResultsOverviewProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const completionRate = analytics.totalParticipants > 0 
    ? (analytics.completedResponses / analytics.totalParticipants) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Quiz Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quiz-information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <Typography variant="h6" className="text-neutral-800 mb-1">
                  {quiz.questions.length}
                </Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Frågor
                </Typography>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg">
                <Typography variant="h6" className="text-neutral-800 mb-1">
                  {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
                </Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Max poäng
                </Typography>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg">
                <Typography variant="h6" className="text-neutral-800 mb-1">
                  {quiz.settings.executionMode === 'self-paced' ? 'Självtempo' : 
                   quiz.settings.executionMode === 'teacher-controlled' ? 'Lärarstyrt' : 'Granskning'}
                </Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Läge
                </Typography>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg">
                <Typography variant="h6" className="text-neutral-800 mb-1">
                  {quiz.settings.showCorrectAnswers ? 'Ja' : 'Nej'}
                </Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Direktfeedback
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Resultatsammanfattning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center bg-primary-50 p-6 rounded-lg">
                <Typography variant="h4" className="text-primary-800 mb-2">
                  {analytics.totalParticipants}
                </Typography>
                <Typography variant="body2" className="text-primary-600">
                  Totalt deltagare
                </Typography>
              </div>
              
              <div className="text-center bg-success-50 p-6 rounded-lg">
                <Typography variant="h4" className="text-success-800 mb-2">
                  {analytics.completedResponses}
                </Typography>
                <Typography variant="body2" className="text-success-600">
                  Slutförda
                </Typography>
              </div>
              
              <div className="text-center bg-warning-50 p-6 rounded-lg">
                <Typography variant="h4" className="text-warning-800 mb-2">
                  {Math.round(analytics.averageScore * 10) / 10}%
                </Typography>
                <Typography variant="body2" className="text-warning-600">
                  Snittresultat
                </Typography>
              </div>
              
              <div className="text-center bg-neutral-50 p-6 rounded-lg">
                <Typography variant="h4" className="text-neutral-800 mb-2">
                  {formatTime(analytics.averageTimeSpent)}
                </Typography>
                <Typography variant="body2" className="text-neutral-600">
                  Genomsnittlig tid
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Completion Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Genomförandegrad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Typography variant="body2" className="text-neutral-600">
                  Slutförd
                </Typography>
                <Typography variant="body2" className="text-neutral-600">
                  {Math.round(completionRate)}%
                </Typography>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <motion.div 
                  className="bg-success-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className="flex justify-between text-sm text-neutral-500">
                <span>{analytics.completedResponses} slutförda</span>
                <span>{analytics.totalParticipants - analytics.completedResponses} pågående/ej startade</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Performing Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Frågeöversikt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.questionAnalytics.map((question, index) => (
                <div key={question.questionId} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="body1" className="font-medium">
                      Fråga {index + 1}: {question.questionTitle}
                    </Typography>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        question.accuracy >= 70 
                          ? 'bg-success-100 text-success-700' 
                          : question.accuracy >= 50 
                          ? 'bg-warning-100 text-warning-700' 
                          : 'bg-error-100 text-error-700'
                      }`}>
                        {Math.round(question.accuracy)}% korrekt
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        question.accuracy >= 70 
                          ? 'bg-success-500' 
                          : question.accuracy >= 50 
                          ? 'bg-warning-500' 
                          : 'bg-error-500'
                      }`}
                      style={{ width: `${question.accuracy}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-neutral-500">
                    <span>{question.correctAnswers}/{question.totalAnswers} rätt</span>
                    <span>⏱️ {formatTime(question.averageTimeSpent)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}