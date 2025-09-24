'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import { AgeBasedButton } from '@/components/ui/AgeBasedButton'
import { useAgeBasedGamification, type AgeGroup } from '@/hooks/useAgeBasedGamification'
import { 
  Trophy, 
  Star, 
  Zap, 
  Users, 
  Target,
  Clock,
  Sparkles,
  Heart,
  Crown
} from 'lucide-react'
import type { Team, TeamRanking } from '@/types/team-quiz'

interface AgeBasedTeamQuizProps {
  teams: Team[]
  rankings: TeamRanking[]
  ageGroup: AgeGroup
  onAnswer: (teamId: string, answer: string) => void
  onUsePowerUp: (teamId: string, powerUpId: string) => void
  currentQuestion?: {
    id: string
    question: string
    options: string[]
    timeLimit: number
  }
  timeRemaining?: number
  isActive?: boolean
}

const ageBasedAnimations = {
  young: {
    initial: { scale: 0.8, opacity: 0, rotate: -10 },
    animate: { scale: 1, opacity: 1, rotate: 0 },
    exit: { scale: 0.8, opacity: 0, rotate: 10 },
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  },
  middle: {
    initial: { scale: 0.9, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.9, opacity: 0, y: -20 },
    transition: { type: "spring" as const, stiffness: 200, damping: 15 }
  },
  old: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 }
  },
  adult: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 }
  }
}

const ageBasedIcons = {
  young: {
    trophy: Crown,
    star: Star,
    zap: Sparkles,
    users: Heart,
    target: Target,
    clock: Clock
  },
  middle: {
    trophy: Trophy,
    star: Star,
    zap: Zap,
    users: Users,
    target: Target,
    clock: Clock
  },
  old: {
    trophy: Trophy,
    star: Star,
    zap: Zap,
    users: Users,
    target: Target,
    clock: Clock
  },
  adult: {
    trophy: Trophy,
    star: Star,
    zap: Zap,
    users: Users,
    target: Target,
    clock: Clock
  }
}

export function AgeBasedTeamQuiz({
  teams,
  rankings: _rankings,
  ageGroup,
  onAnswer,
  onUsePowerUp,
  currentQuestion,
  timeRemaining = 30,
  isActive = false
}: AgeBasedTeamQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [showCelebration, setShowCelebration] = useState(false)
  const [lastCorrectTeam, setLastCorrectTeam] = useState<string | null>(null)
  
  const {
    showConfetti,
    showEmoji,
    playSound,
    getCelebrationMessage
  } = useAgeBasedGamification(ageGroup)

  const animations = ageBasedAnimations[ageGroup]
  const icons = ageBasedIcons[ageGroup]
  const TrophyIcon = icons.trophy
  const UsersIcon = icons.users
  const TargetIcon = icons.target
  const ClockIcon = icons.clock

  // Handle correct answer celebration
  useEffect(() => {
    if (lastCorrectTeam) {
      setShowCelebration(true)
      showConfetti('success')
      showEmoji('🎉')
      playSound('success')
      
      setTimeout(() => {
        setShowCelebration(false)
        setLastCorrectTeam(null)
      }, 2000)
    }
  }, [lastCorrectTeam, showConfetti, showEmoji, playSound])

  const handleAnswer = (teamId: string, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [teamId]: answer }))
    onAnswer(teamId, answer)
    
    // Simulate correct answer for demonstration
    if (Math.random() > 0.3) {
      setLastCorrectTeam(teamId)
    }
  }

  const handlePowerUp = (teamId: string, powerUpId: string) => {
    onUsePowerUp(teamId, powerUpId)
    showConfetti('celebration')
    showEmoji('⚡')
    playSound('notification')
  }

  const getTeamColor = (index: number) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ]
    return colors[index % colors.length]
  }

  const getAgeBasedMessage = (type: 'correct' | 'incorrect' | 'victory' | 'encouragement') => {
    return getCelebrationMessage(type)
  }

  return (
    <div className="space-y-6">
      {/* Header with age-appropriate styling */}
      <motion.div
        initial={animations.initial}
        animate={animations.animate}
        transition={animations.transition}
        className="text-center"
      >
        <Heading 
          level={1} 
          className={`mb-4 ${
            ageGroup === 'young' ? 'text-4xl font-bold text-purple-600' :
            ageGroup === 'middle' ? 'text-3xl font-semibold text-blue-600' :
            ageGroup === 'old' ? 'text-2xl font-medium text-gray-700' :
            'text-xl font-normal text-gray-600'
          }`}
        >
          {ageGroup === 'young' && '🌟 Team Quiz Tids! 🌟'}
          {ageGroup === 'middle' && 'Team Quiz'}
          {ageGroup === 'old' && 'Team Quiz'}
          {ageGroup === 'adult' && 'Team Quiz'}
        </Heading>
        
        {ageGroup === 'young' && (
          <Typography variant="body1" className="text-lg text-purple-500 mb-4">
            Låt oss ha kul tillsammans! 🎉
          </Typography>
        )}
      </motion.div>

      {/* Current Question */}
      {currentQuestion && (
        <motion.div
          initial={animations.initial}
          animate={animations.animate}
          transition={animations.transition}
        >
          <Card className={`${
            ageGroup === 'young' ? 'border-4 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' :
            ageGroup === 'middle' ? 'border-2 border-blue-200 bg-blue-50' :
            ageGroup === 'old' ? 'border border-gray-200 bg-gray-50' :
            'border border-gray-200 bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${
                ageGroup === 'young' ? 'text-2xl text-purple-700' :
                ageGroup === 'middle' ? 'text-xl text-blue-700' :
                'text-lg text-gray-700'
              }`}>
                <TargetIcon className={`${
                  ageGroup === 'young' ? 'w-8 h-8 text-purple-500' :
                  ageGroup === 'middle' ? 'w-6 h-6 text-blue-500' :
                  'w-5 h-5 text-gray-500'
                }`} />
                {ageGroup === 'young' ? 'Fråga! 🤔' : 'Fråga'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="body1" className={`mb-4 ${
                ageGroup === 'young' ? 'text-lg font-semibold text-purple-800' :
                ageGroup === 'middle' ? 'text-base font-medium text-blue-800' :
                'text-base text-gray-800'
              }`}>
                {currentQuestion.question}
              </Typography>
              
              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQuestion.options.map((option, index) => (
                  <AgeBasedButton
                    key={index}
                    ageGroup={ageGroup}
                    variant="secondary"
                    onClick={() => {
                      // Handle answer selection for all teams
                      teams.forEach(team => {
                        if (!selectedAnswers[team.id]) {
                          handleAnswer(team.id, option)
                        }
                      })
                    }}
                    className={`${
                      ageGroup === 'young' ? 'text-lg font-bold' :
                      ageGroup === 'middle' ? 'text-base font-semibold' :
                      'text-sm'
                    }`}
                  >
                    {ageGroup === 'young' && `${['A', 'B', 'C', 'D'][index]}: `}
                    {option}
                  </AgeBasedButton>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timer */}
      {isActive && (
        <motion.div
          initial={animations.initial}
          animate={animations.animate}
          transition={animations.transition}
          className="text-center"
        >
          <Card className={`${
            ageGroup === 'young' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300' :
            ageGroup === 'middle' ? 'bg-blue-100 border-blue-300' :
            'bg-gray-100 border-gray-300'
          }`}>
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-2">
                <ClockIcon className={`${
                  ageGroup === 'young' ? 'w-8 h-8 text-orange-500' :
                  ageGroup === 'middle' ? 'w-6 h-6 text-blue-500' :
                  'w-5 h-5 text-gray-500'
                }`} />
                <Typography variant="h3" className={`${
                  ageGroup === 'young' ? 'text-4xl font-bold text-orange-600' :
                  ageGroup === 'middle' ? 'text-3xl font-semibold text-blue-600' :
                  'text-2xl font-medium text-gray-600'
                }`}>
                  {timeRemaining}s
                </Typography>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={animations.initial}
            animate={animations.animate}
            transition={{ ...animations.transition, delay: index * 0.1 }}
          >
            <Card className={`${
              ageGroup === 'young' ? 'border-4 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' :
              ageGroup === 'middle' ? 'border-2 border-blue-200 bg-blue-50' :
              ageGroup === 'old' ? 'border border-gray-200 bg-gray-50' :
              'border border-gray-200 bg-white'
            } ${lastCorrectTeam === team.id ? 'ring-4 ring-green-300' : ''}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${
                  ageGroup === 'young' ? 'text-xl text-purple-700' :
                  ageGroup === 'middle' ? 'text-lg text-blue-700' :
                  'text-base text-gray-700'
                }`}>
                  <div className={`w-4 h-4 rounded-full ${getTeamColor(index)}`} />
                  {ageGroup === 'young' && '🏆 '}
                  {team.name}
                  {ageGroup === 'young' && ' 🏆'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrophyIcon className={`${
                        ageGroup === 'young' ? 'w-6 h-6 text-yellow-500' :
                        ageGroup === 'middle' ? 'w-5 h-5 text-blue-500' :
                        'w-4 h-4 text-gray-500'
                      }`} />
                      <Typography variant="body2" className={`${
                        ageGroup === 'young' ? 'text-lg font-bold text-purple-600' :
                        ageGroup === 'middle' ? 'text-base font-semibold text-blue-600' :
                        'text-sm font-medium text-gray-600'
                      }`}>
                        {ageGroup === 'young' ? `${team.score} poäng! ⭐` : `${team.score} poäng`}
                      </Typography>
                    </div>
                    
                    {/* Power-up Button */}
                    <AgeBasedButton
                      ageGroup={ageGroup}
                      variant="primary"
                      size="sm"
                      onClick={() => handlePowerUp(team.id, 'test-powerup')}
                      showConfetti={ageGroup === 'young' || ageGroup === 'middle'}
                    >
                      {ageGroup === 'young' ? 'Power-up! ⚡' : 'Power-up'}
                    </AgeBasedButton>
                  </div>

                  {/* Team Members */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <UsersIcon className={`${
                        ageGroup === 'young' ? 'w-5 h-5 text-purple-500' :
                        ageGroup === 'middle' ? 'w-4 h-4 text-blue-500' :
                        'w-4 h-4 text-gray-500'
                      }`} />
                      <Typography variant="caption" className={`${
                        ageGroup === 'young' ? 'text-sm font-semibold text-purple-600' :
                        ageGroup === 'middle' ? 'text-sm font-medium text-blue-600' :
                        'text-xs text-gray-600'
                      }`}>
                        {ageGroup === 'young' ? 'Teammedlemmar:' : 'Medlemmar:'}
                      </Typography>
                    </div>
                    <div className="space-y-1">
                      {team.members.map((member) => (
                        <div key={member.id} className={`flex items-center gap-2 ${
                          ageGroup === 'young' ? 'text-sm' : 'text-xs'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <span className={`${
                            ageGroup === 'young' ? 'font-semibold text-purple-700' :
                            ageGroup === 'middle' ? 'font-medium text-blue-700' :
                            'text-gray-700'
                          }`}>
                            {ageGroup === 'young' && '👤 '}
                            {member.name}
                            {ageGroup === 'young' && ' 👤'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="text-center">
              <Typography variant="h1" className={`${
                ageGroup === 'young' ? 'text-6xl font-bold text-yellow-500' :
                ageGroup === 'middle' ? 'text-4xl font-semibold text-blue-500' :
                'text-2xl font-medium text-green-500'
              }`}>
                {getAgeBasedMessage('correct')}
              </Typography>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
