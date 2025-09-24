'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  Users, 
  Trophy, 
  Zap, 
  Settings,
  ArrowLeft,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { TeamManager } from '@/components/quiz/TeamManager'
import { TeamLiveDashboard } from '@/components/quiz/TeamLiveDashboard'
import { TeamJoinInterface } from '@/components/quiz/TeamJoinInterface'
import { AgeBasedTeamQuiz } from '@/components/quiz/AgeBasedTeamQuiz'
import { useTeamQuizWithAbly } from '@/hooks/useTeamQuizWithAbly'
import { getAgeGroupFromGrade, type AgeGroup } from '@/hooks/useAgeBasedGamification'
import type { TeamMember } from '@/types/team-quiz'

type ViewMode = 'manager' | 'dashboard' | 'join'

export default function TeamLiveQuizPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  
  const [viewMode, setViewMode] = useState<ViewMode>('manager')
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null)
  const [isTeacher, setIsTeacher] = useState(false)
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('middle')
  const [gradeLevel, setGradeLevel] = useState<number>(5) // Default to grade 5

  // Team quiz with Ably integration
  const {
    // Ably connection state
    connectionState: _connectionState,
    participants: _participants,
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
    publishMessage: _publishMessage,
    subscribeToChannel: _subscribeToChannel
  } = useTeamQuizWithAbly({
    sessionId,
    isTeacher,
    onError: (error) => console.error('Team quiz error:', error)
  })

  // Check if user is teacher (in real app, this would be based on authentication)
  useEffect(() => {
    // Mock check - in real app, check user role
    setIsTeacher(true) // For demo purposes
    
    // Update age group when grade level changes
    setAgeGroup(getAgeGroupFromGrade(gradeLevel))
  }, [gradeLevel])

  const clearError = () => {
    // Clear any error state and try to reconnect
    reconnect()
  }


  const handleCreateTeam = async (teamName: string, memberName: string) => {
    try {
      const team = await createTeam(teamName, memberName)
      setCurrentMember(team.members[0])
      setViewMode('dashboard')
    } catch (err) {
      console.error('Failed to create team:', err)
    }
  }

  const handleJoinTeam = async (teamId: string, memberName: string) => {
    try {
      await joinTeam(teamId, memberName)
      // Create a TeamMember from the team data
      const member: TeamMember = {
        id: `member_${Date.now()}`,
        name: memberName,
        role: 'member',
        joinedAt: new Date(),
        isOnline: true,
        lastSeen: new Date()
      }
      setCurrentMember(member)
      setViewMode('dashboard')
    } catch (err) {
      console.error('Failed to join team:', err)
    }
  }

  const handleLeaveTeam = async (teamId: string, memberId: string) => {
    try {
      await leaveTeam(teamId, memberId)
      setCurrentMember(null)
      setViewMode('join')
    } catch (err) {
      console.error('Failed to leave team:', err)
    }
  }

  const handleUsePowerUp = async (teamId: string, powerUpId: string, questionId: string) => {
    try {
      // Call the power-up function directly
      await activatePowerUp(teamId, powerUpId, questionId)
    } catch (err) {
      console.error('Failed to use power-up:', err)
    }
  }

  // Quiz control functions (Ably handled in hook)
  const handleStartQuiz = async () => {
    try {
      await startQuiz()
    } catch (err) {
      console.error('Failed to start quiz:', err)
    }
  }

  const handlePauseQuiz = async () => {
    try {
      await pauseQuiz()
    } catch (err) {
      console.error('Failed to pause quiz:', err)
    }
  }

  const handleNextQuestion = async () => {
    try {
      await nextQuestion()
    } catch (err) {
      console.error('Failed to go to next question:', err)
    }
  }

  const handleEndQuiz = async () => {
    try {
      await endQuiz()
    } catch (err) {
      console.error('Failed to end quiz:', err)
    }
  }

  if (loading) {
    return (
      <Layout>
        <Section className="flex items-center justify-center min-h-[calc(100vh-var(--navbar-height)-var(--footer-height))]">
          <Container size="sm" className="text-center">
            <RefreshCw className="w-16 h-16 animate-spin text-primary-500 mx-auto mb-4" />
            <Typography variant="h6" className="mb-2">
              Laddar team quiz...
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              Hämtar session och team-data
            </Typography>
          </Container>
        </Section>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <Section className="flex items-center justify-center min-h-[calc(100vh-var(--navbar-height)-var(--footer-height))]">
          <Container size="sm" className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <Typography variant="h6" className="mb-2 text-red-600">
              Ett fel uppstod
            </Typography>
            <Typography variant="body2" className="text-muted-foreground mb-4">
              {error}
            </Typography>
            <div className="flex gap-3 justify-center">
              <Button onClick={clearError} variant="outline">
                Försök igen
              </Button>
              <Button onClick={() => router.push('/')}>
                Tillbaka till startsidan
              </Button>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  if (!session) {
    return (
      <Layout>
        <Section className="flex items-center justify-center min-h-[calc(100vh-var(--navbar-height)-var(--footer-height))]">
          <Container size="sm" className="text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <Typography variant="h6" className="mb-2">
              Session hittades inte
            </Typography>
            <Typography variant="body2" className="text-muted-foreground mb-4">
              Den begärda team quiz-sessionen existerar inte eller har tagits bort.
            </Typography>
            <Button onClick={() => router.push('/')}>
              Tillbaka till startsidan
            </Button>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout>
      <Section className="py-8">
        <Container size="xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka
              </Button>
              <div>
                <Heading level={2} className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary-500" />
                  Team Quiz Live
                </Heading>
                <Typography variant="body2" className="text-muted-foreground">
                  Session ID: {sessionId}
                </Typography>
              </div>
            </div>

            {/* View Mode Toggle */}
            {isTeacher && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setViewMode('manager')}
                  variant={viewMode === 'manager' ? 'primary' : 'outline'}
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Hantera
                </Button>
                <Button
                  onClick={() => setViewMode('dashboard')}
                  variant={viewMode === 'dashboard' ? 'primary' : 'outline'}
                  size="sm"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            )}
          </div>

          {/* Status Banner */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    session.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : session.status === 'paused'
                      ? 'bg-yellow-100 text-yellow-700'
                      : session.status === 'ended'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {session.status === 'active' ? 'LIVE' : 
                     session.status === 'paused' ? 'PAUSAD' : 
                     session.status === 'ended' ? 'AVSLUTAD' : 'LOBBY'}
                  </div>
                  <Typography variant="body2" className="text-muted-foreground">
                    {teams.length} team • {teams.reduce((sum, team) => sum + team.members.length, 0)} deltagare
                  </Typography>
                  {/* Ably Connection Status */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <Typography variant="caption" className="text-muted-foreground">
                      {isConnected ? 'Ansluten' : isConnecting ? 'Ansluter...' : 'Frånkopplad'}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary-500" />
                  <Typography variant="body2" className="text-muted-foreground">
                    Power-ups: {session.powerUpsEnabled ? 'Aktiverade' : 'Inaktiverade'}
                  </Typography>
                  {hasError && (
                    <Button
                      onClick={reconnect}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Återanslut
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Age Group Selector */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Åldersgrupp & Klassnivå
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Typography variant="body2" className="mb-2">
                    Välj klassnivå för att anpassa upplevelsen:
                  </Typography>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { grade: 1, label: 'Årskurs 1-3', ageGroup: 'young' as AgeGroup },
                      { grade: 4, label: 'Årskurs 4-6', ageGroup: 'middle' as AgeGroup },
                      { grade: 7, label: 'Årskurs 7-9', ageGroup: 'old' as AgeGroup },
                      { grade: 10, label: 'Gymnasium', ageGroup: 'adult' as AgeGroup }
                    ].map(({ grade, label }) => (
                      <Button
                        key={grade}
                        variant={gradeLevel === grade ? 'primary' : 'secondary'}
                        onClick={() => setGradeLevel(grade)}
                        className="text-sm"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Vald åldersgrupp:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ageGroup === 'young' ? 'bg-purple-100 text-purple-700' :
                    ageGroup === 'middle' ? 'bg-blue-100 text-blue-700' :
                    ageGroup === 'old' ? 'bg-gray-100 text-gray-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {ageGroup === 'young' && 'Ung (6-8 år)'}
                    {ageGroup === 'middle' && 'Mellan (9-12 år)'}
                    {ageGroup === 'old' && 'Äldre (13-16 år)'}
                    {ageGroup === 'adult' && 'Vuxen (16+ år)'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {viewMode === 'manager' && isTeacher && (
              <motion.div
                key="manager"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TeamManager
                  teams={teams}
                  settings={session.settings}
                  onTeamsChange={(newTeams) => {
                    // In real app, this would update the teams in the database
                    console.log('Teams updated:', newTeams)
                  }}
                  onSettingsChange={(newSettings) => {
                    // In real app, this would update the settings in the database
                    console.log('Settings updated:', newSettings)
                  }}
                  onStartQuiz={() => {
                    handleStartQuiz()
                    setViewMode('dashboard')
                  }}
                />
              </motion.div>
            )}

            {viewMode === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Age-based Team Quiz */}
                <AgeBasedTeamQuiz
                  teams={teams}
                  rankings={rankings}
                  ageGroup={ageGroup}
                  onAnswer={(teamId, answer) => {
                    console.log(`Team ${teamId} answered: ${answer}`)
                  }}
                  onUsePowerUp={(teamId, powerUpId) => handleUsePowerUp(teamId, powerUpId, 'demo-question')}
                  currentQuestion={{
                    id: 'demo-question',
                    question: 'Vad är huvudstaden i Sverige?',
                    options: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala'],
                    timeLimit: 30
                  }}
                  timeRemaining={25}
                  isActive={true}
                />
                
                {/* Original Dashboard */}
                <TeamLiveDashboard
                  session={session}
                  currentQuestion={undefined} // This would come from the quiz data
                  rankings={rankings}
                  onStartQuiz={handleStartQuiz}
                  onPauseQuiz={handlePauseQuiz}
                  onNextQuestion={handleNextQuestion}
                  onEndQuiz={handleEndQuiz}
                  onRevealAnswers={() => {
                    // Implement reveal answers functionality
                    console.log('Reveal answers')
                  }}
                  onUsePowerUp={handleUsePowerUp}
                />
              </motion.div>
            )}

            {viewMode === 'join' && !isTeacher && (
              <motion.div
                key="join"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-center"
              >
                <TeamJoinInterface
                  teams={teams}
                  onJoinTeam={handleJoinTeam}
                  onLeaveTeam={handleLeaveTeam}
                  onCreateTeam={handleCreateTeam}
                  currentMember={currentMember || undefined}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Student View Toggle */}
          {!isTeacher && (
            <div className="mt-8 text-center">
              <Button
                onClick={() => setViewMode(viewMode === 'join' ? 'dashboard' : 'join')}
                variant="outline"
              >
                {viewMode === 'join' ? 'Visa Dashboard' : 'Gå med i Team'}
              </Button>
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  )
}
