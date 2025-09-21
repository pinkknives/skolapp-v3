'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Users, BarChart3, Clock } from 'lucide-react'
import { useQuizControl } from '@/hooks/useQuizControl'
import { useQuizAnswers } from '@/hooks/useQuizAnswers'

interface Question {
  id: string
  title: string
}

interface LiveQuizDisplayProps {
  quizId: string
  quizTitle: string
  questions: Question[]
  className?: string
}

export function LiveQuizDisplay({ 
  quizId, 
  quizTitle,
  questions,
  className = ''
}: LiveQuizDisplayProps) {
  // Use read-only mode (no role specified for public displays)
  const { state, participants, isConnected, studentCount } = useQuizControl(quizId)
  const { getAnswerCountForQuestion } = useQuizAnswers(quizId)

  const currentQuestion = questions.find(q => q.id === state.questionId)
  const currentQuestionIndex = currentQuestion 
    ? questions.findIndex(q => q.id === currentQuestion.id) 
    : -1

  const currentAnswerCount = currentQuestion 
    ? getAnswerCountForQuestion(currentQuestion.id) 
    : 0

  const responseRate = studentCount > 0 
    ? Math.round((currentAnswerCount / studentCount) * 100) 
    : 0

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-8 ${className}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <Typography variant="h1" className="text-4xl font-bold text-primary-900 mb-2">
            {quizTitle}
          </Typography>
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <Typography variant="body2" className="font-medium">
                {isConnected ? 'Realtid aktiv' : 'Ansluter...'}
              </Typography>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full">
              <Users className="w-4 h-4" />
              <Typography variant="body2" className="font-medium">
                {studentCount} deltagare
              </Typography>
            </div>
          </div>
        </div>

        {/* Quiz Status */}
        {state.phase === 'idle' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-primary-500 mx-auto mb-6" />
                <Typography variant="h2" className="text-2xl font-bold text-primary-900 mb-4">
                  Quiz startar snart
                </Typography>
                <Typography variant="body1" className="text-primary-700">
                  Väntar på att läraren ska starta quizet
                </Typography>
              </div>
            </CardContent>
          </Card>
        )}

        {state.phase === 'running' && currentQuestion && (
          <div className="space-y-6">
            {/* Current Question */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="text-center">
                <Typography variant="body2" className="text-primary-600 font-medium">
                  Fråga {currentQuestionIndex + 1} av {questions.length}
                </Typography>
                <CardTitle className="text-3xl text-primary-900">
                  {currentQuestion.title}
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Response Progress */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Svar mottagna
                  </CardTitle>
                  <Typography variant="h3" className="text-2xl font-bold text-primary-900">
                    {currentAnswerCount} / {studentCount}
                  </Typography>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="w-full bg-neutral-200 rounded-full h-6">
                    {/* Progress bar requires inline style for dynamic width */}
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-center"
                      style={{ width: `${Math.min(responseRate, 100)}%` }}
                    >
                      {responseRate > 10 && (
                        <Typography variant="body2" className="text-white font-medium">
                          {responseRate}%
                        </Typography>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <Typography variant="body1" className="text-primary-800">
                      {responseRate}% av eleverna har svarat
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {state.phase === 'ended' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <Typography variant="h2" className="text-2xl font-bold text-green-900 mb-4">
                  Quiz avslutat!
                </Typography>
                <Typography variant="body1" className="text-green-700">
                  Alla svar har samlats in
                </Typography>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants Summary */}
        {participants.length > 0 && (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Aktiva deltagare ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {participants
                  .filter(p => p.data.role === 'student')
                  .map((participant, index) => (
                    <div 
                      key={`${participant.clientId}-${index}`}
                      className="bg-white/60 px-3 py-2 rounded-lg text-center"
                    >
                      <Typography variant="body2" className="font-medium text-primary-900">
                        {participant.data.name}
                      </Typography>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}