'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Zap,
  Star,
  Clock,
  Target,
  Flame
} from 'lucide-react'
import type { TeamRanking, Team } from '@/types/team-quiz'
import { getTeamColorClass, getProgressClass } from '@/lib/team-colors'

interface LiveLeaderboardProps {
  rankings: TeamRanking[]
  teams: Team[]
  isLive: boolean
  showAnimations?: boolean
  onRankingUpdate?: (rankings: TeamRanking[]) => void
  className?: string
}

const positionIcons = {
  1: <Trophy className="w-6 h-6 text-yellow-500" />,
  2: <Medal className="w-6 h-6 text-gray-400" />,
  3: <Medal className="w-6 h-6 text-amber-600" />
}

const changeIcons = {
  up: <TrendingUp className="w-4 h-4 text-green-500" />,
  down: <TrendingDown className="w-4 h-4 text-red-500" />,
  same: <Minus className="w-4 h-4 text-gray-400" />
}

export function LiveLeaderboard({
  rankings,
  teams: _teams,
  isLive,
  showAnimations = true,
  onRankingUpdate,
  className = ''
}: LiveLeaderboardProps) {
  const [previousRankings, setPreviousRankings] = useState<TeamRanking[]>([])
  const [highlightedTeam, setHighlightedTeam] = useState<string | null>(null)

  // Update previous rankings when new ones come in
  useEffect(() => {
    if (rankings.length > 0) {
      setPreviousRankings(rankings)
      onRankingUpdate?.(rankings)
    }
  }, [rankings, onRankingUpdate])


  const getPositionChange = (teamId: string) => {
    const current = rankings.find(r => r.teamId === teamId)
    const previous = previousRankings.find(r => r.teamId === teamId)
    
    if (!current || !previous) return 'same'
    
    if (current.position < previous.position) return 'up'
    if (current.position > previous.position) return 'down'
    return 'same'
  }

  const getScoreChange = (teamId: string) => {
    const current = rankings.find(r => r.teamId === teamId)
    const previous = previousRankings.find(r => r.teamId === teamId)
    
    if (!current || !previous) return 0
    return current.score - previous.score
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 5) return '🔥'
    if (streak >= 3) return '⚡'
    if (streak >= 2) return '⭐'
    return ''
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-primary-500" />
            <div>
              <CardTitle className="text-xl">Live Leaderboard</CardTitle>
              <Typography variant="body2" className="text-muted-foreground">
                {isLive ? 'Realtidsranking' : 'Slutresultat'} • {rankings.length} team
              </Typography>
            </div>
          </div>
          {isLive && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Typography variant="caption" className="font-semibold">
                LIVE
              </Typography>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-2">
          <AnimatePresence>
            {rankings.map((ranking, index) => {
              const positionChange = getPositionChange(ranking.teamId)
              const scoreChange = getScoreChange(ranking.teamId)
              const isHighlighted = highlightedTeam === ranking.teamId

              return (
                <motion.div
                  key={ranking.teamId}
                  initial={showAnimations ? { opacity: 0, x: -20 } : false}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: isHighlighted ? 1.02 : 1
                  }}
                  exit={showAnimations ? { opacity: 0, x: 20 } : undefined}
                  transition={{ 
                    delay: showAnimations ? index * 0.1 : 0,
                    duration: 0.3
                  }}
                  layout
                  className={`
                    relative p-4 rounded-lg border transition-all duration-300
                    ${isHighlighted 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg' 
                      : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                    }
                    ${ranking.position <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10' : ''}
                  `}
                  onMouseEnter={() => setHighlightedTeam(ranking.teamId)}
                  onMouseLeave={() => setHighlightedTeam(null)}
                >
                  {/* Position Badge */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    {positionIcons[ranking.position as keyof typeof positionIcons] || (
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Typography variant="body2" className="font-bold text-gray-600 dark:text-gray-300">
                          {ranking.position}
                        </Typography>
                      </div>
                    )}
                  </div>

                  {/* Team Info */}
                  <div className="ml-12 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full ${getTeamColorClass(ranking.teamId)}`}
                        />
                        <Typography variant="h6" className="font-semibold">
                          {ranking.teamName}
                        </Typography>
                        {ranking.streak > 1 && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Flame className="w-4 h-4" />
                            <Typography variant="caption" className="font-bold">
                              {ranking.streak}
                            </Typography>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Score */}
                        <div className="text-right">
                          <Typography variant="h6" className="font-bold text-primary-600">
                            {ranking.score}
                          </Typography>
                          {scoreChange > 0 && showAnimations && (
                            <motion.div
                              initial={{ opacity: 0, y: 0 }}
                              animate={{ opacity: 1, y: -10 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="text-green-600 text-sm font-semibold"
                            >
                              +{scoreChange}
                            </motion.div>
                          )}
                        </div>

                        {/* Position Change */}
                        {positionChange !== 'same' && showAnimations && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center"
                          >
                            {changeIcons[positionChange]}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{Math.round(ranking.accuracy)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(ranking.averageTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        <span>{ranking.powerUpsUsed}</span>
                      </div>
                      {ranking.streak > 1 && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Star className="w-4 h-4" />
                          <span>{getStreakEmoji(ranking.streak)} {ranking.streak}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${getTeamColorClass(ranking.teamId)} ${getProgressClass(Math.min((ranking.score / Math.max(...rankings.map(r => r.score))) * 100, 100))}`}
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.min((ranking.score / Math.max(...rankings.map(r => r.score))) * 100, 100)}%` 
                        }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Special Effects */}
                  {ranking.position === 1 && showAnimations && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-yellow-400 opacity-20"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}

                  {ranking.streak >= 5 && showAnimations && (
                    <motion.div
                      className="absolute -top-1 -right-1 text-2xl"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 0.5, 
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    >
                      🔥
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Summary Stats */}
        {rankings.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <Typography variant="h6" className="font-bold text-primary-600">
                  {rankings[0]?.score || 0}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Högsta poäng
                </Typography>
              </div>
              <div>
                <Typography variant="h6" className="font-bold text-green-600">
                  {Math.round(rankings.reduce((sum, r) => sum + r.accuracy, 0) / rankings.length)}%
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Snittkorrekthet
                </Typography>
              </div>
              <div>
                <Typography variant="h6" className="font-bold text-blue-600">
                  {formatTime(Math.round(rankings.reduce((sum, r) => sum + r.averageTime, 0) / rankings.length))}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Snitttid
                </Typography>
              </div>
              <div>
                <Typography variant="h6" className="font-bold text-purple-600">
                  {rankings.reduce((sum, r) => sum + r.powerUpsUsed, 0)}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Power-ups använda
                </Typography>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
