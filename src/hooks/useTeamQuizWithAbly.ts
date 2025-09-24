'use client'

import { useState, useEffect, useCallback } from 'react'
import { useImprovedAbly } from './useImprovedAbly'
import type { 
  TeamQuizSession, 
  Team, 
  TeamMember,
  TeamRanking
} from '@/types/team-quiz'

interface UseTeamQuizWithAblyProps {
  sessionId: string
  isTeacher: boolean
  onError?: (error: string) => void
}

interface UseTeamQuizWithAblyReturn {
  // Ably connection state
  connectionState: {
    status: 'connecting' | 'connected' | 'disconnected' | 'error'
    lastConnected?: Date
    reconnectAttempts: number
    error?: string
  }
  participants: Array<{ clientId: string; data: unknown }>
  isConnected: boolean
  isConnecting: boolean
  hasError: boolean
  reconnect: () => void
  
  // Team quiz data
  session: TeamQuizSession | null
  teams: Team[]
  rankings: TeamRanking[]
  loading: boolean
  error: string | null
  
  // Team management
  createTeam: (name: string, memberName: string) => Promise<Team>
  joinTeam: (teamId: string, memberName: string) => Promise<Team>
  leaveTeam: (teamId: string, memberId: string) => Promise<void>
  
  // Quiz control
  startQuiz: () => Promise<void>
  pauseQuiz: () => Promise<void>
  nextQuestion: () => Promise<void>
  endQuiz: () => Promise<void>
  
  // Power-ups
  activatePowerUp: (teamId: string, powerUpId: string, questionId: string) => Promise<void>
  
  // Ably messaging
  publishMessage: (channel: string, event: string, data: unknown) => Promise<void>
  subscribeToChannel: (channel: string, event: string, callback: (data: unknown) => void) => void
}

export function useTeamQuizWithAbly({
  sessionId,
  isTeacher,
  onError
}: UseTeamQuizWithAblyProps): UseTeamQuizWithAblyReturn {
  const [session, setSession] = useState<TeamQuizSession | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [rankings, setRankings] = useState<TeamRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Ably integration
  const {
    connectionState,
    participants,
    isConnected,
    isConnecting,
    hasError,
    reconnect,
    joinRoom,
    publishMessage,
    subscribeToChannel
  } = useImprovedAbly({
    quizId: sessionId,
    role: isTeacher ? 'teacher' : 'student',
    clientId: `user-${Date.now()}`,
    name: isTeacher ? 'Lärare' : 'Student',
    onConnectionChange: (state) => {
      if (state.status === 'connected') {
        console.log('Connected to Ably for team quiz')
      } else if (state.status === 'disconnected') {
        console.log('Disconnected from Ably')
      }
    },
    onError: (error) => {
      console.error('Ably error:', error)
      onError?.(error)
    },
    onPresenceUpdate: (participants) => {
      console.log('Participants updated:', participants)
    }
  })

  // Initialize session data
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true)
        
        // Mock session data - in real app, fetch from API
        const mockSession: TeamQuizSession = {
          id: sessionId,
          quizId: 'mock-quiz-id',
          teams: [],
          settings: {
            allowTeamFormation: true,
            autoAssignTeams: false,
            powerUpsEnabled: true,
            teamSize: {
              min: 2,
              max: 4
            },
            scoring: {
              basePoints: 10,
              bonusForSpeed: true,
              bonusForAccuracy: true,
              teamBonus: true
            },
            timeLimit: {
              perQuestion: 30,
              total: 1800
            }
          },
          currentQuestion: 0,
          status: 'lobby',
          leaderboard: [],
          powerUpsEnabled: true,
          teamSize: {
            min: 2,
            max: 4
          },
          createdAt: new Date(),
          startedAt: undefined,
          endedAt: undefined
        }
        
        setSession(mockSession)
        setTeams(mockSession.teams)
        setRankings([])
      } catch (_err) {
        setError('Failed to load session')
        onError?.('Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      initializeSession()
    }
  }, [sessionId, onError])

  // Join Ably room when connected
  useEffect(() => {
    if (isConnected && sessionId) {
      joinRoom()
    }
  }, [isConnected, sessionId, joinRoom])

  // Subscribe to Ably events
  useEffect(() => {
    if (isConnected) {
      // Subscribe to team updates
      subscribeToChannel(`quiz:${sessionId}:teams`, 'team_created', (data: unknown) => {
        console.log('Team created:', data)
        // Update teams list
        const teamData = data as { team: Team }
        setTeams(prev => [...prev, teamData.team])
      })

      subscribeToChannel(`quiz:${sessionId}:teams`, 'team_updated', (data: unknown) => {
        console.log('Team updated:', data)
        const updateData = data as { teamId: string; updates: Partial<Team> }
        setTeams(prev => prev.map(team => 
          team.id === updateData.teamId ? { ...team, ...updateData.updates } : team
        ))
      })

      subscribeToChannel(`quiz:${sessionId}:teams`, 'member_joined', (data: unknown) => {
        console.log('Member joined:', data)
        const joinData = data as { teamId: string; member: { id: string; name: string; role: string; joinedAt: string } }
        const teamMember: TeamMember = {
          id: joinData.member.id,
          name: joinData.member.name,
          role: joinData.member.role as 'leader' | 'member',
          joinedAt: new Date(joinData.member.joinedAt),
          isOnline: true,
          lastSeen: new Date()
        }
        setTeams(prev => prev.map(team => 
          team.id === joinData.teamId 
            ? { ...team, members: [...team.members, teamMember] }
            : team
        ))
      })

      subscribeToChannel(`quiz:${sessionId}:teams`, 'member_left', (data: unknown) => {
        console.log('Member left:', data)
        const leaveData = data as { teamId: string; memberId: string }
        setTeams(prev => prev.map(team => 
          team.id === leaveData.teamId 
            ? { ...team, members: team.members.filter(m => m.id !== leaveData.memberId) }
            : team
        ))
      })

      // Subscribe to power-up events
      subscribeToChannel(`quiz:${sessionId}:powerups`, 'powerup_used', (data: unknown) => {
        console.log('Power-up used:', data)
        // Update team power-up states
        const powerUpData = data as { teamId: string; cost: number }
        setTeams(prev => prev.map(team => 
          team.id === powerUpData.teamId 
            ? { ...team, score: team.score - powerUpData.cost }
            : team
        ))
      })

      // Subscribe to leaderboard updates
      subscribeToChannel(`quiz:${sessionId}:leaderboard`, 'ranking_updated', (data: unknown) => {
        console.log('Ranking updated:', data)
        const rankingData = data as { rankings: TeamRanking[] }
        setRankings(rankingData.rankings)
      })

      // Subscribe to quiz control events
      subscribeToChannel(`quiz:${sessionId}:control`, 'quiz_started', (_data: unknown) => {
        console.log('Quiz started')
        setSession(prev => prev ? { ...prev, status: 'active' } : null)
      })

      subscribeToChannel(`quiz:${sessionId}:control`, 'quiz_paused', (_data: unknown) => {
        console.log('Quiz paused')
        setSession(prev => prev ? { ...prev, status: 'paused' } : null)
      })

      subscribeToChannel(`quiz:${sessionId}:control`, 'quiz_ended', (_data: unknown) => {
        console.log('Quiz ended')
        setSession(prev => prev ? { ...prev, status: 'ended' } : null)
      })
    }
  }, [isConnected, sessionId, subscribeToChannel])

  // Team management functions
  const createTeam = useCallback(async (name: string, memberName: string): Promise<Team> => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      members: [{
        id: `member-${Date.now()}`,
        name: memberName,
        role: 'leader',
        joinedAt: new Date(),
        isOnline: true,
        lastSeen: new Date()
      }],
      score: 0,
      powerUps: [],
      createdAt: new Date(),
      isActive: true
    }

    setTeams(prev => [...prev, newTeam])
    
    // Publish team creation event
    if (isConnected) {
      await publishMessage(`quiz:${sessionId}:teams`, 'team_created', {
        team: newTeam,
        timestamp: new Date().toISOString()
      })
    }

    return newTeam
  }, [isConnected, sessionId, publishMessage])

  const joinTeam = useCallback(async (teamId: string, memberName: string) => {
    const member: TeamMember = {
      id: `member-${Date.now()}`,
      name: memberName,
      role: 'member',
      joinedAt: new Date(),
      isOnline: true,
      lastSeen: new Date()
    }

    let updatedTeam: Team | null = null
    setTeams(prev => prev.map(team => {
      if (team.id === teamId) {
        updatedTeam = { ...team, members: [...team.members, member] }
        return updatedTeam
      }
      return team
    }))

    // Publish member join event
    if (isConnected) {
      await publishMessage(`quiz:${sessionId}:teams`, 'member_joined', {
        teamId,
        member,
        timestamp: new Date().toISOString()
      })
    }

    return updatedTeam!
  }, [isConnected, sessionId, publishMessage])

  const leaveTeam = useCallback(async (teamId: string, memberId: string) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, members: team.members.filter(m => m.id !== memberId) }
        : team
    ))

    // Publish member leave event
    if (isConnected) {
      await publishMessage(`quiz:${sessionId}:teams`, 'member_left', {
        teamId,
        memberId,
        timestamp: new Date().toISOString()
      })
    }
  }, [isConnected, sessionId, publishMessage])

  // Quiz control functions
  const startQuiz = useCallback(async () => {
    setSession(prev => prev ? { ...prev, status: 'active' } : null)
    
    if (isConnected) {
      await publishMessage(`quiz:${sessionId}:control`, 'quiz_started', {
        timestamp: new Date().toISOString()
      })
    }
  }, [isConnected, sessionId, publishMessage])

  const pauseQuiz = useCallback(async () => {
    setSession(prev => prev ? { ...prev, status: 'paused' } : null)
    
    if (isConnected) {
      await publishMessage(`quiz:${sessionId}:control`, 'quiz_paused', {
        timestamp: new Date().toISOString()
      })
    }
  }, [isConnected, sessionId, publishMessage])

  const nextQuestion = useCallback(async () => {
    if (isConnected) {
      await publishMessage(`quiz:${sessionId}:control`, 'next_question', {
        timestamp: new Date().toISOString()
      })
    }
  }, [isConnected, sessionId, publishMessage])

  const endQuiz = useCallback(async () => {
    setSession(prev => prev ? { ...prev, status: 'ended' } : null)
    
    if (isConnected) {
      await publishMessage(`quiz:${sessionId}:control`, 'quiz_ended', {
        timestamp: new Date().toISOString()
      })
    }
  }, [isConnected, sessionId, publishMessage])

  // Power-up functions
  const activatePowerUp = async (teamId: string, powerUpId: string, questionId: string) => {
    // Update team score (mock implementation)
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, score: Math.max(0, team.score - 10) } // Mock cost
        : team
    ))

    // Publish power-up usage event
    if (isConnected) {
      publishMessage(`quiz:${sessionId}:powerups`, 'powerup_used', {
        teamId,
        powerUpId,
        questionId,
        timestamp: new Date().toISOString()
      }).catch(err => {
        console.error('Failed to publish power-up event:', err)
      })
    }
  }

  return {
    // Ably connection state
    connectionState,
    participants,
    isConnected,
    isConnecting,
    hasError,
    reconnect,
    
    // Team quiz data
    session,
    teams,
    rankings,
    loading,
    error,
    
    // Team management
    createTeam,
    joinTeam,
    leaveTeam,
    
    // Quiz control
    startQuiz,
    pauseQuiz,
    nextQuestion,
    endQuiz,
    
    // Power-ups
    activatePowerUp,
    
    // Ably messaging
    publishMessage,
    subscribeToChannel
  }
}
