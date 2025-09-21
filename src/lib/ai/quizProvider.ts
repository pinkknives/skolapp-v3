// AI Quiz Provider - Provider abstraction layer for quiz question generation and hints
import { Question, MultipleChoiceQuestion, FreeTextQuestion } from '@/types/quiz'

export type AiParams = {
  subject: string;
  grade: string;           // t.ex. "Åk 6"
  count: number;           // 1-10
  type: 'multiple-choice' | 'free-text';
  difficulty: 'easy' | 'medium' | 'hard';
  topics?: string[];       // specifika områden
  context?: string;        // extra kontext
  locale: 'sv-SE';
  useRAG?: boolean;        // Enable RAG-powered generation
};

export type AiChoice = { id: string; text: string; correct?: boolean };

// Citation information for RAG-generated content
export type AiCitation = {
  sourceId: string;
  sourceTitle: string;
  sourceUrl?: string;
  license?: string;
  span?: string; // specific text span that was referenced
};

export type AiQuestion =
  | { 
      kind: 'multiple-choice'; 
      prompt: string; 
      choices: AiChoice[];
      citations?: AiCitation[];
      explanation?: string;
    }
  | { 
      kind: 'free-text'; 
      prompt: string; 
      expectedAnswer: string;
      citations?: AiCitation[];
      explanation?: string;
    };

// New types for AI hints v2
export type AiTitleSuggestion = {
  title: string;
  description?: string;
  learningObjectives?: string[];
};

export type AiTextSimplification = {
  original: string;
  simplified: string;
  improvements: string[];
};

export type AiDifficultyVariation = {
  original: AiQuestion;
  variations: Array<{
    difficulty: 'easy' | 'medium' | 'hard';
    question: AiQuestion;
    changes: string[];
  }>;
};

export type AiClarityImprovement = {
  original: string;
  improved: string;
  improvements: string[];
};

export type AiAnswerGeneration = {
  questionId: string;
  generatedChoices: AiChoice[];
  confidence: 'high' | 'medium' | 'low';
};

export interface QuizAIProvider {
  generateQuestions(params: AiParams): Promise<AiQuestion[]>;
  // New hint methods
  suggestTitle(params: { subject: string; grade: string; topics?: string[]; context?: string }): Promise<AiTitleSuggestion[]>;
  simplifyText(text: string, targetGrade: string): Promise<AiTextSimplification>;
  varyDifficulty(question: AiQuestion, targetDifficulties: Array<'easy' | 'medium' | 'hard'>): Promise<AiDifficultyVariation>;
  improveClarity(questionText: string, questionType: 'multiple-choice' | 'free-text'): Promise<AiClarityImprovement>;
  generateAnswers(questionText: string): Promise<AiAnswerGeneration>;
  name: string;
  isAvailable: boolean;
}

// Mock provider for development and testing
export class MockQuizProvider implements QuizAIProvider {
  name = 'Mock AI Provider';
  isAvailable = true;

  async generateQuestions(params: AiParams): Promise<AiQuestion[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
    
    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('AI service temporarily unavailable. Please try again.');
    }

    const questions: AiQuestion[] = [];
    
    for (let i = 0; i < params.count; i++) {
      const questionNumber = i + 1;
      
      if (params.type === 'multiple-choice') {
        questions.push({
          kind: 'multiple-choice',
          prompt: `AI-genererad ${params.difficulty === 'easy' ? 'enkel' : params.difficulty === 'hard' ? 'svår' : 'medelsvår'} fråga ${questionNumber} om ${params.subject.toLowerCase()}${params.topics?.length ? ` (${params.topics.join(', ')})` : ''}`,
          choices: [
            { id: `choice-${i}-1`, text: 'Korrekt alternativ A', correct: true },
            { id: `choice-${i}-2`, text: 'Felaktigt alternativ B', correct: false },
            { id: `choice-${i}-3`, text: 'Felaktigt alternativ C', correct: false },
            { id: `choice-${i}-4`, text: 'Felaktigt alternativ D', correct: false }
          ]
        });
      } else {
        questions.push({
          kind: 'free-text',
          prompt: `AI-genererad ${params.difficulty === 'easy' ? 'enkel' : params.difficulty === 'hard' ? 'svår' : 'medelsvår'} fritextfråga ${questionNumber} om ${params.subject.toLowerCase()}${params.topics?.length ? ` (${params.topics.join(', ')})` : ''}`,
          expectedAnswer: `Exempelsvar för ${params.subject.toLowerCase()} fråga ${questionNumber}`
        });
      }
    }
    
    return questions;
  }

  async suggestTitle(params: { subject: string; grade: string; topics?: string[]; context?: string }): Promise<AiTitleSuggestion[]> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    const topicsText = params.topics?.length ? ` om ${params.topics.join(', ')}` : '';
    const baseTitle = `${params.subject} för ${params.grade}${topicsText}`;
    
    return [
      {
        title: `${baseTitle} - Grundläggande`,
        description: `Introduktion till ${params.subject.toLowerCase()} för elever i ${params.grade}`,
        learningObjectives: [
          `Förstå grundläggande begrepp inom ${params.subject.toLowerCase()}`,
          `Kunna tillämpa kunskaper i praktiska situationer`,
          `Utveckla problemlösningsförmåga`
        ]
      },
      {
        title: `Utmaning i ${params.subject}`,
        description: `Fördjupade frågor inom ${params.subject.toLowerCase()} anpassade för ${params.grade}`,
        learningObjectives: [
          `Fördjupa förståelsen för ${params.subject.toLowerCase()}`,
          `Träna kritiskt tänkande`,
          `Koppla samman olika koncept`
        ]
      },
      {
        title: `${params.subject} - Repetition`,
        description: `Repetition av viktiga moment inom ${params.subject.toLowerCase()}`,
        learningObjectives: [
          `Repetera och befästa kunskaper`,
          `Identifiera kunskapsluckor`,
          `Förbereda för kommande moment`
        ]
      }
    ];
  }

  async simplifyText(text: string, targetGrade: string): Promise<AiTextSimplification> {
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 300));
    
    // Simple mock simplification
    const simplified = text
      .replace(/komplicerad/g, 'svår')
      .replace(/använder/g, 'använder')
      .replace(/genomföra/g, 'göra')
      .replace(/därför att/g, 'för att');
    
    return {
      original: text,
      simplified: simplified,
      improvements: [
        'Kortare meningar',
        'Enklare ordval',
        `Anpassat för ${targetGrade}`
      ]
    };
  }

  async varyDifficulty(question: AiQuestion, targetDifficulties: Array<'easy' | 'medium' | 'hard'>): Promise<AiDifficultyVariation> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    
    const variations = targetDifficulties.map(difficulty => {
      let modifiedQuestion: AiQuestion;
      const changes: string[] = [];
      
      if (question.kind === 'multiple-choice') {
        const prompt = question.prompt.replace(/enkel|medelsvår|svår/, 
          difficulty === 'easy' ? 'enkel' : difficulty === 'hard' ? 'svår' : 'medelsvår'
        );
        
        modifiedQuestion = {
          ...question,
          prompt
        };
        
        if (difficulty === 'easy') {
          changes.push('Förenklad frågeställning', 'Tydligare alternativ');
        } else if (difficulty === 'hard') {
          changes.push('Mer komplex frågeställning', 'Svårare alternativ');
        } else {
          changes.push('Balanserad svårighetsgrad');
        }
      } else {
        const prompt = question.prompt.replace(/enkel|medelsvår|svår/, 
          difficulty === 'easy' ? 'enkel' : difficulty === 'hard' ? 'svår' : 'medelsvår'
        );
        
        modifiedQuestion = {
          ...question,
          prompt
        };
        changes.push(`Anpassad till ${difficulty === 'easy' ? 'enkel' : difficulty === 'hard' ? 'svår' : 'medelsvår'} nivå`);
      }
      
      return {
        difficulty,
        question: modifiedQuestion,
        changes
      };
    });
    
    return {
      original: question,
      variations
    };
  }

  async improveClarity(questionText: string, questionType: 'multiple-choice' | 'free-text'): Promise<AiClarityImprovement> {
    await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 350));
    
    const improved = questionText
      .replace(/Vad är/g, 'Vad betyder')
      .replace(/Hur/g, 'På vilket sätt')
      .replace(/Varför/g, 'Av vilken anledning');
    
    return {
      original: questionText,
      improved: improved,
      improvements: [
        'Tydligare frågeställning',
        'Mer specifikt ordval',
        questionType === 'multiple-choice' ? 'Optimerad för flerval' : 'Optimerad för fritext'
      ]
    };
  }

  async generateAnswers(_questionText: string): Promise<AiAnswerGeneration> {
    await new Promise(resolve => setTimeout(resolve, 900 + Math.random() * 450));
    
    const questionId = `generated_${Date.now()}`;
    
    return {
      questionId,
      generatedChoices: [
        { id: `${questionId}_1`, text: 'AI-genererat korrekt svar', correct: true },
        { id: `${questionId}_2`, text: 'AI-genererat felaktigt alternativ 1', correct: false },
        { id: `${questionId}_3`, text: 'AI-genererat felaktigt alternativ 2', correct: false },
        { id: `${questionId}_4`, text: 'AI-genererat felaktigt alternativ 3', correct: false }
      ],
      confidence: 'medium'
    };
  }
}

// Future provider stubs - ready for real implementation
export class OpenAIQuizProvider implements QuizAIProvider {
  name = 'OpenAI GPT';
  
  get isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async generateQuestions(params: AiParams): Promise<AiQuestion[]> {
    if (!this.isAvailable) {
      throw new Error('OpenAI API key not configured');
    }

    // Import shared OpenAI client
    const { openai } = await import('./openai');
    
    // Import RAG service dynamically to avoid circular dependencies
    const { retrieveCurriculumContext, buildRAGEnhancedPrompt, extractCitations } = 
      await import('./ragService');

    let contextData: unknown[] = [];
    let prompt = this.buildPrompt(params);

    // Use RAG if enabled and we have subject/grade info
    if (params.useRAG && params.subject && params.grade) {
      try {
        const keywords = params.topics?.join(' ') || params.context;
        contextData = await retrieveCurriculumContext(
          params.subject, 
          params.grade, 
          keywords,
          6
        );
        
        if (contextData.length > 0) {
          prompt = buildRAGEnhancedPrompt(prompt, contextData, {
            subject: params.subject,
            grade: params.grade,
            count: params.count,
            type: params.type,
            difficulty: params.difficulty
          });
          console.log(`Using RAG with ${contextData.length} curriculum sources for ${params.subject} ${params.grade}`);
        }
      } catch (error) {
        console.warn('RAG retrieval failed, falling back to standard generation:', error);
      }
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Use more cost-effective model
        messages: [
          {
            role: 'system',
            content: params.useRAG 
              ? `Du är en svensk ämneslärare som skapar quiz-frågor baserat på svenska läroplaner. Använd ENDAST tillhandahållen läroplan-kontext. Svara alltid på svenska och skapa innehåll som är pedagogiskt och åldersanpassat. VIKTIGT: Svara endast med giltigt JSON, inga förklaringar eller extra text.`
              : `Du är en svensk lärare som skapar quiz-frågor. Svara alltid på svenska och skapa innehåll som är pedagogiskt och åldersanpassat. VIKTIGT: Svara endast med giltigt JSON, inga förklaringar eller extra text.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      // Parse the JSON response
      const questions = JSON.parse(content) as AiQuestion[];
      
      // Validate the structure
      if (!Array.isArray(questions)) {
        throw new Error('Invalid response format from OpenAI');
      }

      // If using RAG, validate and enrich citations
      if (params.useRAG && contextData.length > 0) {
        return questions.map(q => extractCitations(q, contextData) as AiQuestion);
      }

      return questions;
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw new Error('Det gick inte att generera frågor med AI just nu');
    }
  }

  private buildPrompt(params: AiParams): string {
    const questionTypes = {
      'multiple-choice': 'flervalsfrâgor',
      'free-text': 'fritextfrågor'
    };

    const difficulties = {
      'easy': 'lätt',
      'medium': 'medium',
      'hard': 'svår'
    };

    const typeText = questionTypes[params.type] || 'frågor';
    const difficultyText = difficulties[params.difficulty] || 'medium';

    let prompt = `Skapa ${params.count} ${typeText} för ${params.subject} på ${params.grade} nivå med ${difficultyText} svårighetsgrad.\n\n`;

    if (params.context) {
      prompt += `Kontext: ${params.context}\n\n`;
    }

    prompt += `Returnera svaret som en JSON-array med följande struktur:\n\n`;

    if (params.type === 'multiple-choice') {
      prompt += `För flervalsfrâgor:
{
  "kind": "multiple-choice",
  "prompt": "Frågan här",
  "choices": [
    {"text": "Alternativ 1", "correct": false},
    {"text": "Alternativ 2", "correct": true},
    {"text": "Alternativ 3", "correct": false},
    {"text": "Alternativ 4", "correct": false}
  ]${params.useRAG ? ',\n  "citations": [{"sourceId": "käll-id", "span": "relevant text"}],\n  "explanation": "Förklaring av koppling till läroplanen"' : ''}
}`;
    } else {
      prompt += `För fritextfrågor:
{
  "kind": "free-text",
  "prompt": "Frågan här",
  "expectedAnswer": "Förväntat svar eller beskrivning"${params.useRAG ? ',\n  "citations": [{"sourceId": "käll-id", "span": "relevant text"}],\n  "explanation": "Förklaring av koppling till läroplanen"' : ''}
}`;
    }

    prompt += `\n\nRegler:
- Använd alltid svenska
- Frågor ska vara pedagogiska och åldersanpassade
- För flerval: ha alltid 4 alternativ med exakt 1 korrekt svar
- För fritext: ge en tydlig beskrivning av förväntat svar
- Gör frågorna engagerande och relevanta för ämnet`;

    if (params.useRAG) {
      prompt += `\n- Inkludera alltid "citations" med sourceId för källor som användes
- Lägg till "explanation" som förklarar kopplingen till läroplanen
- Om kontexten inte räcker: returnera {"insufficient_context": true}`;
    }

    prompt += `\n- Svara endast med JSON, inga förklaringar`;

    return prompt;
  }

  async suggestTitle(_params: { subject: string; grade: string; topics?: string[]; context?: string }): Promise<AiTitleSuggestion[]> {
    throw new Error('OpenAI title suggestions not yet implemented');
  }

  async simplifyText(_text: string, _targetGrade: string): Promise<AiTextSimplification> {
    throw new Error('OpenAI text simplification not yet implemented');
  }

  async varyDifficulty(_question: AiQuestion, _targetDifficulties: Array<'easy' | 'medium' | 'hard'>): Promise<AiDifficultyVariation> {
    throw new Error('OpenAI difficulty variation not yet implemented');
  }

  async improveClarity(_questionText: string, _questionType: 'multiple-choice' | 'free-text'): Promise<AiClarityImprovement> {
    throw new Error('OpenAI clarity improvement not yet implemented');
  }

  async generateAnswers(_questionText: string): Promise<AiAnswerGeneration> {
    throw new Error('OpenAI answer generation not yet implemented');
  }
}

export class AnthropicQuizProvider implements QuizAIProvider {
  name = 'Anthropic Claude';
  isAvailable = false; // Will be true when API key is configured

  async generateQuestions(_params: AiParams): Promise<AiQuestion[]> {
    throw new Error('Anthropic provider not yet implemented');
  }

  async suggestTitle(_params: { subject: string; grade: string; topics?: string[]; context?: string }): Promise<AiTitleSuggestion[]> {
    throw new Error('Anthropic title suggestions not yet implemented');
  }

  async simplifyText(_text: string, _targetGrade: string): Promise<AiTextSimplification> {
    throw new Error('Anthropic text simplification not yet implemented');
  }

  async varyDifficulty(_question: AiQuestion, _targetDifficulties: Array<'easy' | 'medium' | 'hard'>): Promise<AiDifficultyVariation> {
    throw new Error('Anthropic difficulty variation not yet implemented');
  }

  async improveClarity(_questionText: string, _questionType: 'multiple-choice' | 'free-text'): Promise<AiClarityImprovement> {
    throw new Error('Anthropic clarity improvement not yet implemented');
  }

  async generateAnswers(_questionText: string): Promise<AiAnswerGeneration> {
    throw new Error('Anthropic answer generation not yet implemented');
  }
}

// Provider factory and configuration
class QuizAIService {
  private providers: QuizAIProvider[] = [
    new MockQuizProvider(),
    new OpenAIQuizProvider(),
    new AnthropicQuizProvider()
  ];

  getAvailableProviders(): QuizAIProvider[] {
    return this.providers.filter(p => p.isAvailable);
  }

  getDefaultProvider(): QuizAIProvider {
    const available = this.getAvailableProviders();
    if (available.length === 0) {
      throw new Error('No AI providers available');
    }
    return available[0]; // Return first available (Mock in dev, configured provider in prod)
  }

  async generateQuestions(params: AiParams, providerId?: string): Promise<Question[]> {
    const provider = providerId 
      ? this.providers.find(p => p.name === providerId)
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    if (!provider.isAvailable) {
      throw new Error(`Provider ${provider.name} is not available`);
    }

    const aiQuestions = await provider.generateQuestions(params);
    
    // Convert AI questions to internal Question format
    return aiQuestions.map((aq, index) => {
      const baseQuestion = {
        id: `ai_${Date.now()}_${index}`,
        points: 1,
        timeLimit: undefined,
        rubric: undefined,
        citations: aq.citations ? aq.citations.map(c => ({
          sourceId: c.sourceId,
          sourceTitle: c.sourceTitle,
          sourceUrl: c.sourceUrl,
          license: c.license,
          span: c.span
        })) : undefined,
        explanation: aq.explanation
      };

      if (aq.kind === 'multiple-choice') {
        return {
          ...baseQuestion,
          type: 'multiple-choice' as const,
          title: aq.prompt,
          options: aq.choices.map(choice => ({
            id: choice.id,
            text: choice.text,
            isCorrect: choice.correct || false
          }))
        } as MultipleChoiceQuestion;
      } else {
        return {
          ...baseQuestion,
          type: 'free-text' as const,
          title: aq.prompt,
          expectedAnswer: aq.expectedAnswer,
          acceptedAnswers: [aq.expectedAnswer]
        } as FreeTextQuestion;
      }
    });
  }

  // New hint methods
  async suggestTitle(params: { subject: string; grade: string; topics?: string[]; context?: string }, providerId?: string): Promise<AiTitleSuggestion[]> {
    const provider = providerId 
      ? this.providers.find(p => p.name === providerId)
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    if (!provider.isAvailable) {
      throw new Error(`Provider ${provider.name} is not available`);
    }

    return await provider.suggestTitle(params);
  }

  async simplifyText(text: string, targetGrade: string, providerId?: string): Promise<AiTextSimplification> {
    const provider = providerId 
      ? this.providers.find(p => p.name === providerId)
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    if (!provider.isAvailable) {
      throw new Error(`Provider ${provider.name} is not available`);
    }

    return await provider.simplifyText(text, targetGrade);
  }

  async varyDifficulty(question: AiQuestion, targetDifficulties: Array<'easy' | 'medium' | 'hard'>, providerId?: string): Promise<AiDifficultyVariation> {
    const provider = providerId 
      ? this.providers.find(p => p.name === providerId)
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    if (!provider.isAvailable) {
      throw new Error(`Provider ${provider.name} is not available`);
    }

    return await provider.varyDifficulty(question, targetDifficulties);
  }

  async improveClarity(questionText: string, questionType: 'multiple-choice' | 'free-text', providerId?: string): Promise<AiClarityImprovement> {
    const provider = providerId 
      ? this.providers.find(p => p.name === providerId)
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    if (!provider.isAvailable) {
      throw new Error(`Provider ${provider.name} is not available`);
    }

    return await provider.improveClarity(questionText, questionType);
  }

  async generateAnswers(questionText: string, providerId?: string): Promise<AiAnswerGeneration> {
    const provider = providerId 
      ? this.providers.find(p => p.name === providerId)
      : this.getDefaultProvider();
    
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    if (!provider.isAvailable) {
      throw new Error(`Provider ${provider.name} is not available`);
    }

    return await provider.generateAnswers(questionText);
  }

  // Helper method to check if AI features are available
  get isAIAvailable(): boolean {
    // Check if we have any available providers
    const hasProviders = this.getAvailableProviders().length > 0
    
    // Check environment flag
    const isEnabled = process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED !== 'false'
    
    return hasProviders && isEnabled
  }

  // Helper method to get feature availability details
  getFeatureStatus(): { 
    available: boolean
    reason?: string
    providers: Array<{ name: string; available: boolean }>
  } {
    const providers = this.providers.map(p => ({ name: p.name, available: p.isAvailable }))
    const availableProviders = providers.filter(p => p.available)
    
    if (process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED === 'false') {
      return {
        available: false,
        reason: 'AI-funktioner är inaktiverade',
        providers
      }
    }
    
    if (availableProviders.length === 0) {
      return {
        available: false,
        reason: 'Inga AI-leverantörer är konfigurerade',
        providers
      }
    }
    
    return {
      available: true,
      providers
    }
  }
}

// Export singleton instance
export const quizAI = new QuizAIService();

// Swedish grade level mapping for the UI
export const GRADE_LEVELS = [
  { value: 'F', label: 'Förskola' },
  { value: 'Åk 1', label: 'Åk 1' },
  { value: 'Åk 2', label: 'Åk 2' },
  { value: 'Åk 3', label: 'Åk 3' },
  { value: 'Åk 4', label: 'Åk 4' },
  { value: 'Åk 5', label: 'Åk 5' },
  { value: 'Åk 6', label: 'Åk 6' },
  { value: 'Åk 7', label: 'Åk 7' },
  { value: 'Åk 8', label: 'Åk 8' },
  { value: 'Åk 9', label: 'Åk 9' },
  { value: 'Gy1', label: 'Gymnasium åk 1' },
  { value: 'Gy2', label: 'Gymnasium åk 2' },
  { value: 'Gy3', label: 'Gymnasium åk 3' }
] as const;

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Lätt' },
  { value: 'medium', label: 'Medel' },
  { value: 'hard', label: 'Svår' }
] as const;

export const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'Flervalsfråga' },
  { value: 'free-text', label: 'Fritext' }
] as const;