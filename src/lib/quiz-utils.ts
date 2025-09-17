import { Quiz, Question, QuizStatus, AIQuizDraft } from '@/types/quiz'

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