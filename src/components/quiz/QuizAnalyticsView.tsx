'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Quiz, QuizAnalytics } from '@/types/quiz'
import { motion } from 'framer-motion'

interface QuizAnalyticsViewProps {
  quiz: Quiz
  analytics: QuizAnalytics
}

export function QuizAnalyticsView({ quiz, analytics }: QuizAnalyticsViewProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getQuestionDifficulty = (accuracy: number) => {
    if (accuracy >= 80) return { label: 'Lätt', color: 'success' }
    if (accuracy >= 60) return { label: 'Medel', color: 'warning' }
    if (accuracy >= 40) return { label: 'Svår', color: 'error' }
    return { label: 'Mycket svår', color: 'error' }
  }

  return (
    <div className="space-y-6">
      {/* Performance Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Prestationskarta - Frågor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Question Performance Grid */}
              <div>
                <Typography variant="h6" className="mb-4">Svårighet per fråga</Typography>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {analytics.questionAnalytics.map((question, index) => {
                    const difficulty = getQuestionDifficulty(question.accuracy)
                    return (
                      <div
                        key={question.questionId}
                        className={`p-3 rounded-lg border text-center ${
                          difficulty.color === 'success' 
                            ? 'bg-success-50 border-success-200' 
                            : difficulty.color === 'warning'
                            ? 'bg-warning-50 border-warning-200'
                            : 'bg-error-50 border-error-200'
                        }`}
                      >
                        <Typography variant="body2" className="font-bold">
                          Q{index + 1}
                        </Typography>
                        <Typography variant="caption" className={`${
                          difficulty.color === 'success' 
                            ? 'text-success-700' 
                            : difficulty.color === 'warning'
                            ? 'text-warning-700'
                            : 'text-error-700'
                        }`}>
                          {Math.round(question.accuracy)}%
                        </Typography>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success-200 rounded"></div>
                    <span>Lätt (&gt;80%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-warning-200 rounded"></div>
                    <span>Medel (60-80%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-error-200 rounded"></div>
                    <span>Svår (&lt;60%)</span>
                  </div>
                </div>
              </div>

              {/* Time Distribution */}
              <div>
                <Typography variant="h6" className="mb-4">Tidsdistribution</Typography>
                <div className="space-y-3">
                  {analytics.questionAnalytics.map((question, index) => (
                    <div key={question.questionId} className="flex items-center space-x-3">
                      <Typography variant="caption" className="w-8">
                        Q{index + 1}
                      </Typography>
                      <div className="flex-1 bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min((question.averageTimeSpent / Math.max(...analytics.questionAnalytics.map(q => q.averageTimeSpent))) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <Typography variant="caption" className="w-12 text-right">
                        {formatTime(question.averageTimeSpent)}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Question Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Detaljerad frågeanalys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analytics.questionAnalytics.map((question, index) => (
                <motion.div
                  key={question.questionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-neutral-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Typography variant="h6" className="mb-2">
                        Fråga {index + 1}: {question.questionTitle}
                      </Typography>
                      <div className="flex items-center space-x-4 text-sm text-neutral-600">
                        <span>Typ: {question.questionType === 'multiple-choice' ? 'Flerval' : 
                                    question.questionType === 'free-text' ? 'Fritext' : 'Bild'}</span>
                        <span>Svar: {question.totalAnswers}</span>
                        <span>Tid: {formatTime(question.averageTimeSpent)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Typography variant="h5" className={`${
                        question.accuracy >= 70 ? 'text-success-600' :
                        question.accuracy >= 50 ? 'text-warning-600' : 'text-error-600'
                      }`}>
                        {Math.round(question.accuracy)}%
                      </Typography>
                      <Typography variant="caption" className="text-neutral-500">
                        korrekt
                      </Typography>
                    </div>
                  </div>

                  {/* Answer Distribution */}
                  {question.questionType === 'multiple-choice' && question.answerDistribution && (
                    <div>
                      <Typography variant="body2" className="font-medium mb-3">
                        Svarsfördelning:
                      </Typography>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {question.answerDistribution.map((answer, answerIndex) => (
                          <div 
                            key={answerIndex}
                            className={`p-3 rounded-lg border ${
                              answer.isCorrect 
                                ? 'bg-success-50 border-success-200' 
                                : 'bg-neutral-50 border-neutral-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{answer.answer}</span>
                              <span className={`text-sm ${
                                answer.isCorrect ? 'text-success-700' : 'text-neutral-600'
                              }`}>
                                {answer.count} ({Math.round(answer.percentage)}%)
                                {answer.isCorrect && ' ✓'}
                              </span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  answer.isCorrect ? 'bg-success-500' : 'bg-neutral-400'
                                }`}
                                style={{ width: `${answer.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.questionType === 'free-text' && (
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <Typography variant="body2" className="text-neutral-600">
                        Fritextfråga - Manuell granskning krävs för detaljerad analys
                      </Typography>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Prestandafördelning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <div>
                <Typography variant="h6" className="mb-4">Poängfördelning</Typography>
                <div className="space-y-2">
                  {[
                    { range: '90-100%', color: 'success', count: analytics.participantResults.filter(p => p.accuracy >= 90).length },
                    { range: '80-89%', color: 'success', count: analytics.participantResults.filter(p => p.accuracy >= 80 && p.accuracy < 90).length },
                    { range: '70-79%', color: 'warning', count: analytics.participantResults.filter(p => p.accuracy >= 70 && p.accuracy < 80).length },
                    { range: '60-69%', color: 'warning', count: analytics.participantResults.filter(p => p.accuracy >= 60 && p.accuracy < 70).length },
                    { range: '0-59%', color: 'error', count: analytics.participantResults.filter(p => p.accuracy < 60).length }
                  ].map((range, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Typography variant="caption" className="w-16">
                        {range.range}
                      </Typography>
                      <div className="flex-1 bg-neutral-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            range.color === 'success' ? 'bg-success-500' :
                            range.color === 'warning' ? 'bg-warning-500' : 'bg-error-500'
                          }`}
                          style={{ 
                            width: `${analytics.participantResults.length > 0 ? (range.count / analytics.participantResults.length) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <Typography variant="caption" className="w-8">
                        {range.count}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Distribution */}
              <div>
                <Typography variant="h6" className="mb-4">Tidsstatistik</Typography>
                <div className="space-y-4">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <Typography variant="body2" className="text-neutral-600 mb-1">
                      Snabbaste tid
                    </Typography>
                    <Typography variant="h6">
                      {formatTime(Math.min(...analytics.participantResults.map(p => p.timeSpent)))}
                    </Typography>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <Typography variant="body2" className="text-neutral-600 mb-1">
                      Genomsnittlig tid
                    </Typography>
                    <Typography variant="h6">
                      {formatTime(analytics.averageTimeSpent)}
                    </Typography>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <Typography variant="body2" className="text-neutral-600 mb-1">
                      Längsta tid
                    </Typography>
                    <Typography variant="h6">
                      {formatTime(Math.max(...analytics.participantResults.map(p => p.timeSpent)))}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}