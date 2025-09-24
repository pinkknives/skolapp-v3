'use client'

import React, { useState } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AgeBasedButton, ConfettiButton, YoungButton, MiddleButton, OldButton, AdultButton } from '@/components/ui/AgeBasedButton'
import { AgeBasedTeamQuiz } from '@/components/quiz/AgeBasedTeamQuiz'
import { type AgeGroup } from '@/hooks/useAgeBasedGamification'
import { 
  Users, 
  Trophy, 
  Star, 
  Zap, 
  Settings,
  Heart,
  Sparkles
} from 'lucide-react'
import type { Team } from '@/types/team-quiz'

export default function DemoAgeGroupsPage() {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>('young')
  const [showDemo, setShowDemo] = useState(false)

  // Mock teams data
  const mockTeams: Team[] = [
    {
      id: 'team-1',
      name: 'Team Alpha',
      color: '#FF6B6B',
      members: [
        { id: 'member-1', name: 'Anna', role: 'leader', joinedAt: new Date(), isOnline: true, lastSeen: new Date() },
        { id: 'member-2', name: 'Erik', role: 'member', joinedAt: new Date(), isOnline: true, lastSeen: new Date() }
      ],
      score: 150,
      powerUps: [],
      createdAt: new Date(),
      isActive: true
    },
    {
      id: 'team-2',
      name: 'Team Beta',
      color: '#4ECDC4',
      members: [
        { id: 'member-3', name: 'Lisa', role: 'leader', joinedAt: new Date(), isOnline: true, lastSeen: new Date() },
        { id: 'member-4', name: 'Oscar', role: 'member', joinedAt: new Date(), isOnline: true, lastSeen: new Date() }
      ],
      score: 120,
      powerUps: [],
      createdAt: new Date(),
      isActive: true
    },
    {
      id: 'team-3',
      name: 'Team Gamma',
      color: '#45B7D1',
      members: [
        { id: 'member-5', name: 'Maja', role: 'leader', joinedAt: new Date(), isOnline: true, lastSeen: new Date() },
        { id: 'member-6', name: 'Lucas', role: 'member', joinedAt: new Date(), isOnline: true, lastSeen: new Date() }
      ],
      score: 90,
      powerUps: [],
      createdAt: new Date(),
      isActive: true
    }
  ]

  const mockRankings = [
    { teamId: 'team-1', teamName: 'Team Alpha', score: 150, position: 1, change: 0, streak: 3, powerUpsUsed: 2, averageTime: 15, accuracy: 85 },
    { teamId: 'team-2', teamName: 'Team Beta', score: 120, position: 2, change: 1, streak: 1, powerUpsUsed: 1, averageTime: 18, accuracy: 78 },
    { teamId: 'team-3', teamName: 'Team Gamma', score: 90, position: 3, change: -1, streak: 0, powerUpsUsed: 0, averageTime: 22, accuracy: 72 }
  ]

  const ageGroups: Array<{ id: AgeGroup; label: string; description: string; color: string }> = [
    { id: 'young', label: 'Ung (6-8 år)', description: 'Årskurs 1-3', color: 'purple' },
    { id: 'middle', label: 'Mellan (9-12 år)', description: 'Årskurs 4-6', color: 'blue' },
    { id: 'old', label: 'Äldre (13-16 år)', description: 'Årskurs 7-9', color: 'gray' },
    { id: 'adult', label: 'Vuxen (16+ år)', description: 'Gymnasium', color: 'green' }
  ]

  return (
    <Layout>
      <Section className="py-8">
        <Container size="xl">
          <div className="text-center mb-8">
            <Heading level={1} className="mb-4">
              Åldersbaserad Gamification Demo
            </Heading>
            <Typography variant="body1" className="text-muted-foreground mb-6">
              Se hur team-quiz upplevelsen anpassas baserat på åldersgrupp
            </Typography>
          </div>

          {/* Age Group Selector */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Välj Åldersgrupp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ageGroups.map((group) => (
                  <Card
                    key={group.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedAgeGroup === group.id
                        ? `border-2 border-${group.color}-500 bg-${group.color}-50`
                        : 'border border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAgeGroup(group.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 rounded-full bg-${group.color}-500 mx-auto mb-3 flex items-center justify-center`}>
                        {group.id === 'young' && <Heart className="w-6 h-6 text-white" />}
                        {group.id === 'middle' && <Star className="w-6 h-6 text-white" />}
                        {group.id === 'old' && <Trophy className="w-6 h-6 text-white" />}
                        {group.id === 'adult' && <Users className="w-6 h-6 text-white" />}
                      </div>
                      <Typography variant="h6" className="mb-1">
                        {group.label}
                      </Typography>
                      <Typography variant="body2" className="text-muted-foreground">
                        {group.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Button Examples */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Knapp-exempel för {ageGroups.find(g => g.id === selectedAgeGroup)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-3">
                  <Typography variant="body2" className="font-medium">Vanliga knappar:</Typography>
                  <div className="space-y-2">
                    <AgeBasedButton ageGroup={selectedAgeGroup} variant="primary">
                      Primär knapp
                    </AgeBasedButton>
                    <AgeBasedButton ageGroup={selectedAgeGroup} variant="secondary">
                      Sekundär knapp
                    </AgeBasedButton>
                    <AgeBasedButton ageGroup={selectedAgeGroup} variant="primary" showConfetti>
                      Framgång! 🎉
                    </AgeBasedButton>
                    <AgeBasedButton ageGroup={selectedAgeGroup} variant="destructive">
                      Fel svar
                    </AgeBasedButton>
                  </div>
                </div>

                <div className="space-y-3">
                  <Typography variant="body2" className="font-medium">Specialiserade knappar:</Typography>
                  <div className="space-y-2">
                    <YoungButton variant="primary" showConfetti>
                      Ung knapp
                    </YoungButton>
                    <MiddleButton variant="primary" showConfetti>
                      Mellan knapp
                    </MiddleButton>
                    <OldButton variant="primary">
                      Äldre knapp
                    </OldButton>
                    <AdultButton variant="primary">
                      Vuxen knapp
                    </AdultButton>
                  </div>
                </div>

                <div className="space-y-3">
                  <Typography variant="body2" className="font-medium">Confetti knappar:</Typography>
                  <div className="space-y-2">
                    <ConfettiButton>
                      Confetti! 🎊
                    </ConfettiButton>
                    <ConfettiButton>
                      Stor confetti! 🎉
                    </ConfettiButton>
                  </div>
                </div>

                <div className="space-y-3">
                  <Typography variant="body2" className="font-medium">Interaktiva element:</Typography>
                  <div className="space-y-2">
                    <AgeBasedButton 
                      ageGroup={selectedAgeGroup} 
                      variant="primary" 
                      showConfetti
                    >
                      Ljud + Confetti
                    </AgeBasedButton>
                    <AgeBasedButton 
                      ageGroup={selectedAgeGroup} 
                      variant="primary"
                    >
                      Med emoji
                    </AgeBasedButton>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Quiz Demo */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Team Quiz Demo - {ageGroups.find(g => g.id === selectedAgeGroup)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <AgeBasedButton
                  ageGroup={selectedAgeGroup}
                  variant="primary"
                  onClick={() => setShowDemo(!showDemo)}
                  showConfetti={selectedAgeGroup === 'young' || selectedAgeGroup === 'middle'}
                >
                  {showDemo ? 'Dölj Demo' : 'Visa Team Quiz Demo'}
                </AgeBasedButton>
              </div>
              
              {showDemo && (
                <AgeBasedTeamQuiz
                  teams={mockTeams}
                  rankings={mockRankings}
                  ageGroup={selectedAgeGroup}
                  onAnswer={(teamId, answer) => {
                    console.log(`Team ${teamId} answered: ${answer}`)
                  }}
                  onUsePowerUp={(teamId, powerUpId) => {
                    console.log(`Team ${teamId} used power-up: ${powerUpId}`)
                  }}
                  currentQuestion={{
                    id: 'demo-question',
                    question: 'Vad är huvudstaden i Sverige?',
                    options: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala'],
                    timeLimit: 30
                  }}
                  timeRemaining={25}
                  isActive={true}
                />
              )}
            </CardContent>
          </Card>

          {/* Features Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Funktionsjämförelse per Åldersgrupp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Funktion</th>
                      {ageGroups.map(group => (
                        <th key={group.id} className="text-center p-3 font-medium">
                          {group.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Confetti</td>
                      <td className="p-3 text-center">✅</td>
                      <td className="p-3 text-center">✅</td>
                      <td className="p-3 text-center">❌</td>
                      <td className="p-3 text-center">❌</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Emojis</td>
                      <td className="p-3 text-center">✅</td>
                      <td className="p-3 text-center">✅</td>
                      <td className="p-3 text-center">❌</td>
                      <td className="p-3 text-center">❌</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Ljudeffekter</td>
                      <td className="p-3 text-center">✅</td>
                      <td className="p-3 text-center">❌</td>
                      <td className="p-3 text-center">❌</td>
                      <td className="p-3 text-center">❌</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Animationer</td>
                      <td className="p-3 text-center">✅</td>
                      <td className="p-3 text-center">✅</td>
                      <td className="p-3 text-center">✅</td>
                      <td className="p-3 text-center">❌</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Kommunikationsstil</td>
                      <td className="p-3 text-center">Lekfull</td>
                      <td className="p-3 text-center">Neutral</td>
                      <td className="p-3 text-center">Neutral</td>
                      <td className="p-3 text-center">Professionell</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Visuell stil</td>
                      <td className="p-3 text-center">Färgglad</td>
                      <td className="p-3 text-center">Modern</td>
                      <td className="p-3 text-center">Modern</td>
                      <td className="p-3 text-center">Minimal</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Firande intensitet</td>
                      <td className="p-3 text-center">Hög</td>
                      <td className="p-3 text-center">Medium</td>
                      <td className="p-3 text-center">Låg</td>
                      <td className="p-3 text-center">Låg</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </Layout>
  )
}
