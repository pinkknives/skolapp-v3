'use client'

import { useState, useEffect, useCallback } from 'react'
import type { 
  TeamQuizSession, 
  Team, 
  TeamAnswer, 
  TeamPowerUpUsage,
  TeamRanking
} from '@/types/team-quiz'

interface UseTeamQuizProps {
  sessionId: string
  onError?: (error: string) => void
}

export function useTeamQuiz({ sessionId, onError }: UseTeamQuizProps) {
  const [session, setSession] = useState<TeamQuizSession | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [rankings, setRankings] = useState<TeamRanking[]>([])
  const [answers, setAnswers] = useState<TeamAnswer[]>([])
  const [powerUpUsages, setPowerUpUsages] = useState<TeamPowerUpUsage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize session
  const initializeSession = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/team-quiz/sessions/${sessionId}`)
      if (!response.ok) throw new Error('Failed to fetch session')
      
      const data = await response.json()
      setSession(data.session)
      setTeams(data.teams || [])
      setRankings(data.rankings || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [sessionId, onError])

  // Create new team
  const createTeam = useCallback(async (teamName: string, creatorName: string) => {
    try {
      const response = await fetch(`/api/team-quiz/sessions/${sessionId}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName, creatorName })
      })

      if (!response.ok) throw new Error('Failed to create team')
      
      const data = await response.json()
      setTeams(prev => [...prev, data.team])
      return data.team
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create team'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    }
  }, [sessionId, onError])

  // Join team
  const joinTeam = useCallback(async (teamId: string, memberName: string) => {
    try {
      const response = await fetch(`/api/team-quiz/sessions/${sessionId}/teams/${teamId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberName })
      })

      if (!response.ok) throw new Error('Failed to join team')
      
      const data = await response.json()
      setTeams(prev => prev.map(team => 
        team.id === teamId ? { ...team, members: data.members } : team
      ))
      return data.member
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join team'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    }
  }, [sessionId, onError])

  // Leave team
  const leaveTeam = useCallback(async (teamId: string, memberId: string) => {
    try {
      const response = await fetch(`/api/team-quiz/sessions/${sessionId}/teams/${teamId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      })

      if (!response.ok) throw new Error('Failed to leave team')
      
      setTeams(prev => prev.map(team => 
        team.id === teamId 
          ? { ...team, members: team.members.filter(m => m.id !== memberId) }
          : team
      ))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave team'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    }
  }, [sessionId, onError])

  // Submit team answer
  const submitAnswer = useCallback(async (
    teamId: string,
    questionId: string,
    answer: string,
    submittedBy: string
  ) => {
    try {
      const response = await fetch(`/api/team-quiz/sessions/${sessionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          questionId,
          answer,
          submittedBy,
          submittedAt: new Date().toISOString()
        })
      })

      if (!response.ok) throw new Error('Failed to submit answer')
      
      const data = await response.json()
      setAnswers(prev => [...prev, data.answer])
      
      // Update team score if correct
      if (data.answer.isCorrect) {
        setTeams(prev => prev.map(team => 
          team.id === teamId 
            ? { ...team, score: team.score + data.points }
            : team
        ))
      }
      
      return data.answer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    }
  }, [sessionId, onError])

  // Use power-up
  const usePowerUp = useCallback(async (
    teamId: string,
    powerUpId: string,
    questionId: string,
    usedBy: string
  ) => {
    try {
      const response = await fetch(`/api/team-quiz/sessions/${sessionId}/power-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          powerUpId,
          questionId,
          usedBy,
          usedAt: new Date().toISOString()
        })
      })

      if (!response.ok) throw new Error('Failed to use power-up')
      
      const data = await response.json()
      setPowerUpUsages(prev => [...prev, data.usage])
      
      // Update team power-ups
      setTeams(prev => prev.map(team => 
        team.id === teamId 
          ? { 
              ...team, 
              powerUps: team.powerUps.map(pu => 
                pu.id === powerUpId ? { ...pu, isActive: true, usedAt: new Date() } : pu
              ),
              score: team.score - data.cost
            }
          : team
      ))
      
      return data.usage
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to use power-up'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    }
  }, [sessionId, onError])

  // Start quiz
  const startQuiz = useCallback(async () => {
    try {
      const response = await fetch(`/api/team-quiz/sessions/${sessionId}/start`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to start quiz')
      
      const data = await response.json()
      setSession(prev => prev ? { ...prev, status: 'active', startedAt: new Date() } : null)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start quiz'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    }
  }, [sessionId, onError])

  // Pause quiz
  const pauseQuiz = useCallback(async () => {
    try {
      const response = await fetch(`/api/team-quiz/sessions/${sessionId}/pause`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to pause quiz')
      
      setSession(prev => prev ? { ...prev, status: 'paused' } : null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause quiz'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    }
  }, [sessionId, onError])

  // Next question
  const nextQuestion = useCallback(async () => {
    try {
      const response = await fetch(`/api/team-quiz/sessions/${sessionId}/next`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to go to next question')
      
      const data = await response.json()
      setSession(prev => prev ? { ...prev, currentQuestion: data.currentQuestion } : null)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to go to next question'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    }
  }, [sessionId, onError])

  // End quiz
  const endQuiz = useCallback(async () => {
    try {
      const response = await fetch(`/api/team-quiz/sessions/${sessionId}/end`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to end quiz')
      
      const data = await response.json()
      setSession(prev => prev ? { ...prev, status: 'ended', endedAt: new Date() } : null)
      setRankings(data.finalRankings || [])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end quiz'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    }
  }, [sessionId, onError])

  // Update rankings
  const updateRankings = useCallback(() => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score)
    const newRankings: TeamRanking[] = sortedTeams.map((team, index) => ({
      teamId: team.id,
      teamName: team.name,
      score: team.score,
      position: index + 1,
      change: 0, // This would be calculated based on previous rankings
      streak: Math.floor(Math.random() * 5), // This would be calculated from answers
      powerUpsUsed: team.powerUps.filter(p => p.isActive).length,
      averageTime: Math.floor(Math.random() * 60) + 30, // This would be calculated from answers
      accuracy: Math.floor(Math.random() * 40) + 60 // This would be calculated from answers
    }))
    setRankings(newRankings)
  }, [teams])

  // Auto-update rankings when teams change
  useEffect(() => {
    updateRankings()
  }, [teams, updateRankings])

  // Initialize on mount
  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  return {
    session,
    teams,
    rankings,
    answers,
    powerUpUsages,
    loading,
    error,
    createTeam,
    joinTeam,
    leaveTeam,
    submitAnswer,
    usePowerUp,
    startQuiz,
    pauseQuiz,
    nextQuestion,
    endQuiz,
    updateRankings,
    clearError: () => setError(null)
  }
}
