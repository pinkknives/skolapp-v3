'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Typography, Heading } from '@/components/ui/Typography'
import { 
  Users, 
  Plus, 
  Crown, 
  UserPlus, 
  UserMinus,
  Settings,
  Trash2,
  Edit,
  Zap,
  Target
} from 'lucide-react'
import type { Team, TeamMember, PowerUp, TeamQuizSettings } from '@/types/team-quiz'
import { getTeamColorClass } from '@/lib/team-colors'
import { ColorPicker } from '@/components/ui/ColorPicker'

interface TeamManagerProps {
  teams: Team[]
  settings: TeamQuizSettings
  onTeamsChange: (teams: Team[]) => void
  onSettingsChange: (settings: TeamQuizSettings) => void
  onStartQuiz: () => void
  className?: string
}

const teamColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

const powerUpTypes: PowerUp[] = [
  {
    id: 'double_points',
    type: 'double_points',
    name: 'Dubbel Poäng',
    description: 'Dubbla poäng för nästa rätta svar',
    cost: 50,
    effect: { type: 'double_points', value: 2, description: 'Dubbla poäng' },
    isActive: false
  },
  {
    id: 'time_boost',
    type: 'time_boost',
    name: 'Tid Boost',
    description: 'Få extra tid för nästa fråga',
    cost: 30,
    effect: { type: 'time_boost', value: 15, description: '+15 sekunder' },
    isActive: false
  },
  {
    id: 'hint',
    type: 'hint',
    name: 'Ledtråd',
    description: 'Få en ledtråd för nästa fråga',
    cost: 40,
    effect: { type: 'hint', value: 1, description: 'En ledtråd' },
    isActive: false
  },
  {
    id: 'skip_question',
    type: 'skip_question',
    name: 'Hoppa Över',
    description: 'Hoppa över nästa fråga',
    cost: 60,
    effect: { type: 'skip_question', value: 1, description: 'Hoppa över fråga' },
    isActive: false
  },
  {
    id: 'shield',
    type: 'shield',
    name: 'Sköld',
    description: 'Skydd mot fel svar i 2 frågor',
    cost: 80,
    effect: { type: 'shield', value: 2, description: '2 frågor skydd' },
    duration: 2,
    isActive: false
  }
]

export function TeamManager({
  teams,
  settings,
  onTeamsChange,
  onSettingsChange,
  onStartQuiz,
  className = ''
}: TeamManagerProps) {
  const [editingTeam, setEditingTeam] = useState<string | null>(null)
  const [newTeamName, setNewTeamName] = useState('')
  const [selectedColor, setSelectedColor] = useState(teamColors[0])
  const [showSettings, setShowSettings] = useState(false)
  const [tempSettings, setTempSettings] = useState(settings)

  const createTeam = () => {
    if (!newTeamName.trim()) return

    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name: newTeamName.trim(),
      color: selectedColor,
      members: [],
      score: 0,
      powerUps: powerUpTypes.map(pu => ({ ...pu, id: `${pu.id}_${Date.now()}` })),
      createdAt: new Date(),
      isActive: true
    }

    onTeamsChange([...teams, newTeam])
    setNewTeamName('')
    setSelectedColor(teamColors[(teams.length + 1) % teamColors.length])
  }

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    onTeamsChange(teams.map(team => 
      team.id === teamId ? { ...team, ...updates } : team
    ))
  }

  const deleteTeam = (teamId: string) => {
    onTeamsChange(teams.filter(team => team.id !== teamId))
  }

  const addMemberToTeam = (teamId: string, memberName: string) => {
    const newMember: TeamMember = {
      id: `member_${Date.now()}`,
      name: memberName.trim(),
      role: 'member',
      joinedAt: new Date(),
      isOnline: true,
      lastSeen: new Date()
    }

    updateTeam(teamId, {
      members: [...teams.find(t => t.id === teamId)!.members, newMember]
    })
  }

  const removeMemberFromTeam = (teamId: string, memberId: string) => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return

    updateTeam(teamId, {
      members: team.members.filter(m => m.id !== memberId)
    })
  }

  const setTeamLeader = (teamId: string, memberId: string) => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return

    updateTeam(teamId, {
      members: team.members.map(member => ({
        ...member,
        role: member.id === memberId ? 'leader' : 'member'
      }))
    })
  }

  const canStartQuiz = teams.length >= 2 && teams.every(team => team.members.length >= settings.teamSize.min)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary-500" />
          <div>
            <Heading level={3}>Team-hantering</Heading>
            <Typography variant="body2" className="text-muted-foreground">
              {teams.length} team • {teams.reduce((sum, team) => sum + team.members.length, 0)} medlemmar
            </Typography>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Inställningar
          </Button>
          <Button
            onClick={onStartQuiz}
            disabled={!canStartQuiz}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Starta Team Quiz
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team-inställningar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body2" className="font-semibold mb-2">
                      Min teamstorlek
                    </Typography>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={tempSettings.teamSize.min}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        teamSize: { ...prev.teamSize, min: parseInt(e.target.value) || 1 }
                      }))}
                    />
                  </div>
                  <div>
                    <Typography variant="body2" className="font-semibold mb-2">
                      Max teamstorlek
                    </Typography>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={tempSettings.teamSize.max}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        teamSize: { ...prev.teamSize, max: parseInt(e.target.value) || 5 }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={tempSettings.allowTeamFormation}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        allowTeamFormation: e.target.checked
                      }))}
                      className="text-primary-600"
                    />
                    <Typography variant="body2">Tillåt team-formering under quiz</Typography>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={tempSettings.autoAssignTeams}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        autoAssignTeams: e.target.checked
                      }))}
                      className="text-primary-600"
                    />
                    <Typography variant="body2">Auto-tilldela team</Typography>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={tempSettings.powerUpsEnabled}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        powerUpsEnabled: e.target.checked
                      }))}
                      className="text-primary-600"
                    />
                    <Typography variant="body2">Aktivera power-ups</Typography>
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="outline"
                    size="sm"
                  >
                    Avbryt
                  </Button>
                  <Button
                    onClick={() => {
                      onSettingsChange(tempSettings)
                      setShowSettings(false)
                    }}
                    size="sm"
                  >
                    Spara
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create New Team */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Skapa nytt team
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team-namn"
                onKeyPress={(e) => e.key === 'Enter' && createTeam()}
              />
            </div>
            <ColorPicker
              colors={teamColors.slice(0, 5)}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />
            <Button onClick={createTeam} disabled={!newTeamName.trim()}>
              Skapa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full ${getTeamColorClass(team.id)}`}
                    />
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => setEditingTeam(editingTeam === team.id ? null : team.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => deleteTeam(team.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{team.members.length} medlemmar</span>
                  <span>{team.score} poäng</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Members */}
                <div className="space-y-2">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <div className="flex items-center gap-2">
                        {member.role === 'leader' && <Crown className="w-4 h-4 text-yellow-500" />}
                        <Typography variant="body2">{member.name}</Typography>
                        <div className={`w-2 h-2 rounded-full ${
                          member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex gap-1">
                        {member.role !== 'leader' && (
                          <Button
                            onClick={() => setTeamLeader(team.id, member.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Crown className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          onClick={() => removeMemberFromTeam(team.id, member.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserMinus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Member */}
                {editingTeam === team.id && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Medlemsnamn"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement
                          addMemberToTeam(team.id, input.value)
                          input.value = ''
                        }
                      }}
                    />
                    <Button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        addMemberToTeam(team.id, input.value)
                        input.value = ''
                      }}
                      size="sm"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Power-ups */}
                {settings.powerUpsEnabled && (
                  <div className="pt-2 border-t">
                    <Typography variant="caption" className="font-semibold text-muted-foreground">
                      Power-ups tillgängliga
                    </Typography>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {team.powerUps.slice(0, 3).map((powerUp) => (
                        <div
                          key={powerUp.id}
                          className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
                        >
                          {powerUp.name}
                        </div>
                      ))}
                      {team.powerUps.length > 3 && (
                        <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{team.powerUps.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Start Quiz Button */}
      {!canStartQuiz && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Target className="w-5 h-5" />
              <Typography variant="body2" className="font-semibold">
                Krav för att starta quiz
              </Typography>
            </div>
            <Typography variant="body2" className="text-orange-600 dark:text-orange-300 mt-1">
              Du behöver minst 2 team och varje team måste ha minst {settings.teamSize.min} medlemmar.
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
