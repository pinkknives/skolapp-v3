'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  SkipForward,
  BarChart3,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'

interface LiveStats {
  totalParticipants: number
  answeredCurrent: number
  correctAnswers: number
  averageTime: number
  currentQuestion: number
  totalQuestions: number
}

interface Participant {
  id: string
  name: string
  hasAnswered: boolean
  isCorrect?: boolean
  answerTime?: number
  joinedAt: Date
}

interface ImprovedLiveDashboardProps {
  quizId: string
  quizTitle: string
  questions: Array<{ id: string; question: string; options?: Array<{ id: string; text: string }> }>
  currentQuestionIndex: number
  isLive: boolean
  stats: LiveStats
  participants: Participant[]
  onStartQuiz: () => void
  onPauseQuiz: () => void
  onNextQuestion: () => void
  onEndQuiz: () => void
  onRevealAnswers: () => void
  className?: string
}

const statVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
}

const participantVariants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
}

export function ImprovedLiveDashboard({
  quizId: _quizId,
  quizTitle,
  questions,
  currentQuestionIndex,
  isLive,
  stats,
  participants,
  onStartQuiz,
  onPauseQuiz,
  onNextQuestion,
  onEndQuiz,
  onRevealAnswers,
  className = ''
}: ImprovedLiveDashboardProps) {
  const [showParticipants, setShowParticipants] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Auto-refresh stats
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 2000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const currentQuestion = questions[currentQuestionIndex]
  const answerRate = stats.totalParticipants > 0 
    ? Math.round((stats.answeredCurrent / stats.totalParticipants) * 100) 
    : 0
  const correctRate = stats.answeredCurrent > 0 
    ? Math.round((stats.correctAnswers / stats.answeredCurrent) * 100) 
    : 0

  const getAnswerRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAnswerRateBg = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 dark:bg-green-900/20'
    if (rate >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level={2} className="text-foreground">
            {quizTitle}
          </Heading>
          <Typography variant="body2" className="text-muted-foreground">
            Live Dashboard • Uppdaterad {lastUpdate.toLocaleTimeString()}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'text-green-600' : 'text-muted-foreground'}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Participants */}
        <motion.div
          variants={statVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-muted-foreground mb-1">
                    Deltagare
                  </Typography>
                  <Typography variant="h3" className="text-foreground font-bold">
                    {stats.totalParticipants}
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Answer Rate */}
        <motion.div
          variants={statVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-muted-foreground mb-1">
                    Svarade
                  </Typography>
                  <Typography variant="h3" className={`font-bold ${getAnswerRateColor(answerRate)}`}>
                    {answerRate}%
                  </Typography>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getAnswerRateBg(answerRate)}`}>
                  <CheckCircle className="w-6 h-6 text-current" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Correct Rate */}
        <motion.div
          variants={statVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-muted-foreground mb-1">
                    Korrekta
                  </Typography>
                  <Typography variant="h3" className="text-green-600 font-bold">
                    {correctRate}%
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Time */}
        <motion.div
          variants={statVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-muted-foreground mb-1">
                    Genomsnittstid
                  </Typography>
                  <Typography variant="h3" className="text-foreground font-bold">
                    {stats.averageTime}s
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Current Question Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Fråga {currentQuestionIndex + 1} av {questions.length}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Typography variant="body2" className="text-muted-foreground">
                Live
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
              <Typography variant="h6" className="text-foreground mb-2">
                {currentQuestion?.question || 'Ingen fråga aktiv'}
              </Typography>
              {currentQuestion?.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index: number) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Typography variant="body2" className="text-foreground">
                        {option.text}
                      </Typography>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Svarade: {stats.answeredCurrent}/{stats.totalParticipants}</span>
                <span className="text-muted-foreground">{answerRate}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <motion.div
                  className="bg-primary-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${answerRate}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {!isLive ? (
              <Button
                onClick={onStartQuiz}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Starta Quiz
              </Button>
            ) : (
              <>
                <Button
                  onClick={onPauseQuiz}
                  variant="outline"
                  size="lg"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pausa
                </Button>
                <Button
                  onClick={onNextQuestion}
                  size="lg"
                  disabled={currentQuestionIndex >= questions.length - 1}
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Nästa Fråga
                </Button>
                <Button
                  onClick={onRevealAnswers}
                  variant="outline"
                  size="lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visa Svar
                </Button>
                <Button
                  onClick={onEndQuiz}
                  variant="destructive"
                  size="lg"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Avsluta Quiz
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Deltagare ({participants.length})
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              {showParticipants ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {showParticipants && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 max-h-64 overflow-y-auto"
              >
                {participants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    variants={participantVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                        <Typography variant="body2" className="font-medium text-primary-600">
                          {participant.name.charAt(0).toUpperCase()}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" className="font-medium text-foreground">
                          {participant.name}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          Anslöt {participant.joinedAt.toLocaleTimeString()}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {participant.hasAnswered ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <Typography variant="caption" className="font-medium">
                            Svarat
                          </Typography>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Clock className="w-4 h-4" />
                          <Typography variant="caption" className="font-medium">
                            Väntar
                          </Typography>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
