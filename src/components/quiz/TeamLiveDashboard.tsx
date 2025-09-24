'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { 
  Play, 
  Pause, 
  SkipForward,
  BarChart3,
  Zap,
  Trophy,
  Clock,
  Target,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'
import { LiveLeaderboard } from './LiveLeaderboard'
import { PowerUpPanel } from './PowerUpPanel'
import type { 
  TeamQuizSession, 
  TeamRanking, 
  TeamAnswer,
  TeamPowerUpUsage 
} from '@/types/team-quiz'
import { getProgressClass } from '@/lib/team-colors'

interface Question {
  id: string
  title: string
  type: 'multiple-choice' | 'text' | 'number'
  options?: Array<{ id: string; text: string }>
}

interface TeamLiveDashboardProps {
  session: TeamQuizSession
  currentQuestion?: Question
  rankings?: TeamRanking[]
  onStartQuiz: () => void
  onPauseQuiz: () => void
  onNextQuestion: () => void
  onEndQuiz: () => void
  onRevealAnswers: () => void
  onUsePowerUp: (teamId: string, powerUpId: string, questionId: string) => void
  className?: string
}

export function TeamLiveDashboard({
  session,
  currentQuestion,
  rankings = [],
  onStartQuiz,
  onPauseQuiz,
  onNextQuestion,
  onEndQuiz,
  onRevealAnswers,
  onUsePowerUp,
  className = ''
}: TeamLiveDashboardProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(true)
  const [showPowerUps, setShowPowerUps] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Mock data - in real app this would come from props or API
  const [teamAnswers] = useState<TeamAnswer[]>([])
  const [_powerUpUsages] = useState<TeamPowerUpUsage[]>([])

  // Use rankings from props or initialize from teams
  const currentRankings = rankings.length > 0 ? rankings : session.teams.map((team, index) => ({
    teamId: team.id,
    teamName: team.name,
    score: team.score,
    position: index + 1,
    change: 0,
    streak: Math.floor(Math.random() * 5),
    powerUpsUsed: team.powerUps.filter(p => p.isActive).length,
    averageTime: Math.floor(Math.random() * 60) + 30,
    accuracy: Math.floor(Math.random() * 40) + 60
  }))

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh || session.status !== 'active') return

    const interval = setInterval(() => {
      // Simulate real-time updates - in a real app, this would trigger a data fetch
      // The rankings prop will be updated by the parent component
    }, 3000)

    return () => clearInterval(interval)
  }, [autoRefresh, session.status])

  // Timer countdown
  useEffect(() => {
    if (session.status !== 'active' || !currentQuestion) return

    setTimeRemaining(30) // 30 seconds per question
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [session.status, currentQuestion])

  const progressPercentage = session.quizId ? 
    ((session.currentQuestion + 1) / 10) * 100 : 0 // Assuming 10 questions

  const totalParticipants = session.teams.reduce((sum, team) => sum + team.members.length, 0)
  const answeredCount = teamAnswers.length
  const correctAnswers = teamAnswers.filter(a => a.isCorrect).length

  const handleUsePowerUp = (teamId: string, powerUpId: string) => {
    if (currentQuestion) {
      onUsePowerUp(teamId, powerUpId, currentQuestion.id)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quiz Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Heading level={3} className="text-foreground">
              Team Quiz Live
            </Heading>
            <Typography variant="body2" className="text-muted-foreground">
              {session.teams.length} team • {totalParticipants} deltagare
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              session.status === 'active' 
                ? 'bg-green-100 text-green-700' 
                : session.status === 'paused'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {session.status === 'active' ? 'LIVE' : 
               session.status === 'paused' ? 'PAUSAD' : 'LOBBY'}
            </div>
            {timeRemaining > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{timeRemaining}s</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`bg-primary-600 h-2 rounded-full transition-all duration-300 ${getProgressClass(progressPercentage)}`}
                        />
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Play className="w-5 h-5 text-primary-500" />
            Quiz-kontroller
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-wrap gap-3">
            {session.status === 'lobby' && (
              <Button
                onClick={onStartQuiz}
                disabled={session.teams.length < 2}
                className="flex items-center gap-2"
                size="lg"
              >
                <Play className="w-4 h-4" />
                Starta Team Quiz
              </Button>
            )}
            
            {session.status === 'active' && (
              <>
                <Button
                  onClick={onNextQuestion}
                  disabled={!currentQuestion}
                  className="flex items-center gap-2"
                >
                  <SkipForward className="w-4 h-4" />
                  Nästa fråga
                </Button>
                <Button
                  onClick={onPauseQuiz}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pausa Quiz
                </Button>
              </>
            )}

            {session.status === 'paused' && (
              <Button
                onClick={onStartQuiz}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Återuppta Quiz
              </Button>
            )}

            <Button
              onClick={onRevealAnswers}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Visa svar
            </Button>

            <Button
              onClick={onEndQuiz}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Avsluta Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" />
              Aktuell fråga
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Typography variant="h6" className="text-foreground mb-4">
              {currentQuestion.type === 'multiple-choice' 
                ? (currentQuestion as { title: string }).title 
                : (currentQuestion as { title: string }).title
              }
            </Typography>
            {currentQuestion.type === 'multiple-choice' && (currentQuestion as { options?: Array<{ id: string; text: string }> }).options && (
              <div className="space-y-2">
                {(currentQuestion as { options: Array<{ id: string; text: string }> }).options.map((option: { id: string; text: string }, index: number) => (
                  <div key={option.id} className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded">
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-xs font-medium">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Typography variant="body2">{option.text}</Typography>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Statistics */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            Live Statistik
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Typography variant="h5" className="font-bold text-foreground">
                {session.teams.length}
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                Team
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="h5" className="font-bold text-foreground">
                {totalParticipants}
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                Deltagare
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="h5" className="font-bold text-foreground">
                {answeredCount}
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                Svarat
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="h5" className="font-bold text-foreground">
                {correctAnswers}
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                Rätt svar
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <Heading level={4} className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary-500" />
              Leaderboard
            </Heading>
            <Button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              variant="ghost"
              size="sm"
            >
              {showLeaderboard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showLeaderboard ? 'Dölj' : 'Visa'}
            </Button>
          </div>
          
          <AnimatePresence>
            {showLeaderboard && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
            <LiveLeaderboard
              rankings={currentRankings}
              teams={session.teams}
              isLive={session.status === 'active'}
              showAnimations={true}
            />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Power-ups Panel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Heading level={4} className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-500" />
              Power-ups
            </Heading>
            <Button
              onClick={() => setShowPowerUps(!showPowerUps)}
              variant="ghost"
              size="sm"
            >
              {showPowerUps ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPowerUps ? 'Dölj' : 'Visa'}
            </Button>
          </div>
          
          <AnimatePresence>
            {showPowerUps && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {session.teams.map((team) => (
                  <PowerUpPanel
                    key={team.id}
                    team={team}
                    onUsePowerUp={(powerUpId) => handleUsePowerUp(team.id, powerUpId)}
                    currentQuestionId={currentQuestion?.id || ''}
                    timeRemaining={timeRemaining}
                    isQuestionActive={session.status === 'active' && !!currentQuestion}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Auto-refresh Control */}
      <div className="flex justify-end items-center gap-2 text-muted-foreground text-xs">
        <RefreshCw className="w-3 h-3" />
        <span>Auto-uppdatering: {autoRefresh ? 'På' : 'Av'}</span>
        <Button
          onClick={() => setAutoRefresh(!autoRefresh)}
          variant="ghost"
          size="sm"
        >
          {autoRefresh ? 'Stäng av' : 'Slå på'}
        </Button>
      </div>
    </div>
  )
}
