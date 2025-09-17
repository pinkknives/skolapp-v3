// AI-assisted grading service with adapter pattern
import { AIAssessment, Question, QuestionType, Rubric, RubricEvaluation } from '@/types/quiz'
import { type User, type DataRetentionMode } from '@/types/auth'

export interface AIGradingAdapter {
  gradeText(answer: string, question: Question, rubric?: Rubric): Promise<AIAssessment>
  gradeImage(imageRef: string, question: Question, rubric?: Rubric): Promise<AIAssessment>
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

  async gradeText(answer: string, question: Question, rubric?: Rubric): Promise<AIAssessment> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))
    
    const trimmedAnswer = answer.trim().toLowerCase()
    let suggestedScore = 0
    let confidence = 0.7
    let rationale = ''
    let rubricEvaluation: RubricEvaluation | undefined

    if (question.type === 'free-text') {
      // If rubric is provided, use it for more sophisticated grading
      if (rubric && rubric.criteria.length > 0) {
        const criteriaResults = rubric.criteria.map(criterion => {
          // Simple keyword matching against criterion text and examples
          const criterionKeywords = [
            ...criterion.text.toLowerCase().split(' '),
            ...(criterion.example ? criterion.example.toLowerCase().split(' ') : [])
          ].filter(word => word.length > 3) // Only consider words longer than 3 chars

          const matchesFound = criterionKeywords.filter(keyword => 
            trimmedAnswer.includes(keyword)
          )
          
          const matchPercentage = matchesFound.length / Math.max(criterionKeywords.length, 1)
          const met = matchPercentage > 0.3 // Criterion met if 30% of keywords match
          const score = met ? Math.min(criterion.weight, Math.round(matchPercentage * criterion.weight)) : 0
          
          let explanation = ''
          if (met) {
            explanation = `Kriteriet uppfylls delvis/helt. Hittade relevanta nyckelord: ${matchesFound.slice(0, 3).join(', ')}.`
          } else {
            explanation = `Kriteriet uppfylls inte. Svaret saknar relevanta element för detta kriterium.`
          }

          return {
            criterionId: criterion.id,
            met,
            score,
            explanation
          }
        })

        // Calculate total score based on criteria
        const totalWeightedScore = criteriaResults.reduce((sum, result) => sum + result.score, 0)
        const maxPossibleScore = rubric.criteria.reduce((sum, criterion) => sum + criterion.weight, 0)
        const scorePercentage = totalWeightedScore / Math.max(maxPossibleScore, 1)
        
        suggestedScore = Math.round(question.points * scorePercentage)
        confidence = 0.75 // Higher confidence when using rubrics
        
        const metCriteria = criteriaResults.filter(r => r.met).length
        const totalCriteria = criteriaResults.length
        
        rationale = `Baserat på bedömningskriterier: ${metCriteria} av ${totalCriteria} kriterier uppfyllda. ` +
                   `Viktad poäng: ${totalWeightedScore}/${maxPossibleScore}.`

        rubricEvaluation = {
          criteriaResults,
          overallJustification: `Svaret utvärderades mot ${totalCriteria} definierade kriterier. ` +
                               `${metCriteria} kriterier uppfylldes, vilket ger en bedömning på ${Math.round(scorePercentage * 100)}% av maxpoäng.`
        }
      } else {
        // Fall back to original keyword matching if no rubric
        const expectedAnswers = question.expectedAnswer ? [question.expectedAnswer.toLowerCase()] : []
        const acceptedAnswers = question.acceptedAnswers?.map(a => a.toLowerCase()) || []
        const allAccepted = [...expectedAnswers, ...acceptedAnswers]

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
      aiModel: 'local-demo-v1',
      rubricEvaluation
    }
  }

  async gradeImage(imageRef: string, question: Question, rubric?: Rubric): Promise<AIAssessment> {
    // Simulate processing delay for image analysis
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800))

    // Simple mock image analysis with rubric consideration
    let confidence = 0.4 // Lower confidence for demo image analysis
    let suggestedScore = Math.random() > 0.5 ? question.points : 0
    let rubricEvaluation: RubricEvaluation | undefined
    
    // If rubric exists, simulate rubric-based evaluation
    if (rubric && rubric.criteria.length > 0) {
      const criteriaResults = rubric.criteria.map(criterion => {
        // For demo purposes, randomly determine if image meets criterion
        const met = Math.random() > 0.4
        const score = met ? criterion.weight : 0
        
        return {
          criterionId: criterion.id,
          met,
          score,
          explanation: met 
            ? `Bilden verkar uppfylla detta kriterium (demo-bedömning).`
            : `Bilden verkar inte uppfylla detta kriterium (demo-bedömning).`
        }
      })

      const totalWeightedScore = criteriaResults.reduce((sum, result) => sum + result.score, 0)
      const maxPossibleScore = rubric.criteria.reduce((sum, criterion) => sum + criterion.weight, 0)
      const scorePercentage = totalWeightedScore / Math.max(maxPossibleScore, 1)
      
      suggestedScore = Math.round(question.points * scorePercentage)
      confidence = 0.3 // Still low confidence for demo image analysis

      rubricEvaluation = {
        criteriaResults,
        overallJustification: `Bildanalys utförd mot ${rubric.criteria.length} kriterier. ` +
                             `Låg säkerhet - kontrollera manuellt.`
      }
    }
    
    return {
      id: `ai_assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      answerId: `answer_${Date.now()}`,
      questionId: question.id,
      questionType: question.type,
      suggestedScore,
      maxScore: question.points,
      rationale: rubricEvaluation 
        ? `Bildanalys baserad på bedömningskriterier. ${rubricEvaluation.overallJustification}`
        : (suggestedScore > 0 
          ? 'Bilden verkar visa rätt innehåll, men låg säkerhet - kontrollera manuellt.'
          : 'Bilden verkar inte visa förväntat innehåll, men låg säkerhet - kontrollera manuellt.'),
      confidence,
      timestamp: new Date(),
      aiModel: 'local-demo-image-v1',
      rubricEvaluation
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

  async gradeText(answer: string, question: Question, rubric?: Rubric): Promise<AIAssessment> {
    // This would integrate with external LLM service
    throw new Error('Cloud LLM adapter not implemented in MVP - endast för långtidsläge med samtycke')
  }

  async gradeImage(imageRef: string, question: Question, rubric?: Rubric): Promise<AIAssessment> {
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
    imageRef?: string
  ): Promise<AIAssessment> {
    // Anonymize answer if needed (remove student identifiers)
    const anonymizedAnswer = this.anonymizeAnswer(answer)

    // Extract rubric from question if available
    const rubric = question.rubric

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