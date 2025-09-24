'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Typography } from '@/components/ui/Typography'
import { 
  Users, 
  Crown, 
  UserPlus, 
  UserMinus,
  Zap,
  Star,
  Target,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  Trophy
} from 'lucide-react'
import type { Team, TeamMember } from '@/types/team-quiz'
import { getTeamColorClass } from '@/lib/team-colors'

interface TeamJoinInterfaceProps {
  teams: Team[]
  onJoinTeam: (teamId: string, memberName: string) => void
  onLeaveTeam: (teamId: string, memberId: string) => void
  onCreateTeam: (teamName: string, memberName: string) => void
  currentMember?: TeamMember
  className?: string
}

export function TeamJoinInterface({
  teams,
  onJoinTeam,
  onLeaveTeam,
  onCreateTeam,
  currentMember,
  className = ''
}: TeamJoinInterfaceProps) {
  const [step, setStep] = useState<'select' | 'join' | 'create' | 'waiting'>('select')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [memberName, setMemberName] = useState('')
  const [newTeamName, setNewTeamName] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto-refresh teams
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // In real app, this would fetch updated teams
    }, 2000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const handleJoinTeam = () => {
    if (!selectedTeam || !memberName.trim()) return
    onJoinTeam(selectedTeam, memberName.trim())
    setStep('waiting')
  }

  const handleCreateTeam = () => {
    if (!newTeamName.trim() || !memberName.trim()) return
    onCreateTeam(newTeamName.trim(), memberName.trim())
    setStep('waiting')
  }

  const handleLeaveTeam = () => {
    if (!currentMember) return
    const team = teams.find(t => t.members.some(m => m.id === currentMember.id))
    if (team) {
      onLeaveTeam(team.id, currentMember.id)
      setStep('select')
    }
  }

  const getTeamStats = (team: Team) => {
    const activeMembers = team.members.filter(m => m.isOnline).length
    const totalMembers = team.members.length
    const powerUpsAvailable = team.powerUps.filter(p => !p.isActive).length
    
    return { activeMembers, totalMembers, powerUpsAvailable }
  }

  const getTeamCapacity = (team: Team) => {
    const { totalMembers } = getTeamStats(team)
    return `${totalMembers}/${team.members.length + 1}` // +1 for potential new member
  }

  const canJoinTeam = (team: Team) => {
    const { totalMembers } = getTeamStats(team)
    return totalMembers < 6 // Max team size
  }

  if (currentMember) {
    const currentTeam = teams.find(t => t.members.some(m => m.id === currentMember.id))
    
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <CardTitle className="text-xl text-green-600">Ansluten!</CardTitle>
          </div>
          <Typography variant="body2" className="text-muted-foreground">
            Du är medlem i {currentTeam?.name}
          </Typography>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {currentTeam && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-4 h-4 rounded-full ${getTeamColorClass(currentTeam.id)}`}
                />
                <Typography variant="h6" className="font-semibold">
                  {currentTeam.name}
                </Typography>
                {currentMember.role === 'leader' && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Typography variant="caption" className="text-muted-foreground">
                    Medlemmar
                  </Typography>
                  <Typography variant="body2" className="font-semibold">
                    {getTeamStats(currentTeam).totalMembers}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-muted-foreground">
                    Poäng
                  </Typography>
                  <Typography variant="body2" className="font-semibold">
                    {currentTeam.score}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-muted-foreground">
                    Power-ups
                  </Typography>
                  <Typography variant="body2" className="font-semibold">
                    {getTeamStats(currentTeam).powerUpsAvailable}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-muted-foreground">
                    Online
                  </Typography>
                  <Typography variant="body2" className="font-semibold">
                    {getTeamStats(currentTeam).activeMembers}
                  </Typography>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Typography variant="body2" className="font-semibold">
              Team-medlemmar:
            </Typography>
            {currentTeam?.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded"
              >
                <div className="flex items-center gap-2">
                  {member.role === 'leader' && <Crown className="w-4 h-4 text-yellow-500" />}
                  <Typography variant="body2">{member.name}</Typography>
                  <div className={`w-2 h-2 rounded-full ${
                    member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                {member.id === currentMember.id && (
                  <Typography variant="caption" className="text-primary-600">
                    Du
                  </Typography>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleLeaveTeam}
            variant="outline"
            className="w-full"
          >
            <UserMinus className="w-4 h-4 mr-2" />
            Lämna team
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="w-6 h-6 text-primary-500" />
          <CardTitle className="text-xl">Gå med i team</CardTitle>
        </div>
        <Typography variant="body2" className="text-muted-foreground">
          Välj ett befintligt team eller skapa ett nytt
        </Typography>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Existing Teams */}
              <div>
                <Typography variant="h6" className="mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary-500" />
                  Befintliga team
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teams.map((team) => {
                    const stats = getTeamStats(team)
                    const canJoin = canJoinTeam(team)
                    
                    return (
                      <motion.div
                        key={team.id}
                        whileHover={canJoin ? { scale: 1.02 } : {}}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                          ${canJoin 
                            ? 'border-primary-300 hover:border-primary-500 hover:shadow-md' 
                            : 'border-gray-200 opacity-50 cursor-not-allowed'
                          }
                        `}
                        onClick={() => canJoin && setSelectedTeam(team.id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-4 h-4 rounded-full ${getTeamColorClass(team.id)}`}
                        />
                          <Typography variant="h6" className="font-semibold">
                            {team.name}
                          </Typography>
                          {!canJoin && <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{stats.totalMembers} medlemmar</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            <span>{team.score} poäng</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span>{stats.powerUpsAvailable} power-ups</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            <span>{getTeamCapacity(team)} kapacitet</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('join')}
                  disabled={!selectedTeam}
                  className="flex-1"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Gå med i valt team
                </Button>
                <Button
                  onClick={() => setStep('create')}
                  variant="outline"
                  className="flex-1"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Skapa nytt team
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <Typography variant="h6" className="mb-2">
                  Gå med i {teams.find(t => t.id === selectedTeam)?.name}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  Ange ditt namn för att gå med i teamet
                </Typography>
              </div>
              
              <Input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Ditt namn"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinTeam()}
                className="text-center"
              />
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('select')}
                  variant="outline"
                  className="flex-1"
                >
                  Tillbaka
                </Button>
                <Button
                  onClick={handleJoinTeam}
                  disabled={!memberName.trim()}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Gå med
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <Typography variant="h6" className="mb-2">
                  Skapa nytt team
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  Ange team-namn och ditt namn
                </Typography>
              </div>
              
              <div className="space-y-3">
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Team-namn"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTeam()}
                />
                <Input
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Ditt namn"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTeam()}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('select')}
                  variant="outline"
                  className="flex-1"
                >
                  Tillbaka
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim() || !memberName.trim()}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Skapa team
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <RefreshCw className="w-16 h-16 animate-spin text-primary-500 mx-auto mb-4" />
              <Typography variant="h6" className="mb-2">
                Väntar på att quizet ska starta...
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                Håll utkik efter instruktioner från läraren
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-refresh Control */}
        <div className="flex justify-center items-center gap-2 text-muted-foreground text-xs">
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
      </CardContent>
    </Card>
  )
}
