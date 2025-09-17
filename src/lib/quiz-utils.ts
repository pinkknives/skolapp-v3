import { Quiz, Question, QuizStatus, AIQuizDraft, QuizJoinResult, QuizJoinRequest, Student, QuizSession } from '@/types/quiz'
import { dataRetentionService, createSessionWithRetention } from '@/lib/data-retention'
import { longTermDataService, canStoreLongTermData } from '@/lib/long-term-data'
import { type User, type DataRetentionMode } from '@/types/auth'

// Generate a random 4-character share code
export function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate a unique question ID
export function generateQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate a unique quiz ID
export function generateQuizId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Calculate total points for a quiz
export function calculateTotalPoints(questions: Question[]): number {
  return questions.reduce((total, question) => total + question.points, 0)
}

// Calculate estimated completion time (rough estimate)
export function estimateCompletionTime(questions: Question[]): number {
  let totalTime = 0
  questions.forEach(question => {
    if (question.timeLimit) {
      totalTime += question.timeLimit
    } else {
      // Default estimates based on question type
      switch (question.type) {
        case 'multiple-choice':
          totalTime += 30 // 30 seconds
          break
        case 'free-text':
          totalTime += 60 // 1 minute
          break
        case 'image':
          totalTime += 45 // 45 seconds
          break
      }
    }
  })
  return Math.ceil(totalTime / 60) // Return in minutes
}

// Validate quiz before publishing
export function validateQuiz(quiz: Partial<Quiz>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!quiz.title?.trim()) {
    errors.push('Titel krävs')
  }

  if (!quiz.description?.trim()) {
    errors.push('Beskrivning krävs')
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    errors.push('Minst en fråga krävs')
  }

  quiz.questions?.forEach((question, index) => {
    if (!question.title?.trim()) {
      errors.push(`Fråga ${index + 1}: Titel krävs`)
    }

    if (question.points <= 0) {
      errors.push(`Fråga ${index + 1}: Poäng måste vara större än 0`)
    }

    if (question.type === 'multiple-choice') {
      const mcQuestion = question as any
      if (!mcQuestion.options || mcQuestion.options.length < 2) {
        errors.push(`Fråga ${index + 1}: Minst två svarsalternativ krävs`)
      }

      const correctAnswers = mcQuestion.options?.filter((opt: any) => opt.isCorrect) || []
      if (correctAnswers.length === 0) {
        errors.push(`Fråga ${index + 1}: Minst ett korrekt svar krävs`)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Create a default quiz structure
export function createDefaultQuiz(createdBy: string): Partial<Quiz> {
  return {
    title: '',
    description: '',
    tags: [],
    createdBy,
    status: 'draft' as QuizStatus,
    settings: {
      allowRetakes: false,
      shuffleQuestions: false,
      shuffleAnswers: false,
      showCorrectAnswers: true,
      executionMode: 'self-paced'
    },
    questions: []
  }
}

// Create a default question based on type
export function createDefaultQuestion(type: Question['type']): Partial<Question> {
  const base = {
    id: generateQuestionId(),
    type,
    title: '',
    points: 1
  }

  switch (type) {
    case 'multiple-choice':
      return {
        ...base,
        options: [
          { id: `opt_${Date.now()}_1`, text: '', isCorrect: true },
          { id: `opt_${Date.now()}_2`, text: '', isCorrect: false }
        ]
      }
    case 'free-text':
      return {
        ...base,
        expectedAnswer: '',
        acceptedAnswers: []
      }
    case 'image':
      return {
        ...base,
        imageUrl: '',
        imageAlt: '',
        options: [
          { id: `opt_${Date.now()}_1`, text: '', isCorrect: true },
          { id: `opt_${Date.now()}_2`, text: '', isCorrect: false }
        ]
      }
    default:
      return base
  }
}

// Format execution mode for display
export function formatExecutionMode(mode: Quiz['settings']['executionMode']): string {
  switch (mode) {
    case 'self-paced':
      return 'Självtempo'
    case 'teacher-controlled':
      return 'Lärarstyrt tempo'
    case 'teacher-review':
      return 'Lärargranskningsläge'
    default:
      return mode
  }
}

// Mock AI quiz generation function (placeholder for future AI integration)
export async function generateAIQuizDraft(prompt: AIQuizDraft['prompt']): Promise<Question[]> {
  // This is a mock implementation - in real app would call AI service
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call

  const questions: Question[] = []
  
  for (let i = 0; i < prompt.numberOfQuestions; i++) {
    const questionTypes: Question['type'][] = ['multiple-choice', 'free-text']
    const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)]
    
    if (randomType === 'multiple-choice') {
      questions.push({
        id: generateQuestionId(),
        type: 'multiple-choice',
        title: `AI-genererad fråga ${i + 1} om ${prompt.subject}`,
        points: 1,
        options: [
          { id: `opt_${Date.now()}_1`, text: 'Korrekt svar', isCorrect: true },
          { id: `opt_${Date.now()}_2`, text: 'Fel svar 1', isCorrect: false },
          { id: `opt_${Date.now()}_3`, text: 'Fel svar 2', isCorrect: false },
          { id: `opt_${Date.now()}_4`, text: 'Fel svar 3', isCorrect: false }
        ]
      })
    } else {
      questions.push({
        id: generateQuestionId(),
        type: 'free-text',
        title: `AI-genererad fritextfråga ${i + 1} om ${prompt.subject}`,
        points: 1,
        expectedAnswer: 'Förväntad AI-genererat svar'
      })
    }
  }

  return questions
}

// Mock function to look up quiz by share code
export async function findQuizByShareCode(shareCode: string): Promise<Quiz | null> {
  // In a real app, this would query the database
  // For now, we'll simulate some published quizzes
  const mockQuizzes: Quiz[] = [
    {
      id: 'quiz_1',
      title: 'Svenska Grammatik',
      description: 'Test av svenska ordklasser',
      tags: ['svenska', 'grammatik'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'teacher_1',
      status: 'published',
      shareCode: 'ABC1',
      settings: {
        allowRetakes: false,
        shuffleQuestions: false,
        shuffleAnswers: false,
        showCorrectAnswers: true,
        executionMode: 'self-paced'
      },
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          title: 'Vilken ordklass är ordet "springa"?',
          points: 2,
          options: [
            { id: 'opt1', text: 'Verb', isCorrect: true },
            { id: 'opt2', text: 'Substantiv', isCorrect: false },
            { id: 'opt3', text: 'Adjektiv', isCorrect: false },
            { id: 'opt4', text: 'Adverb', isCorrect: false }
          ]
        }
      ]
    },
    {
      id: 'quiz_2',
      title: 'Matematik - Grundläggande räkning',
      description: 'Test av addition och subtraktion',
      tags: ['matematik', 'grundskola'],
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
      createdBy: 'teacher_2',
      status: 'published',
      shareCode: 'XYZ9',
      settings: {
        allowRetakes: true,
        shuffleQuestions: true,
        shuffleAnswers: true,
        showCorrectAnswers: false,
        executionMode: 'teacher-controlled'
      },
      questions: [
        {
          id: 'q2',
          type: 'free-text',
          title: 'Vad är 15 + 27?',
          points: 1,
          expectedAnswer: '42'
        }
      ]
    }
  ]

  // Simulate database lookup delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return mockQuizzes.find(quiz => quiz.shareCode === shareCode) || null
}

// Generate a unique student ID
export function generateStudentId(): string {
  return `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Join a quiz with guest flow and data retention
export async function joinQuiz(request: QuizJoinRequest, user?: User | null): Promise<QuizJoinResult> {
  try {
    // Find the quiz by share code
    const quiz = await findQuizByShareCode(request.shareCode)
    
    if (!quiz) {
      return {
        success: false,
        error: 'Quiz hittades inte. Kontrollera att koden är korrekt.',
        errorCode: 'QUIZ_NOT_FOUND'
      }
    }

    // Check if quiz is published
    if (quiz.status !== 'published') {
      return {
        success: false,
        error: 'Detta quiz är inte aktivt just nu.',
        errorCode: 'QUIZ_NOT_ACTIVE'
      }
    }

    // Create a student record (in memory for guest mode)
    const student: Student = {
      id: generateStudentId(),
      alias: request.studentAlias,
      joinedAt: new Date(),
      isGuest: !user
    }

    // Create session with appropriate data retention
    const sessionData = createSessionWithRetention(user || null, student.id)

    // Create or find quiz session
    const session: QuizSession = {
      id: sessionData.id,
      quizId: quiz.id,
      teacherId: quiz.createdBy,
      createdAt: new Date(),
      status: 'waiting',
      participants: [student.id],
      shareCode: quiz.shareCode || request.shareCode
    }

    // Store student data with proper retention handling
    if (typeof window !== 'undefined') {
      // Use data retention service to store student data
      dataRetentionService.updateSessionActivity(sessionData.id)
      
      // Store quiz session in sessionStorage for immediate access
      sessionStorage.setItem(`quiz_session_${session.id}`, JSON.stringify(session))
      
      // Store student data based on retention mode
      if (sessionData.dataRetentionMode === 'korttid') {
        // For short-term mode, use sessionStorage (auto-clears on browser close)
        sessionStorage.setItem(`student_${student.id}`, JSON.stringify(student))
      } else {
        // For long-term mode with consent, use localStorage
        localStorage.setItem(`student_${student.id}`, JSON.stringify(student))
      }
    }

    return {
      success: true,
      quiz,
      session
    }
  } catch (error) {
    console.error('Error joining quiz:', error)
    return {
      success: false,
      error: 'Ett fel uppstod när du försökte gå med i quizet. Försök igen.',
      errorCode: 'QUIZ_NOT_FOUND'
    }
  }
}

// Get error message in Swedish based on error code
export function getJoinErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'INVALID_CODE':
      return 'Ogiltig kod. Kontrollera att du har skrivit in rätt fyrteckenskod.'
    case 'QUIZ_NOT_FOUND':
      return 'Quiz hittades inte. Kontrollera att koden är korrekt.'
    case 'QUIZ_NOT_ACTIVE':
      return 'Detta quiz är inte aktivt just nu. Kontakta din lärare.'
    case 'QUIZ_CLOSED':
      return 'Detta quiz har stängts och tar inte emot fler deltagare.'
    default:
      return 'Ett oväntat fel uppstod. Försök igen eller kontakta din lärare.'
  }
}

/**
 * Submit quiz results with proper data retention handling
 */
export function submitQuizResult(
  quizId: string,
  studentId: string,
  answers: { questionId: string; answer: string | string[] }[],
  score: number,
  totalPoints: number,
  timeSpent: number,
  sessionId?: string,
  user?: User | null
): void {
  const result = {
    id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    quizId,
    studentId,
    answers,
    score,
    totalPoints,
    startedAt: new Date(Date.now() - timeSpent * 1000),
    completedAt: new Date(),
    timeSpent
  }

  // Add result to data retention service if session exists
  if (sessionId) {
    dataRetentionService.addQuizResult(sessionId, result)
  }

  // Handle long-term storage for authenticated users
  if (user && canStoreLongTermData(user)) {
    longTermDataService.storeLongTermQuizResult(user.id, result, sessionId)
    
    // Also store analytics data for long-term users
    const analyticsData = {
      id: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      sessionId: sessionId || 'unknown',
      quizId,
      metrics: {
        timeSpent,
        questionsAnswered: answers.length,
        correctAnswers: score,
        incorrectAnswers: answers.length - score,
        averageResponseTime: timeSpent / answers.length
      },
      progressData: {
        skillsImproved: [], // Would be calculated based on quiz content
        strugglingAreas: [], // Would be calculated based on incorrect answers
        overallProgress: (score / totalPoints) * 100
      },
      timestamp: new Date()
    }
    
    longTermDataService.storeAnalyticsData(analyticsData)
  }

  // Also store in appropriate storage based on user/guest mode
  if (typeof window !== 'undefined') {
    const retentionMode = user?.dataRetentionMode || 'korttid'
    
    if (retentionMode === 'korttid' || !user) {
      // Short-term mode or guest: use sessionStorage
      sessionStorage.setItem(`quiz_result_${result.id}`, JSON.stringify(result))
    } else {
      // Long-term mode with user: use localStorage (will be cleaned up based on consent)
      localStorage.setItem(`quiz_result_${result.id}`, JSON.stringify(result))
    }
  }

  console.log(`[QuizUtils] Submitted quiz result for ${user?.dataRetentionMode || 'korttid'} storage:`, result)
}

/**
 * Get quiz results for a student with respect to data retention
 */
export function getQuizResults(studentId: string, sessionId?: string, user?: User | null): any[] {
  if (typeof window === 'undefined') return []

  const results: any[] = []

  // Get results from long-term storage if user has long-term mode
  if (user && canStoreLongTermData(user)) {
    const longTermResults = longTermDataService.getLongTermQuizResults(user.id)
    results.push(...longTermResults.filter(r => r.studentId === studentId))
  }

  // Get results from data retention service session if available
  if (sessionId) {
    const session = dataRetentionService.getSession(sessionId)
    if (session) {
      results.push(...session.quizResults.filter(r => r.studentId === studentId))
    }
  }

  // Also check storage directly for any remaining data
  const storageKeys = [
    ...Object.keys(sessionStorage).filter(key => key.startsWith('quiz_result_')),
    ...Object.keys(localStorage).filter(key => key.startsWith('quiz_result_'))
  ]

  for (const key of storageKeys) {
    try {
      const storage = key.startsWith('quiz_result_') && sessionStorage.getItem(key) ? sessionStorage : localStorage
      const result = JSON.parse(storage.getItem(key) || '{}')
      if (result.studentId === studentId && !results.find(r => r.id === result.id)) {
        results.push(result)
      }
    } catch (error) {
      console.error('Error parsing quiz result:', error)
    }
  }

  return results
}

/**
 * Get analytics data for a user (long-term mode only)
 */
export function getUserAnalytics(userId: string): any[] {
  return longTermDataService.getAnalyticsData(userId)
}

/**
 * Get progress summary for a user
 */
export function getUserProgressSummary(userId: string) {
  const analyticsData = longTermDataService.getAnalyticsData(userId)
  
  if (analyticsData.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      skillsImproved: [],
      strugglingAreas: [],
      overallProgress: 0
    }
  }

  const totalQuizzes = analyticsData.length
  const averageScore = analyticsData.reduce((sum, data) => 
    sum + data.progressData.overallProgress, 0) / totalQuizzes
  const totalTimeSpent = analyticsData.reduce((sum, data) => 
    sum + data.metrics.timeSpent, 0)

  // Aggregate skills and struggling areas
  const allSkills = analyticsData.flatMap(data => data.progressData.skillsImproved)
  const allStrugglingAreas = analyticsData.flatMap(data => data.progressData.strugglingAreas)
  
  const skillCounts = allSkills.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const strugglingCounts = allStrugglingAreas.reduce((acc, area) => {
    acc[area] = (acc[area] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalQuizzes,
    averageScore,
    totalTimeSpent,
    skillsImproved: Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a]).slice(0, 5),
    strugglingAreas: Object.keys(strugglingCounts).sort((a, b) => strugglingCounts[b] - strugglingCounts[a]).slice(0, 5),
    overallProgress: averageScore
  }
}

/**
 * Clean up session data manually (for immediate cleanup)
 */
export function cleanupSessionData(sessionId: string): void {
  if (typeof window === 'undefined') return

  // Clean up session-specific data
  sessionStorage.removeItem(`quiz_session_${sessionId}`)
  
  // Get session data to clean up related data
  const session = dataRetentionService.getSession(sessionId)
  if (session) {
    // Clean up student data if guest session
    if (session.guestId) {
      sessionStorage.removeItem(`student_${session.guestId}`)
      localStorage.removeItem(`student_${session.guestId}`)
    }

    // Clean up quiz results for short-term sessions
    if (session.dataRetentionMode === 'korttid') {
      session.quizResults.forEach(result => {
        sessionStorage.removeItem(`quiz_result_${result.id}`)
        localStorage.removeItem(`quiz_result_${result.id}`)
      })
    }
  }

  console.log(`[QuizUtils] Manually cleaned up session data for ${sessionId}`)
}

/**
 * Trigger GDPR-compliant cleanup for short-term data
 */
export function triggerGDPRCleanup(sessionId?: string): void {
  if (typeof window === 'undefined') return
  
  console.log('[GDPR] Triggering data cleanup for session:', sessionId || 'all short-term sessions')
  
  // Clean up session storage for short-term data
  const sessionKeys = Object.keys(sessionStorage).filter(key => 
    key.startsWith('quiz_') || key.startsWith('current_')
  )
  
  for (const key of sessionKeys) {
    try {
      sessionStorage.removeItem(key)
      console.log('[GDPR] Removed session data:', key)
    } catch (error) {
      console.error('[GDPR] Error removing session data:', key, error)
    }
  }
  
  // Also clean up specific session data if sessionId provided
  if (sessionId) {
    cleanupSessionData(sessionId)
  }
  
  console.log('[GDPR] Short-term data cleanup completed')
}

/**
 * Get all quiz results for teacher view (respects GDPR and subscription limits)
 */
export function getTeacherQuizResults(
  quizId: string, 
  teacherUser: User | null
): { results: any[], students: any[], canViewIndividual: boolean } {
  if (typeof window === 'undefined') {
    return { results: [], students: [], canViewIndividual: false }
  }
  
  const canViewIndividual = teacherUser?.subscriptionPlan !== 'gratis' && 
                            teacherUser?.dataRetentionMode === 'långtid'
  
  let results: any[] = []
  let students: any[] = []
  
  // Get results from appropriate storage based on teacher's plan
  if (canViewIndividual && teacherUser) {
    // Get from long-term storage
    const longTermResults = longTermDataService.getLongTermQuizResults(teacherUser.id)
    results = longTermResults.filter(r => r.quizId === quizId)
    
    // In a real app, this would fetch actual student data from the database
    students = []
  } else {
    // Only aggregate data for free tier
    console.log('[GDPR] Limited access: only aggregate data available for free tier')
  }
  
  return {
    results,
    students,
    canViewIndividual
  }
}

/**
 * Schedule automatic cleanup for quiz session data
 */
export function scheduleQuizSessionCleanup(sessionId: string, dataRetentionMode: DataRetentionMode): void {
  if (typeof window === 'undefined') return
  
  const cleanupDelay = dataRetentionMode === 'korttid' 
    ? 4 * 60 * 60 * 1000 // 4 hours for short-term
    : 24 * 60 * 60 * 1000 // 24 hours for long-term session data
  
  setTimeout(() => {
    console.log(`[GDPR] Auto-cleanup triggered for session ${sessionId} (${dataRetentionMode})`)
    if (dataRetentionMode === 'korttid') {
      triggerGDPRCleanup(sessionId)
    }
  }, cleanupDelay)
  
  console.log(`[GDPR] Scheduled cleanup for session ${sessionId} in ${cleanupDelay / (60 * 1000)} minutes`)
}