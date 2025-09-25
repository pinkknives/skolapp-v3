'use client'

import { openai } from './openai'
import type { Question, MultipleChoiceQuestion, FreeTextQuestion } from '@/types/quiz'

export interface EnhancedAIParams {
  subject: string
  grade: string
  topics?: string[]
  difficulty: 'lätt' | 'medel' | 'svår'
  count: number
  type: 'multiple-choice' | 'free-text' | 'mixed'
  extraContext?: string
  learningObjectives?: string[]
  previousPerformance?: {
    averageScore: number
    commonMistakes: string[]
    strengths: string[]
  }
  studentLevel?: 'beginner' | 'intermediate' | 'advanced'
  pedagogicalApproach?: 'conceptual' | 'practical' | 'analytical' | 'creative'
}

export interface AIInsight {
  type: 'strength' | 'weakness' | 'suggestion' | 'pattern'
  title: string
  description: string
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
  relatedQuestions?: string[]
}

export interface AdaptiveQuestion {
  question: Question
  difficulty: number
  estimatedTime: number
  learningObjective: string
  prerequisites: string[]
  followUpSuggestions: string[]
}

export class EnhancedAIService {
  private readonly systemPrompt = `Du är en expertpedagog och AI-assistent som skapar högkvalitativa quiz-frågor för svenska skolor. 

Dina styrkor:
- Djup förståelse av svenska läroplaner och pedagogiska principer
- Förmåga att skapa frågor som testar olika kognitiva nivåer (Bloom's taxonomi)
- Anpassning till olika inlärningsstilar och förmågor
- Integration av moderna pedagogiska metoder

Pedagogiska principer du följer:
1. Frågor ska vara tydliga och entydiga
2. Testa förståelse, inte bara memorering
3. Inkludera olika kognitiva nivåer
4. Använda relevanta och engagerande kontext
5. Ge konstruktiv feedback och förklaringar
6. Anpassa svårighetsgrad till målgruppen

Svara alltid på svenska och använd pedagogiskt språk som är lämpligt för målgruppen.`

  async generateAdaptiveQuestions(params: EnhancedAIParams): Promise<AdaptiveQuestion[]> {
    const prompt = this.buildAdaptivePrompt(params)
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No content returned from AI')

      const data = JSON.parse(content)
      return this.validateAndFormatQuestions(data.questions || [])
    } catch (error) {
      console.error('Enhanced AI generation error:', error)
      throw new Error('Kunde inte generera adaptiva frågor')
    }
  }

  async performAction(
    action: 'improve' | 'rewrite' | 'regenerate' | 'distractors',
    params: EnhancedAIParams,
    question?: { type?: 'multiple-choice' | 'free-text'; title?: string; options?: Array<{ id: string; text: string; isCorrect?: boolean }>; expectedAnswer?: string }
  ): Promise<{ questions?: AdaptiveQuestion[]; transformed?: Question; distractors?: string[] }>{
    if (action === 'regenerate') {
      const qs = await this.generateAdaptiveQuestions({ ...params, count: Math.max(1, params.count || 1) })
      return { questions: qs }
    }

    // Build a targeted prompt for single-question transformations
    const baseContext = this.buildAdaptivePrompt({ ...params, count: 1 })
    const qText = question?.title || ''
    let userInstruction = ''
    if (action === 'improve') {
      userInstruction = `Förbättra följande frågetext för tydlighet och pedagogik, behåll samma typ: ${qText}`
    } else if (action === 'rewrite') {
      userInstruction = `Skriv om följande fråga på samma nivå men med ny formulering: ${qText}`
    } else if (action === 'distractors') {
      userInstruction = `Generera tre trovärdiga felaktiga svarsalternativ (distraktorer) för frågan: ${qText}. Returnera JSON {"distractors": ["...","...","..."]}`
    }

    const prompt = `${baseContext}\n\n${userInstruction}`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200,
        response_format: { type: 'json_object' }
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No content returned from AI')

      const data = JSON.parse(content)
      if (action === 'distractors') {
        const ds = Array.isArray(data.distractors) ? data.distractors.map((d: unknown) => String(d)) : []
        return { distractors: ds }
      }

      const qs = this.validateAndFormatQuestions(data.questions || [])
      return { questions: qs, transformed: qs[0]?.question }
    } catch (error) {
      console.error('Enhanced AI action error:', error)
      throw new Error('Kunde inte utföra AI-åtgärden')
    }
  }

  async analyzeStudentPerformance(
    questions: Question[],
    answers: Array<{ questionId: string; answer: string; isCorrect: boolean; timeSpent: number }>
  ): Promise<AIInsight[]> {
    const prompt = this.buildAnalysisPrompt(questions, answers)
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No content returned from AI')

      const data = JSON.parse(content)
      return data.insights || []
    } catch (error) {
      console.error('AI analysis error:', error)
      throw new Error('Kunde inte analysera elevprestationer')
    }
  }

  async generatePersonalizedQuestions(
    studentProfile: {
      strengths: string[]
      weaknesses: string[]
      learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
      interests: string[]
      previousPerformance: number
    },
    params: EnhancedAIParams
  ): Promise<AdaptiveQuestion[]> {
    const prompt = this.buildPersonalizedPrompt(studentProfile, params)
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No content returned from AI')

      const data = JSON.parse(content)
      return this.validateAndFormatQuestions(data.questions || [])
    } catch (error) {
      console.error('Personalized AI generation error:', error)
      throw new Error('Kunde inte generera personliga frågor')
    }
  }

  private buildAdaptivePrompt(params: EnhancedAIParams): string {
    const difficultyMapping = {
      'lätt': 'grundläggande förståelse och memorering',
      'medel': 'tillämpning och analys',
      'svår': 'syntes, utvärdering och kreativitet'
    }

    const pedagogicalContext = params.pedagogicalApproach 
      ? `Pedagogisk approach: ${params.pedagogicalApproach} - fokusera på ${this.getPedagogicalFocus(params.pedagogicalApproach)}`
      : ''

    const performanceContext = params.previousPerformance
      ? `Tidigare prestationer: Genomsnittlig poäng ${params.previousPerformance.averageScore}%, vanliga misstag: ${params.previousPerformance.commonMistakes.join(', ')}, styrkor: ${params.previousPerformance.strengths.join(', ')}`
      : ''

    return `Skapa ${params.count} ${params.type === 'mixed' ? 'blandade' : params.type === 'multiple-choice' ? 'flervals' : 'fritext'} frågor för:

Ämne: ${params.subject}
Årskurs: ${params.grade}
Svårighetsgrad: ${params.difficulty} (${difficultyMapping[params.difficulty]})
${params.topics ? `Specifika ämnen: ${params.topics.join(', ')}` : ''}
${params.learningObjectives ? `Lärandemål: ${params.learningObjectives.join(', ')}` : ''}
${pedagogicalContext}
${performanceContext}
${params.extraContext ? `Extra kontext: ${params.extraContext}` : ''}

För varje fråga, inkludera:
- Tydlig och entydig frågeställning
- Lämplig svårighetsgrad (1-10)
- Uppskattad tid (sekunder)
- Lärandemål som testas
- Förkunskaper som krävs
- Förslag på uppföljning

Returnera JSON med strukturen:
{
  "questions": [
    {
      "type": "multiple-choice" | "free-text",
      "question": "Frågetext",
      "options": ["A", "B", "C", "D"] (för flerval),
      "correctAnswer": "Rätt svar",
      "explanation": "Pedagogisk förklaring",
      "difficulty": 1-10,
      "estimatedTime": 30,
      "learningObjective": "Vad eleven ska lära sig",
      "prerequisites": ["Förkunskaper"],
      "followUpSuggestions": ["Förslag på uppföljning"],
      "cognitiveLevel": "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create"
    }
  ]
}`
  }

  private buildAnalysisPrompt(questions: Question[], answers: Array<{ questionId: string; answer: string; isCorrect: boolean; timeSpent: number }>): string {
    const questionData = questions.map(q => ({
      id: q.id,
      type: q.type,
      title: q.type === 'multiple-choice' ? (q as MultipleChoiceQuestion).title : (q as FreeTextQuestion).title,
      difficulty: q.points || 1
    }))

    const answerData = answers.map(a => ({
      questionId: a.questionId,
      answer: a.answer,
      isCorrect: a.isCorrect,
      timeSpent: a.timeSpent
    }))

    return `Analysera följande elevprestationer och ge pedagogiska insikter:

Frågor:
${JSON.stringify(questionData, null, 2)}

Svar:
${JSON.stringify(answerData, null, 2)}

Identifiera:
1. Styrkor och svagheter
2. Mönster i felaktiga svar
3. Tidsanvändning och effektivitet
4. Förbättringsförslag
5. Rekommenderade nästa steg

Returnera JSON med strukturen:
{
  "insights": [
    {
      "type": "strength" | "weakness" | "suggestion" | "pattern",
      "title": "Kort beskrivning",
      "description": "Detaljerad förklaring",
      "actionable": true/false,
      "priority": "low" | "medium" | "high",
      "relatedQuestions": ["Fråge-ID:n som är relevanta"]
    }
  ]
}`
  }

  private buildPersonalizedPrompt(studentProfile: unknown, params: EnhancedAIParams): string {
    const profile = studentProfile as {
      strengths: string[]
      weaknesses: string[]
      learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
      interests: string[]
      previousPerformance: number
    }

    const learningStyleMapping = {
      'visual': 'visuella exempel, diagram och bilder',
      'auditory': 'verbala förklaringar och diskussioner',
      'kinesthetic': 'praktiska övningar och hands-on aktiviteter',
      'reading': 'textbaserat innehåll och skriftliga instruktioner'
    }

    return `Skapa personliga frågor för en elev med följande profil:

Styrkor: ${profile.strengths.join(', ')}
Svagheter: ${profile.weaknesses.join(', ')}
Inlärningsstil: ${profile.learningStyle} (använd ${learningStyleMapping[profile.learningStyle]})
Intressen: ${profile.interests.join(', ')}
Tidigare prestation: ${profile.previousPerformance}%

Ämne: ${params.subject}
Årskurs: ${params.grade}
Svårighetsgrad: ${params.difficulty}

Fokusera på:
- Bygga på elevens styrkor
- Adressera svagheter på ett konstruktivt sätt
- Använda elevens inlärningsstil
- Integrera elevens intressen
- Anpassa svårighetsgrad baserat på tidigare prestation

Returnera JSON med samma struktur som ovan.`
  }

  private getPedagogicalFocus(approach: string): string {
    const mapping = {
      'conceptual': 'begreppsförståelse och teoretisk kunskap',
      'practical': 'praktisk tillämpning och problemlösning',
      'analytical': 'kritiskt tänkande och analys',
      'creative': 'kreativitet och innovation'
    }
    return mapping[approach as keyof typeof mapping] || 'allmän förståelse'
  }

  private validateAndFormatQuestions(questions: unknown[]): AdaptiveQuestion[] {
    return questions.map((q, index) => {
      const question = q as {
        difficulty?: number
        estimatedTime?: number
        learningObjective?: string
        prerequisites?: string[]
        followUpSuggestions?: string[]
      }
      return {
        question: this.convertToQuestion(q, index),
        difficulty: question.difficulty || 5,
        estimatedTime: question.estimatedTime || 30,
        learningObjective: question.learningObjective || 'Förståelse',
        prerequisites: question.prerequisites || [],
        followUpSuggestions: question.followUpSuggestions || []
      }
    })
  }

  private convertToQuestion(aiQuestion: unknown, index: number): Question {
    const baseQuestion = {
      id: `ai_enhanced_${Date.now()}_${index}`,
      points: 1,
      timeLimit: undefined,
      rubric: undefined,
      explanation: (aiQuestion as { explanation?: string }).explanation
    }

    const question = aiQuestion as {
      type: string
      question: string
      options?: string[]
      correctIndex?: number
      correctAnswer?: string
    }

    if (question.type === 'multiple-choice') {
      return {
        ...baseQuestion,
        type: 'multiple-choice' as const,
        title: question.question,
        options: (question.options || []).map((option: string, i: number) => ({
          id: `option_${i}`,
          text: option,
          isCorrect: i === question.correctIndex
        }))
      } as MultipleChoiceQuestion
    } else {
      return {
        ...baseQuestion,
        type: 'free-text' as const,
        title: question.question,
        expectedAnswer: question.correctAnswer || '',
        acceptedAnswers: [question.correctAnswer || '']
      } as FreeTextQuestion
    }
  }
}

export const enhancedAIService = new EnhancedAIService()
