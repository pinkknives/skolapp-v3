'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { QuizAnalytics, ParticipantResult } from '@/types/quiz'
import { motion } from 'framer-motion'

interface QuizParticipantsListProps {
  analytics: QuizAnalytics
  showAnonymized: boolean
  onStudentSelect: (student: ParticipantResult) => void
  canAccessPremium: boolean
}

export function QuizParticipantsList({ 
  analytics, 
  showAnonymized, 
  onStudentSelect, 
  canAccessPremium 
}: QuizParticipantsListProps) {
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'time' | 'completion'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDisplayName = (student: ParticipantResult) => {
    if (showAnonymized) {
      const index = analytics.participantResults.indexOf(student) + 1
      return `Elev ${index}`
    }
    return student.studentAlias
  }

  const sortedParticipants = [...analytics.participantResults].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'name':
        comparison = getDisplayName(a).localeCompare(getDisplayName(b))
        break
      case 'score':
        comparison = a.accuracy - b.accuracy
        break
      case 'time':
        comparison = a.timeSpent - b.timeSpent
        break
      case 'completion':
        comparison = (a.completedAt ? 1 : 0) - (b.completedAt ? 1 : 0)
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: typeof sortBy) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getScoreColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-success-600'
    if (accuracy >= 60) return 'text-warning-600'
    return 'text-error-600'
  }

  const getStatusBadge = (student: ParticipantResult) => {
    if (student.completedAt) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success-100 text-success-700">
          Slutförd
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-warning-100 text-warning-700">
          Pågår
        </span>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Deltagaröversikt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center bg-primary-50 p-4 rounded-lg">
                <Typography variant="h5" className="text-primary-800 mb-1">
                  {analytics.totalParticipants}
                </Typography>
                <Typography variant="caption" className="text-primary-600">
                  Totalt anmälda
                </Typography>
              </div>
              
              <div className="text-center bg-success-50 p-4 rounded-lg">
                <Typography variant="h5" className="text-success-800 mb-1">
                  {analytics.completedResponses}
                </Typography>
                <Typography variant="caption" className="text-success-600">
                  Slutförda
                </Typography>
              </div>
              
              <div className="text-center bg-warning-50 p-4 rounded-lg">
                <Typography variant="h5" className="text-warning-800 mb-1">
                  {analytics.totalParticipants - analytics.completedResponses}
                </Typography>
                <Typography variant="caption" className="text-warning-600">
                  Pågående
                </Typography>
              </div>
              
              <div className="text-center bg-neutral-50 p-4 rounded-lg">
                <Typography variant="h5" className="text-neutral-800 mb-1">
                  {Math.round(analytics.averageScore)}%
                </Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Snittresultat
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Participants Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Deltagarlista</CardTitle>
            {!canAccessPremium && (
              <div className="bg-warning-50 text-warning-700 p-3 rounded-md">
                <Typography variant="caption">
                  Premium krävs för att visa individuella resultat
                </Typography>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {/* Sort Controls */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Typography variant="body2" className="text-neutral-600 mr-2">
                Sortera efter:
              </Typography>
              <Button
                variant={sortBy === 'name' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleSort('name')}
              >
                Namn {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant={sortBy === 'score' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleSort('score')}
              >
                Resultat {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant={sortBy === 'time' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleSort('time')}
              >
                Tid {sortBy === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant={sortBy === 'completion' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleSort('completion')}
              >
                Status {sortBy === 'completion' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </div>

            {/* Participants List */}
            <div className="space-y-3">
              {sortedParticipants.map((student, index) => (
                <motion.div
                  key={student.studentId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`border border-neutral-200 rounded-lg p-4 transition-all duration-200 ${
                    canAccessPremium 
                      ? 'hover:border-primary-300 hover:shadow-sm cursor-pointer' 
                      : 'cursor-default'
                  }`}
                  onClick={() => canAccessPremium && onStudentSelect(student)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Typography variant="body2" className="text-primary-700 font-bold">
                          {getDisplayName(student).charAt(0).toUpperCase()}
                        </Typography>
                      </div>
                      
                      {/* Student Info */}
                      <div>
                        <Typography variant="body1" className="font-medium">
                          {getDisplayName(student)}
                        </Typography>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(student)}
                          {student.completedAt && (
                            <Typography variant="caption" className="text-neutral-500">
                              Slutförd {student.completedAt.toLocaleTimeString('sv-SE', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="flex items-center space-x-6">
                      {student.completedAt && (
                        <>
                          <div className="text-center">
                            <Typography variant="h6" className={getScoreColor(student.accuracy)}>
                              {Math.round(student.accuracy)}%
                            </Typography>
                            <Typography variant="caption" className="text-neutral-500">
                              {student.score}/{student.totalPoints} poäng
                            </Typography>
                          </div>
                          
                          <div className="text-center">
                            <Typography variant="h6" className="text-neutral-700">
                              {formatTime(student.timeSpent)}
                            </Typography>
                            <Typography variant="caption" className="text-neutral-500">
                              tid
                            </Typography>
                          </div>
                        </>
                      )}
                      
                      {canAccessPremium && (
                        <Button variant="outline" size="sm">
                          Visa detaljer
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar for Completed Students */}
                  {student.completedAt && (
                    <div className="mt-3">
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            student.accuracy >= 80 
                              ? 'bg-success-500' 
                              : student.accuracy >= 60 
                              ? 'bg-warning-500' 
                              : 'bg-error-500'
                          }`}
                          style={{ width: `${student.accuracy}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {analytics.participantResults.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <Typography variant="h6" className="text-neutral-600 mb-2">
                  Inga deltagare än
                </Typography>
                <Typography variant="body2" className="text-neutral-500">
                  Deltagare kommer att visas här när de går med i quizet.
                </Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}