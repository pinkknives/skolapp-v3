// Quiz data types and interfaces

export type QuestionType = 'multiple-choice' | 'free-text' | 'image'

export type ExecutionMode = 'self-paced' | 'teacher-controlled' | 'teacher-review'

export type QuizStatus = 'draft' | 'published' | 'archived'

export type SessionStatus = 'lobby' | 'live' | 'ended'

export type SessionMode = 'async' | 'sync'

export type SessionState = 'idle' | 'running' | 'paused' | 'ended'

export type SessionEventType = 'start' | 'pause' | 'next' | 'reveal' | 'end' | 'join' | 'leave'

export type ParticipantStatus = 'joined' | 'active' | 'finished' | 'disconnected'

export type ProgressStatus = 'not_started' | 'in_progress' | 'submitted' | 'late'

export type RevealPolicy = 'immediate' | 'after_deadline' | 'never'
export type GameMode = 'standard' | 'accuracy' | 'study'

export type NotificationType = 'deadline_24h' | 'deadline_1h' | 'deadline_passed' | 'assignment_published'

// Analytics and Results types
export interface SessionOverview {
  sessionId: string
  totalParticipants: number
  submittedCount: number
  avgScore: number
  participationRate: number
  completionRate: number
  mode: SessionMode
  dueAt?: string
  revealPolicy: RevealPolicy
  maxAttempts: number
  isPastDeadline: boolean
}

export interface StudentResult {
  sessionId: string
  userId: string
  displayName: string
  studentId?: string
  bestScore: number
  questionsAttempted: number
  lastActivityAt?: string
  totalAttempts: number
  avgTimePerQuestion?: number
  status: ProgressStatus
}

export interface QuestionAnalysis {
  sessionId: string
  questionId: string
  questionIndex: number
  questionTitle: string
  questionType: QuestionType
  questionPoints: number
  totalAttempts: number
  correctCount: number
  correctRate: number
  avgScore: number
  avgTimeSeconds?: number
}

export interface AttemptDetail {
  sessionId: string
  userId: string
  participantName: string
  quizTitle: string
  totalScore: number
  maxPossibleScore: number
  percentage: number
  questionsAnswered: number
  totalQuestions: number
  totalTimeSpent: number
  status: ProgressStatus
  startedAt?: string
  submittedAt?: string
  attemptNo?: number
  canRevealAnswers: boolean
  questions: AttemptQuestionDetail[]
}

export interface AttemptQuestionDetail {
  questionIndex: number
  questionId: string
  questionTitle: string
  questionType: QuestionType
  questionPoints: number
  studentAnswer: string
  isCorrect: boolean
  score: number
  timeSpentSeconds?: number
  answeredAt?: string
  attempts: number
  correctAnswer?: string
  options?: MultipleChoiceOption[]
}

export interface AttemptItem {
  id: string
  sessionId: string
  userId: string
  questionId: string
  questionIndex: number
  answer: unknown
  isCorrect: boolean
  score: number
  timeSpentSeconds?: number
  answeredAt: Date
  attemptNo: number
}

// AI Insights types
export interface AIInsight {
  type: 'success' | 'concern' | 'opportunity' | 'info'
  title: string
  description: string
  action: string
}

export interface AIInsightResponse {
  insights: AIInsight[]
  disclaimer: string
  generatedAt: string
}

export interface MultipleChoiceOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface RubricCriterion {
  id: string
  text: string
  weight: number // 1-5 scale
  example?: string // Optional example of correct answer
}

export interface Rubric {
  id: string
  questionId: string
  criteria: RubricCriterion[]
  createdAt: Date
  updatedAt: Date
}

// Citation information for RAG-generated content
export interface QuestionCitation {
  sourceId: string
  sourceTitle: string
  sourceUrl?: string
  license?: string
  span?: string // specific text span that was referenced
}

export interface BaseQuestion {
  id: string
  type: QuestionType
  title: string
  points: number
  timeLimit?: number // in seconds
  rubric?: Rubric // Optional rubric for AI grading
  citations?: QuestionCitation[] // RAG sources used to generate this question
  explanation?: string // Explanation of how this relates to curriculum
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice'
  options: MultipleChoiceOption[]
}

export interface FreeTextQuestion extends BaseQuestion {
  type: 'free-text'
  expectedAnswer?: string
  acceptedAnswers?: string[]
}

export interface ImageQuestion extends BaseQuestion {
  type: 'image'
  imageUrl?: string
  imageAlt?: string
  options?: MultipleChoiceOption[] // Can be combined with image
}

export type Question = MultipleChoiceQuestion | FreeTextQuestion | ImageQuestion

export interface QuizSettings {
  timeLimit?: number // Total quiz time in minutes
  allowRetakes: boolean
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  showCorrectAnswers: boolean
  executionMode: ExecutionMode
  gameMode?: GameMode
}

export interface Quiz {
  id: string
  title: string
  description: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string // Teacher ID
  orgId?: string // Organization ID (optional for backwards compatibility)
  status: QuizStatus
  settings: QuizSettings
  questions: Question[]
  shareCode?: string // 4-character code for sharing
  qrCodeUrl?: string
}

export interface AIQuizDraft {
  id: string
  prompt: {
    subject: string
    gradeLevel: string
    numberOfQuestions: number
    difficulty: 'easy' | 'medium' | 'hard'
    topics?: string[]
  }
  generatedQuestions: Question[]
  createdAt: Date
  status: 'generating' | 'ready' | 'reviewed'
}

export interface QuizResult {
  id: string
  quizId: string
  studentId: string
  answers: { questionId: string; answer: string | string[] }[]
  score: number
  totalPoints: number
  startedAt: Date
  completedAt?: Date
  timeSpent: number // in seconds
}

export interface QuizSession {
  id: string
  quizId: string
  teacherId: string
  code: string // 6-character join code
  status: SessionStatus
  mode: SessionMode // 'async' or 'sync'
  state: SessionState // For sync mode: 'idle', 'running', 'paused', 'ended'
  currentIndex: number // Current active question index for sync mode (0-based)
  questionWindowSeconds?: number // Time limit for current question in sync mode
  questionWindowStartedAt?: Date // When current question timer started
  // Async assignment fields
  openAt?: Date // When assignment becomes available (null = immediately)
  dueAt?: Date // Assignment deadline for async mode
  maxAttempts: number // Maximum attempts allowed per student (default 1)
  timeLimitSeconds?: number // Time limit per attempt in seconds
  revealPolicy: RevealPolicy // When to show correct answers
  startedAt?: Date
  endedAt?: Date
  settings: Record<string, unknown> // Session-specific settings
  createdAt: Date
  updatedAt: Date
  participants?: SessionParticipant[] // Loaded separately for performance
}

// New Live Quiz Session types matching the exact database specification
export interface LiveQuizSession {
  id: string
  orgId: string
  classId?: string
  quizId: string
  pin: string // 6-character A-Z0-9 code
  status: 'LOBBY' | 'ACTIVE' | 'PAUSED' | 'ENDED'
  currentIndex: number
  settings: {
    timePerQuestion?: number
    showAfterEach?: boolean
    autoAdvance?: boolean
  }
  createdBy: string
  startedAt?: Date
  endedAt?: Date
  createdAt: Date
}

export interface LiveQuizParticipant {
  sessionId: string
  userId: string
  displayName: string
  role: 'teacher' | 'student'
  joinedAt: Date
  lastSeenAt: Date
}

export interface LiveQuizAnswer {
  sessionId: string
  questionId: string
  userId: string
  answer: string
  isCorrect?: boolean
  submittedAt: Date
}

export interface SessionParticipant {
  id: string
  sessionId: string
  studentId?: string // null for guest participants
  displayName: string
  joinedAt: Date
  status: ParticipantStatus
  lastSeen: Date
}

export interface SessionAttempt {
  id: string
  sessionId: string
  userId: string
  questionIndex: number // 0-based question index
  answer: unknown // MC: selected option ids array, free-text: string
  isCorrect?: boolean // calculated when answer is submitted
  answeredAt: Date
  attemptNo: number // Attempt number for this user on this question (1-based)
  durationSeconds?: number // Time spent on this attempt in seconds
}

export interface SessionEvent {
  id: string
  sessionId: string
  type: SessionEventType
  payload: Record<string, unknown>
  createdAt: Date
  createdBy?: string // user ID who triggered the event
}

// Session progress tracking for async assignments
export interface SessionProgress {
  id: string
  sessionId: string
  userId: string
  startedAt?: Date
  submittedAt?: Date
  status: ProgressStatus
  currentAttempt: number
  createdAt: Date
  updatedAt: Date
}

// Notification system for assignment reminders
export interface Notification {
  id: string
  userId: string
  sessionId?: string
  type: NotificationType
  title: string
  message: string
  readAt?: Date
  createdAt: Date
}

export interface SessionSettings {
  allowLateJoin?: boolean
  showResults?: boolean
  maxParticipants?: number
  timeLimit?: number // Session time limit in minutes
}

export interface Student {
  id: string
  alias: string
  joinedAt: Date
  isGuest: boolean
}

export interface QuizJoinResult {
  success: boolean
  quiz?: Quiz
  session?: QuizSession
  error?: string
  errorCode?: 'INVALID_CODE' | 'QUIZ_NOT_ACTIVE' | 'QUIZ_CLOSED' | 'QUIZ_NOT_FOUND'
}

export interface QuizJoinRequest {
  shareCode: string
  studentAlias: string
}

// Types for quiz-taking experience
export interface StudentAnswer {
  questionId: string
  answer: string | string[]
  timeSpent: number // in seconds
  answeredAt: Date
}

export interface QuizProgress {
  currentQuestionIndex: number
  totalQuestions: number
  answers: StudentAnswer[]
  startedAt: Date
  timeElapsed: number // in seconds
}

export interface QuizTakingState {
  quiz: Quiz
  session: QuizSession
  student: Student
  progress: QuizProgress
  status: 'starting' | 'in-progress' | 'paused' | 'completed' | 'submitted'
}

// AI Assessment types for teacher review
export interface AIAssessment {
  id: string
  answerId: string
  questionId: string
  questionType: QuestionType
  suggestedScore: number
  maxScore: number
  rationale: string
  confidence: number // 0-1, where 1 is highest confidence
  timestamp: Date
  aiModel?: string // Which AI model was used
  rubricEvaluation?: RubricEvaluation // How the answer matches each criterion
}

export interface RubricEvaluation {
  criteriaResults: {
    criterionId: string
    met: boolean // Whether the criterion was met
    score: number // 0-weight scale
    explanation: string // AI explanation of how this criterion was evaluated
  }[]
  overallJustification: string // How the criteria combine to the final score
}

export interface TeacherDecision {
  id: string
  assessmentId: string
  answerId: string
  decision: 'approve' | 'edit' | 'reject'
  finalScore: number
  finalRationale?: string
  teacherNote?: string
  timestamp: Date
  teacherId: string
}

export interface AIGradingSession {
  id: string
  quizId: string
  teacherId: string
  createdAt: Date
  assessments: AIAssessment[]
  decisions: TeacherDecision[]
  status: 'pending' | 'in-progress' | 'completed'
  batchDecisions?: {
    action: 'approve_high_confidence' | 'reject_low_confidence'
    threshold: number
    count: number
    timestamp: Date
  }[]
}

// Classroom management types
export type ClassMemberRole = 'teacher' | 'student'
export type ClassMemberStatus = 'active' | 'inactive'
export type ClassSessionStatus = 'scheduled' | 'open' | 'closed'

export interface Class {
  id: string
  ownerId: string
  orgId?: string
  name: string
  grade?: string
  subject?: string
  inviteCode: string
  createdAt: Date
  updatedAt: Date
}

export interface ClassMember {
  id: string
  classId: string
  userId?: string // null for guest students
  alias?: string // Required for guest students, optional for authenticated
  role: ClassMemberRole
  joinedAt: Date
  status: ClassMemberStatus
}

export interface ClassSession {
  id: string
  classId: string
  sessionId: string
  quizId: string
  status: ClassSessionStatus
  startedAt: Date
  endedAt?: Date
  createdAt: Date
}

export interface ClassWithMembers extends Class {
  members: ClassMember[]
  memberCount: number
}

export interface ClassSessionWithDetails extends ClassSession {
  className: string
  quizTitle: string
  session: QuizSession
  participants: SessionParticipant[]
}

export interface ClassJoinRequest {
  inviteCode: string
  alias: string
  userId?: string // Optional for authenticated users
}

export interface ClassJoinResult {
  success: boolean
  class?: Class
  member?: ClassMember
  error?: string
  errorCode?: 'INVALID_CODE' | 'CLASS_FULL' | 'ALIAS_TAKEN' | 'ALREADY_MEMBER'
}

export interface ClassSessionResult {
  success: boolean
  classSession?: ClassSession
  session?: QuizSession
  error?: string
}

// Results and analytics for class sessions
export interface ClassSessionStats {
  totalParticipants: number
  submittedCount: number
  averageScore: number
  averageTimeSpent: number
  completionRate: number
}

export interface ClassSessionResults {
  classSession: ClassSession
  stats: ClassSessionStats
  participants: (SessionParticipant & {
    score?: number
    timeSpent?: number
    completedAt?: Date
  })[]
}

// Real-time sync quiz interfaces
export interface SyncQuizState {
  session: QuizSession
  quiz: Quiz
  currentQuestion?: Question
  participants: SessionParticipant[]
  attempts: SessionAttempt[]
  events: SessionEvent[]
  answerDistribution?: Record<string, number> // For MC questions: optionId -> count
  isRevealed: boolean // Whether answers have been revealed for current question
}

export interface SyncQuizControl {
  action: 'start' | 'pause' | 'next' | 'reveal' | 'end'
  payload?: Record<string, unknown>
}

export interface SyncQuizProgress {
  totalQuestions: number
  currentIndex: number
  completedCount: number
  timeElapsed: number
  timeRemaining?: number
}

export interface ParticipantPresence {
  userId: string
  displayName: string
  isOnline: boolean
  hasAnswered: boolean
  lastSeen: Date
}

// Assignment creation and management interfaces
export interface AssignmentSettings {
  openAt?: Date // When assignment becomes available
  dueAt: Date // Assignment deadline (required)
  maxAttempts: number // Maximum attempts per student
  timeLimitSeconds?: number // Time limit per attempt
  revealPolicy: RevealPolicy // When to show correct answers
}

export interface CreateAssignmentRequest {
  quizId: string
  classId?: string // Optional: assign to specific class
  settings: AssignmentSettings
}

export interface CreateAssignmentResult {
  success: boolean
  session?: QuizSession
  error?: string
}

// Student assignment progress with enhanced details
export interface StudentAssignmentProgress extends SessionProgress {
  studentName: string
  score?: number
  timeSpent?: number // Total time spent across all attempts
  attemptsUsed: number
  lastActivity?: Date
}

// Assignment overview for teachers
export interface AssignmentOverview {
  session: QuizSession
  quiz: { id: string; title: string; questionCount: number }
  class?: { id: string; name: string }
  stats: {
    totalStudents: number
    notStarted: number
    inProgress: number
    submitted: number
    late: number
    averageScore?: number
    averageTimeSpent?: number
  }
  students: StudentAssignmentProgress[]
}

// Student dashboard assignment card
export interface AssignmentCard {
  sessionId: string
  quizTitle: string
  className?: string
  dueAt: Date
  openAt?: Date | null
  status: ProgressStatus
  attemptsUsed: number
  maxAttempts: number
  timeRemaining: number // seconds until deadline
  canStart: boolean // based on openAt, dueAt, and attempts
  timeLimitSeconds?: number
}