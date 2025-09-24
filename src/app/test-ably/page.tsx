'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useTeamQuizWithAbly } from '@/hooks/useTeamQuizWithAbly'
import { TeamManager } from '@/components/quiz/TeamManager'
import { TeamLiveDashboard } from '@/components/quiz/TeamLiveDashboard'
import { TeamJoinInterface } from '@/components/quiz/TeamJoinInterface'
import { 
  Users, 
  Trophy, 
  Zap, 
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'

type ViewMode = 'manager' | 'dashboard' | 'join'

export default function TestAblyPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('manager')
  const [currentMember, setCurrentMember] = useState<{ id: string; name: string; role: 'member' | 'leader'; joinedAt: Date; isOnline: boolean; lastSeen: Date } | null>(null)
  const [isTeacher] = useState(true)
  const [testResults, setTestResults] = useState<Array<{ test: string; status: 'success' | 'error' | 'pending'; message: string }>>([])

  const sessionId = 'test-session-123'

  // Team quiz with Ably integration
  const {
    participants,
    isConnected,
    hasError,
    reconnect,
    
    session,
    teams,
    rankings,
    loading,
    error,
    
    createTeam,
    joinTeam,
    leaveTeam,
    
    startQuiz,
    pauseQuiz,
    nextQuestion,
    endQuiz,
    
    activatePowerUp,
    
    publishMessage
  } = useTeamQuizWithAbly({
    sessionId,
    isTeacher,
    onError: (error) => console.error('Team quiz error:', error)
  })

  // Test Ably integration
  useEffect(() => {
    const runTests = async () => {
      const tests = [
        {
          test: 'Ably Connection',
          status: 'pending' as const,
          message: 'Testing Ably connection...'
        },
        {
          test: 'Team Creation',
          status: 'pending' as const,
          message: 'Testing team creation...'
        },
        {
          test: 'Team Joining',
          status: 'pending' as const,
          message: 'Testing team joining...'
        },
        {
          test: 'Power-up System',
          status: 'pending' as const,
          message: 'Testing power-up system...'
        },
        {
          test: 'Live Messaging',
          status: 'pending' as const,
          message: 'Testing live messaging...'
        }
      ]

      setTestResults(tests)

      // Test 1: Ably Connection
      setTimeout(() => {
        setTestResults(prev => prev.map(test => 
          test.test === 'Ably Connection' 
            ? { ...test, status: isConnected ? 'success' : 'error', message: isConnected ? 'Connected successfully!' : 'Connection failed' }
            : test
        ))
      }, 1000)

      // Test 2: Team Creation
      setTimeout(async () => {
        try {
          const _team = await createTeam('Test Team', 'Test Leader')
          setTestResults(prev => prev.map(test => 
            test.test === 'Team Creation' 
              ? { ...test, status: 'success', message: 'Team created successfully!' }
              : test
          ))
        } catch (error) {
          setTestResults(prev => prev.map(test => 
            test.test === 'Team Creation' 
              ? { ...test, status: 'error', message: `Failed to create team: ${error}` }
              : test
          ))
        }
      }, 2000)

      // Test 3: Team Joining
      setTimeout(async () => {
        try {
          const _team = await joinTeam(teams[0]?.id || 'test-team', 'Test Member')
          setTestResults(prev => prev.map(test => 
            test.test === 'Team Joining' 
              ? { ...test, status: 'success', message: 'Joined team successfully!' }
              : test
          ))
        } catch (error) {
          setTestResults(prev => prev.map(test => 
            test.test === 'Team Joining' 
              ? { ...test, status: 'error', message: `Failed to join team: ${error}` }
              : test
          ))
        }
      }, 3000)

      // Test 4: Power-up System
      setTimeout(async () => {
        try {
          await activatePowerUp(teams[0]?.id || 'test-team', 'test-powerup', 'test-question')
          setTestResults(prev => prev.map(test => 
            test.test === 'Power-up System' 
              ? { ...test, status: 'success', message: 'Power-up activated successfully!' }
              : test
          ))
        } catch (error) {
          setTestResults(prev => prev.map(test => 
            test.test === 'Power-up System' 
              ? { ...test, status: 'error', message: `Failed to activate power-up: ${error}` }
              : test
          ))
        }
      }, 4000)

      // Test 5: Live Messaging
      setTimeout(async () => {
        try {
          await publishMessage(`quiz:${sessionId}:test`, 'test_message', { message: 'Hello from test!' })
          setTestResults(prev => prev.map(test => 
            test.test === 'Live Messaging' 
              ? { ...test, status: 'success', message: 'Message published successfully!' }
              : test
          ))
        } catch (error) {
          setTestResults(prev => prev.map(test => 
            test.test === 'Live Messaging' 
              ? { ...test, status: 'error', message: `Failed to publish message: ${error}` }
              : test
          ))
        }
      }, 5000)
    }

    runTests()
  }, [isConnected, createTeam, joinTeam, activatePowerUp, publishMessage, teams, sessionId])

  const _handleCreateTeam = async (teamName: string, memberName: string) => {
    try {
      const _team = await createTeam(teamName, memberName)
      setCurrentMember(_team.members[0])
      setViewMode('dashboard')
    } catch (err) {
      console.error('Failed to create team:', err)
    }
  }

  const _handleJoinTeam = async (teamId: string, memberName: string) => {
    try {
      const _team = await joinTeam(teamId, memberName)
      const member = {
        id: `member_${Date.now()}`,
        name: memberName,
        role: 'member' as const,
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

  const _handleLeaveTeam = async (teamId: string, memberId: string) => {
    try {
      await leaveTeam(teamId, memberId)
      setCurrentMember(null)
      setViewMode('manager')
    } catch (err) {
      console.error('Failed to leave team:', err)
    }
  }

  const handleUsePowerUp = async (teamId: string, powerUpId: string, questionId: string) => {
    try {
      await activatePowerUp(teamId, powerUpId, questionId)
    } catch (err) {
      console.error('Failed to use power-up:', err)
    }
  }

  const clearError = () => {
    reconnect()
  }

  if (loading) {
    return (
      <Layout>
        <Section className="flex items-center justify-center min-h-[calc(100vh-var(--navbar-height)-var(--footer-height))]">
          <Container size="sm" className="text-center">
            <RefreshCw className="w-16 h-16 animate-spin text-primary-500 mx-auto mb-4" />
            <Heading level={2} className="mb-2">Laddar Ably test...</Heading>
            <Typography variant="body1" className="text-muted-foreground">
              Testar Ably-integration med team-quiz
            </Typography>
          </Container>
        </Section>
      </Layout>
    )
  }

  if (hasError) {
    return (
      <Layout>
        <Section className="flex items-center justify-center min-h-[calc(100vh-var(--navbar-height)-var(--footer-height))]">
          <Container size="sm" className="text-center">
            <XCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
            <Heading level={2} className="mb-2">Anslutningsfel</Heading>
            <Typography variant="body1" className="text-muted-foreground mb-4">
              {error}
            </Typography>
            <div className="flex gap-3 justify-center">
              <Button onClick={clearError} variant="outline">
                Försök igen
              </Button>
              <Button onClick={() => window.location.reload()}>
                Ladda om sidan
              </Button>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout>
      <Section className="py-8">
        <Container size="lg">
          <div className="text-center mb-8">
            <Heading level={1} className="mb-4">
              Ably Integration Test
            </Heading>
            <Typography variant="body1" className="text-muted-foreground mb-6">
              Testar Ably realtidskommunikation med team-quiz funktioner
            </Typography>
            
            {/* Connection Status */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Anslutningsstatus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <Typography variant="body1" className={isConnected ? 'text-green-600' : 'text-orange-600'}>
                    {isConnected ? 'Ansluten' : 'Ansluter...'}
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground">
                    ({participants.length} deltagare)
                  </Typography>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Testresultat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md">
                      <div className="flex items-center gap-3">
                        {test.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {test.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                        {test.status === 'pending' && <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />}
                        <Typography variant="body2" className="font-medium">
                          {test.test}
                        </Typography>
                      </div>
                      <Typography variant="body2" className="text-muted-foreground">
                        {test.message}
                      </Typography>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* View Mode Toggle */}
            <div className="flex justify-center gap-4 mb-6">
              <Button
                onClick={() => setViewMode('manager')}
                variant={viewMode === 'manager' ? 'primary' : 'secondary'}
              >
                <Users className="w-4 h-4 mr-2" />
                Team Manager
              </Button>
              <Button
                onClick={() => setViewMode('dashboard')}
                variant={viewMode === 'dashboard' ? 'primary' : 'secondary'}
                disabled={!currentMember}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Live Dashboard
              </Button>
              <Button
                onClick={() => setViewMode('join')}
                variant={viewMode === 'join' ? 'primary' : 'secondary'}
              >
                <Settings className="w-4 h-4 mr-2" />
                Join Interface
              </Button>
            </div>
          </div>

          {/* Dynamic Content */}
          {viewMode === 'manager' && (
            <TeamManager
              teams={teams}
              settings={session?.settings || { 
                allowTeamFormation: true, 
                autoAssignTeams: false, 
                powerUpsEnabled: true, 
                teamSize: { min: 2, max: 4 },
                scoring: { basePoints: 10, bonusForSpeed: true, bonusForAccuracy: true, teamBonus: true },
                timeLimit: { perQuestion: 30, total: 1800 }
              }}
              onTeamsChange={(_newTeams) => {
                console.log('Teams updated')
              }}
              onSettingsChange={(_newSettings) => {
                console.log('Settings updated')
              }}
              onStartQuiz={() => {
                console.log('Start quiz')
                setViewMode('dashboard')
              }}
            />
          )}

          {viewMode === 'dashboard' && currentMember && session && (
            <TeamLiveDashboard
              session={session}
              rankings={rankings}
              onStartQuiz={startQuiz}
              onPauseQuiz={pauseQuiz}
              onNextQuestion={nextQuestion}
              onEndQuiz={endQuiz}
              onRevealAnswers={() => console.log('Reveal answers')}
              onUsePowerUp={handleUsePowerUp}
            />
          )}

          {viewMode === 'join' && (
            <TeamJoinInterface
              teams={teams}
              onJoinTeam={_handleJoinTeam}
              onLeaveTeam={_handleLeaveTeam}
              onCreateTeam={_handleCreateTeam}
              currentMember={currentMember || undefined}
            />
          )}
        </Container>
      </Section>
    </Layout>
  )
}
