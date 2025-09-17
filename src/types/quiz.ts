// Quiz data types and interfaces

export type QuestionType = 'multiple-choice' | 'free-text' | 'image'

export type ExecutionMode = 'self-paced' | 'teacher-controlled' | 'teacher-review'

export type QuizStatus = 'draft' | 'published' | 'archived'

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

export interface BaseQuestion {
  id: string
  type: QuestionType
  title: string
  points: number
  timeLimit?: number // in seconds
  rubric?: Rubric // Optional rubric for AI grading
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
}

export interface Quiz {
  id: string
  title: string
  description: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string // Teacher ID
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
  createdAt: Date
  status: 'waiting' | 'active' | 'completed'
  participants: string[] // Student IDs
  currentQuestionIndex?: number // For teacher-controlled mode
  shareCode: string
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