'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { 
  Zap, 
  Clock, 
  Lightbulb, 
  SkipForward, 
  Shield, 
  Star,
  Target,
  Flame,
  Sparkles,
  Coins,
  Timer,
  CheckCircle,
  XCircle
} from 'lucide-react'
import type { PowerUp, PowerUpType, Team } from '@/types/team-quiz'

interface PowerUpPanelProps {
  team: Team
  onUsePowerUp: (powerUpId: string, questionId: string) => void
  currentQuestionId: string
  timeRemaining?: number
  isQuestionActive: boolean
  onPowerUpUsed?: (powerUpId: string, teamId: string) => void
  className?: string
}

const powerUpIcons: Record<PowerUpType, React.ReactNode> = {
  double_points: <Star className="w-5 h-5" />,
  time_boost: <Timer className="w-5 h-5" />,
  hint: <Lightbulb className="w-5 h-5" />,
  skip_question: <SkipForward className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  multiplier: <Target className="w-5 h-5" />,
  streak_protection: <Flame className="w-5 h-5" />
}

const powerUpColors: Record<PowerUpType, string> = {
  double_points: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  time_boost: 'bg-blue-100 text-blue-700 border-blue-300',
  hint: 'bg-purple-100 text-purple-700 border-purple-300',
  skip_question: 'bg-red-100 text-red-700 border-red-300',
  shield: 'bg-green-100 text-green-700 border-green-300',
  multiplier: 'bg-orange-100 text-orange-700 border-orange-300',
  streak_protection: 'bg-pink-100 text-pink-700 border-pink-300'
}

export function PowerUpPanel({
  team,
  onUsePowerUp,
  currentQuestionId,
  timeRemaining = 0,
  isQuestionActive,
  onPowerUpUsed,
  className = ''
}: PowerUpPanelProps) {
  const [usedPowerUps, setUsedPowerUps] = useState<Set<string>>(new Set())
  const [showEffects, setShowEffects] = useState<Set<string>>(new Set())
  const [teamScore, setTeamScore] = useState(team.score)

  // Update team score when it changes
  useEffect(() => {
    setTeamScore(team.score)
  }, [team.score])

  const handleUsePowerUp = (powerUp: PowerUp) => {
    if (usedPowerUps.has(powerUp.id) || !isQuestionActive) return

    setUsedPowerUps(prev => new Set([...prev, powerUp.id]))
    setShowEffects(prev => new Set([...prev, powerUp.id]))
    
    onUsePowerUp(powerUp.id, currentQuestionId)
    onPowerUpUsed?.(powerUp.id, team.id)
    
    // Remove effect after duration
    if (powerUp.duration) {
      setTimeout(() => {
        setShowEffects(prev => {
          const newSet = new Set(prev)
          newSet.delete(powerUp.id)
          return newSet
        })
      }, powerUp.duration * 1000)
    }
  }

  const canAfford = (powerUp: PowerUp) => teamScore >= powerUp.cost
  const isUsed = (powerUpId: string) => usedPowerUps.has(powerUpId)
  const isActive = (powerUp: PowerUp) => showEffects.has(powerUp.id)

  const getPowerUpDescription = (powerUp: PowerUp) => {
    switch (powerUp.type) {
      case 'double_points':
        return `Dubbla poäng för nästa rätta svar (${powerUp.effect.value}x)`
      case 'time_boost':
        return `Få ${powerUp.effect.value} extra sekunder`
      case 'hint':
        return `Få en ledtråd för denna fråga`
      case 'skip_question':
        return `Hoppa över denna fråga`
      case 'shield':
        return `Skydd mot fel svar i ${powerUp.effect.value} frågor`
      case 'multiplier':
        return `Poängmultiplikator: ${powerUp.effect.value}x`
      case 'streak_protection':
        return `Behåll din streak vid fel svar`
      default:
        return powerUp.description
    }
  }

  const getTimeRemainingText = () => {
    if (timeRemaining <= 0) return 'Tid slut!'
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-primary-500" />
            <div>
              <CardTitle className="text-lg">Power-ups</CardTitle>
              <Typography variant="body2" className="text-muted-foreground">
                {team.name} • {teamScore} poäng
              </Typography>
            </div>
          </div>
          {timeRemaining > 0 && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              timeRemaining <= 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="w-4 h-4" />
              <Typography variant="body2" className="font-semibold">
                {getTimeRemainingText()}
              </Typography>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Effects */}
        <AnimatePresence>
          {Array.from(showEffects).length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Typography variant="body2" className="font-semibold text-green-600">
                Aktiva effekter:
              </Typography>
              {Array.from(showEffects).map(powerUpId => {
                const powerUp = team.powerUps.find(p => p.id === powerUpId)
                if (!powerUp) return null
                
                return (
                  <motion.div
                    key={powerUpId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <Typography variant="body2" className="text-green-700 dark:text-green-400">
                      {powerUp.name} är aktiv
                    </Typography>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Power-ups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {team.powerUps.map((powerUp) => {
            const canUse = canAfford(powerUp) && !isUsed(powerUp.id) && isQuestionActive
            const used = isUsed(powerUp.id)
            const active = isActive(powerUp)

            return (
              <motion.div
                key={powerUp.id}
                whileHover={canUse ? { scale: 1.02 } : {}}
                whileTap={canUse ? { scale: 0.98 } : {}}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                  ${canUse 
                    ? 'hover:shadow-md border-primary-300 bg-white dark:bg-gray-800' 
                    : 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700'
                  }
                  ${used ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  ${active ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20' : ''}
                `}
                onClick={() => canUse && handleUsePowerUp(powerUp)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${powerUpColors[powerUp.type]}`}>
                      {powerUpIcons[powerUp.type]}
                    </div>
                    <div>
                      <Typography variant="body1" className="font-semibold">
                        {powerUp.name}
                      </Typography>
                      <Typography variant="caption" className="text-muted-foreground">
                        {getPowerUpDescription(powerUp)}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Coins className="w-4 h-4" />
                      <Typography variant="body2" className="font-semibold">
                        {powerUp.cost}
                      </Typography>
                    </div>
                    {used && <XCircle className="w-5 h-5 text-red-500" />}
                    {active && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                </div>

                {/* Usage Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!canUse && !used && (
                      <Typography variant="caption" className="text-red-600">
                        Inte tillräckligt med poäng
                      </Typography>
                    )}
                    {used && (
                      <Typography variant="caption" className="text-gray-600">
                        Använd
                      </Typography>
                    )}
                    {active && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="flex items-center gap-1 text-green-600"
                      >
                        <Sparkles className="w-3 h-3" />
                        <Typography variant="caption" className="font-semibold">
                          Aktiv
                        </Typography>
                      </motion.div>
                    )}
                  </div>
                  
                  {powerUp.duration && active && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Timer className="w-3 h-3" />
                      <Typography variant="caption">
                        {powerUp.duration}s
                      </Typography>
                    </div>
                  )}
                </div>

                {/* Hover Effect */}
                {canUse && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-primary-400 opacity-0"
                    whileHover={{ opacity: 0.3 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Team Stats */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Typography variant="h6" className="font-bold text-primary-600">
                {teamScore}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                Poäng
              </Typography>
            </div>
            <div>
              <Typography variant="h6" className="font-bold text-green-600">
                {team.powerUps.filter(p => isUsed(p.id)).length}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                Använda
              </Typography>
            </div>
            <div>
              <Typography variant="h6" className="font-bold text-blue-600">
                {team.powerUps.filter(p => canAfford(p) && !isUsed(p.id)).length}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                Tillgängliga
              </Typography>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!isQuestionActive && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Typography variant="body2" className="text-blue-700 dark:text-blue-400 text-center">
              Väntar på nästa fråga för att använda power-ups
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
