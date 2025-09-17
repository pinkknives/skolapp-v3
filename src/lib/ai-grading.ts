// AI-assisted grading service with adapter pattern
import { AIAssessment, Question, QuestionType } from '@/types/quiz'
import { type User, type DataRetentionMode } from '@/types/auth'

export interface AIGradingAdapter {
  gradeText(answer: string, question: Question, rubric?: string): Promise<AIAssessment>
  gradeImage(imageRef: string, question: Question, rubric?: string): Promise<AIAssessment>
  explainAnswer(question: Question, correctAnswer?: string): Promise<string>
  generateFeedback(answer: string, question: Question, isCorrect: boolean): Promise<string>
  name: string
  requiresExternalAPI: boolean
  supportedQuestionTypes: QuestionType[]
}

// Local demo adapter - no external API calls, simple rule-based logic
export class LocalDemoAdapter implements AIGradingAdapter {
  name = 'Local Demo'
  requiresExternalAPI = false
  supportedQuestionTypes: QuestionType[] = ['free-text', 'multiple-choice', 'image']

  async gradeText(answer: string, question: Question, rubric?: string): Promise<AIAssessment> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))
    
    const trimmedAnswer = answer.trim().toLowerCase()
    let suggestedScore = 0
    let confidence = 0.7
    let rationale = ''

    if (question.type === 'free-text') {
      const expectedAnswers = question.expectedAnswer ? [question.expectedAnswer.toLowerCase()] : []
      const acceptedAnswers = question.acceptedAnswers?.map(a => a.toLowerCase()) || []
      const allAccepted = [...expectedAnswers, ...acceptedAnswers]

      // Simple keyword matching
      const hasKeywords = allAccepted.some(expected => 
        trimmedAnswer.includes(expected) || expected.includes(trimmedAnswer)
      )

      if (hasKeywords) {
        suggestedScore = question.points
        confidence = 0.8
        rationale = 'Svaret innehåller förväntade nyckelord och verkar korrekt.'
      } else if (trimmedAnswer.length > 10) {
        suggestedScore = Math.floor(question.points * 0.5)
        confidence = 0.5
        rationale = 'Svaret är genomtänkt men kanske inte helt korrekt. Behöver manuell granskning.'
      } else {
        suggestedScore = 0
        confidence = 0.6
        rationale = 'Svaret är för kort eller verkar inte svara på frågan.'
      }
    }

    return {
      id: `ai_assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      answerId: `answer_${Date.now()}`, // Would be provided by caller
      questionId: question.id,
      questionType: question.type,
      suggestedScore,
      maxScore: question.points,
      rationale,
      confidence,
      timestamp: new Date(),
      aiModel: 'local-demo-v1'
    }
  }

  async gradeImage(imageRef: string, question: Question, rubric?: string): Promise<AIAssessment> {
    // Simulate processing delay for image analysis
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800))

    // Simple mock image analysis
    const confidence = 0.4 // Lower confidence for demo image analysis
    const suggestedScore = Math.random() > 0.5 ? question.points : 0
    
    return {
      id: `ai_assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      answerId: `answer_${Date.now()}`,
      questionId: question.id,
      questionType: question.type,
      suggestedScore,
      maxScore: question.points,
      rationale: suggestedScore > 0 
        ? 'Bilden verkar visa rätt innehåll, men låg säkerhet - kontrollera manuellt.'
        : 'Bilden verkar inte visa förväntat innehåll, men låg säkerhet - kontrollera manuellt.',
      confidence,
      timestamp: new Date(),
      aiModel: 'local-demo-image-v1'
    }
  }

  async explainAnswer(question: Question, correctAnswer?: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    if (question.type === 'multiple-choice') {
      const correctOption = question.options?.find(opt => opt.isCorrect)
      return correctOption 
        ? `Det rätta svaret är "${correctOption.text}" eftersom det är det alternativ som är markerat som korrekt.`
        : 'Förklaring kan inte genereras för denna flervalsfråga.'
    }
    
    return 'Demo-förklaring: Denna fråga kräver manuell förklaring från läraren.'
  }

  async generateFeedback(answer: string, question: Question, isCorrect: boolean): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (isCorrect) {
      return 'Bra jobbat! Ditt svar är korrekt.'
    }
    
    return 'Ditt svar behöver förbättras. Fundera på om du har med alla viktiga delar i ditt svar.'
  }
}

// Cloud LLM adapter - for future external API integration
export class CloudLLMAdapter implements AIGradingAdapter {
  name = 'Cloud AI'
  requiresExternalAPI = true
  supportedQuestionTypes: QuestionType[] = ['free-text', 'image']

  async gradeText(answer: string, question: Question, rubric?: string): Promise<AIAssessment> {
    // This would integrate with external LLM service
    throw new Error('Cloud LLM adapter not implemented in MVP - endast för långtidsläge med samtycke')
  }

  async gradeImage(imageRef: string, question: Question, rubric?: string): Promise<AIAssessment> {
    throw new Error('Cloud LLM adapter not implemented in MVP - endast för långtidsläge med samtycke')
  }

  async explainAnswer(question: Question, correctAnswer?: string): Promise<string> {
    throw new Error('Cloud LLM adapter not implemented in MVP - endast för långtidsläge med samtycke')
  }

  async generateFeedback(answer: string, question: Question, isCorrect: boolean): Promise<string> {
    throw new Error('Cloud LLM adapter not implemented in MVP - endast för långtidsläge med samtycke')
  }
}

// Main AI grading client
export class AIGradingClient {
  private adapter: AIGradingAdapter

  constructor(
    user?: User,
    dataRetentionMode: DataRetentionMode = 'korttid'
  ) {
    // Choose adapter based on user settings and data retention mode
    if (dataRetentionMode === 'långtid' && user?.hasParentalConsent) {
      // In real implementation, this would check feature flags and consent
      this.adapter = new LocalDemoAdapter() // Use demo for MVP
    } else {
      // Always use local demo for short-term mode to protect PII
      this.adapter = new LocalDemoAdapter()
    }
  }

  getAdapterInfo() {
    return {
      name: this.adapter.name,
      requiresExternalAPI: this.adapter.requiresExternalAPI,
      supportedQuestionTypes: this.adapter.supportedQuestionTypes
    }
  }

  async gradeAnswer(
    answer: string | string[],
    question: Question,
    rubric?: string,
    imageRef?: string
  ): Promise<AIAssessment> {
    // Anonymize answer if needed (remove student identifiers)
    const anonymizedAnswer = this.anonymizeAnswer(answer)

    if (question.type === 'image' && imageRef) {
      return this.adapter.gradeImage(imageRef, question, rubric)
    } else if (question.type === 'free-text' && typeof anonymizedAnswer === 'string') {
      return this.adapter.gradeText(anonymizedAnswer, question, rubric)
    } else if (question.type === 'multiple-choice') {
      // Auto-grade multiple choice (no AI needed)
      return this.gradeMultipleChoice(anonymizedAnswer, question)
    }

    throw new Error(`Ohanterad frågetyp för AI-rättning: ${question.type}`)
  }

  private anonymizeAnswer(answer: string | string[]): string {
    if (Array.isArray(answer)) {
      return answer.join(', ')
    }
    
    // Simple anonymization - remove common student identifiers
    return answer
      .replace(/mitt namn är \w+/gi, 'mitt namn är [ANONYMISERAT]')
      .replace(/jag heter \w+/gi, 'jag heter [ANONYMISERAT]')
      .replace(/\b\d{10,12}\b/g, '[PERSONNUMMER_BORTTAGET]') // Remove potential social security numbers
  }

  private async gradeMultipleChoice(answer: string | string[], question: Question): Promise<AIAssessment> {
    if (question.type !== 'multiple-choice') {
      throw new Error('Kan endast använda för flervalsfrågor')
    }

    const studentAnswers = Array.isArray(answer) ? answer : [answer]
    const correctOptions = question.options?.filter(opt => opt.isCorrect) || []
    const correctAnswers = correctOptions.map(opt => opt.id)
    
    const isCorrect = studentAnswers.length === correctAnswers.length &&
                     studentAnswers.every(ans => correctAnswers.includes(ans))

    const suggestedScore = isCorrect ? question.points : 0
    
    return {
      id: `ai_assessment_mc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      answerId: `answer_${Date.now()}`,
      questionId: question.id,
      questionType: question.type,
      suggestedScore,
      maxScore: question.points,
      rationale: isCorrect 
        ? 'Korrekt svar på flervalsfråga.'
        : `Felaktigt svar. Rätt svar: ${correctOptions.map(opt => opt.text).join(', ')}`,
      confidence: 1.0, // Perfect confidence for multiple choice
      timestamp: new Date(),
      aiModel: 'auto-grade-mc'
    }
  }

  async explainAnswer(question: Question, correctAnswer?: string): Promise<string> {
    return this.adapter.explainAnswer(question, correctAnswer)
  }

  async generateFeedback(
    answer: string,
    question: Question,
    isCorrect: boolean
  ): Promise<string> {
    const anonymizedAnswer = this.anonymizeAnswer(answer)
    return this.adapter.generateFeedback(
      typeof anonymizedAnswer === 'string' ? anonymizedAnswer : anonymizedAnswer,
      question,
      isCorrect
    )
  }
}

// Factory function to create AI grading client
export function createAIGradingClient(
  user?: User,
  dataRetentionMode: DataRetentionMode = 'korttid'
): AIGradingClient {
  return new AIGradingClient(user, dataRetentionMode)
}

// Utility function to check if AI grading is available for a question type
export function isAIGradingSupported(questionType: QuestionType): boolean {
  return ['free-text', 'multiple-choice', 'image'].includes(questionType)
}