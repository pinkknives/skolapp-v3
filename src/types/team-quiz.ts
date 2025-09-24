export interface Team {
  id: string
  name: string
  color: string
  members: TeamMember[]
  score: number
  powerUps: PowerUp[]
  createdAt: Date
  isActive: boolean
}

export interface TeamMember {
  id: string
  name: string
  role: 'leader' | 'member'
  joinedAt: Date
  isOnline: boolean
  lastSeen: Date
}

export interface PowerUp {
  id: string
  type: PowerUpType
  name: string
  description: string
  cost: number
  effect: PowerUpEffect
  duration?: number // in seconds
  isActive: boolean
  usedAt?: Date
}

export type PowerUpType = 
  | 'double_points'
  | 'time_boost'
  | 'hint'
  | 'skip_question'
  | 'shield'
  | 'multiplier'
  | 'streak_protection'

export interface PowerUpEffect {
  type: PowerUpType
  value: number
  description: string
}

export interface TeamQuizSession {
  id: string
  quizId: string
  teams: Team[]
  settings: TeamQuizSettings
  currentQuestion: number
  status: 'lobby' | 'active' | 'paused' | 'ended'
  leaderboard: TeamRanking[]
  powerUpsEnabled: boolean
  teamSize: {
    min: number
    max: number
  }
  createdAt: Date
  startedAt?: Date
  endedAt?: Date
}

export interface TeamQuizSettings {
  allowTeamFormation: boolean
  autoAssignTeams: boolean
  powerUpsEnabled: boolean
  teamSize: {
    min: number
    max: number
  }
  scoring: {
    basePoints: number
    bonusForSpeed: boolean
    bonusForAccuracy: boolean
    teamBonus: boolean
  }
  timeLimit: {
    perQuestion: number
    total: number
  }
}

export interface TeamRanking {
  teamId: string
  teamName: string
  score: number
  position: number
  change: number // position change from previous update
  streak: number
  powerUpsUsed: number
  averageTime: number
  accuracy: number
}

export interface TeamAnswer {
  teamId: string
  questionId: string
  answer: string
  isCorrect: boolean
  timeSpent: number
  powerUpsUsed: string[]
  submittedBy: string // member id
  submittedAt: Date
}

export interface TeamPowerUpUsage {
  teamId: string
  powerUpId: string
  questionId: string
  usedBy: string
  usedAt: Date
  effect: PowerUpEffect
}

export interface TeamQuizStats {
  totalTeams: number
  totalMembers: number
  averageScore: number
  topPerformer: {
    teamId: string
    teamName: string
    score: number
  }
  mostUsedPowerUp: {
    type: PowerUpType
    count: number
  }
  averageTimePerQuestion: number
  accuracy: number
}
