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
};

export type AiChoice = { id: string; text: string; correct?: boolean };

export type AiQuestion =
  | { kind: 'multiple-choice'; prompt: string; choices: AiChoice[] }
  | { kind: 'free-text'; prompt: string; expectedAnswer: string };

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

    const prompt = this.buildPrompt(params);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Du är en svensk lärare som skapar quiz-frågor. Svara alltid på svenska och skapa innehåll som är pedagogiskt och åldersanpassat. VIKTIGT: Svara endast med giltigt JSON, inga förklaringar eller extra text.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      // Parse the JSON response
      const questions = JSON.parse(content) as AiQuestion[];
      
      // Validate the structure
      if (!Array.isArray(questions)) {
        throw new Error('Invalid response format from OpenAI');
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

    return `Skapa ${params.count} ${typeText} för ${params.subject} på ${params.grade} nivå med ${difficultyText} svårighetsgrad.

${params.context ? `Kontext: ${params.context}` : ''}

Returnera svaret som en JSON-array med följande struktur:

För flervalsfrâgor:
{
  "kind": "multiple-choice",
  "prompt": "Frågan här",
  "choices": [
    {"text": "Alternativ 1", "correct": false},
    {"text": "Alternativ 2", "correct": true},
    {"text": "Alternativ 3", "correct": false},
    {"text": "Alternativ 4", "correct": false}
  ]
}

För fritextfrågor:
{
  "kind": "free-text",
  "prompt": "Frågan här",
  "expectedAnswer": "Förväntat svar eller beskrivning"
}

Regler:
- Använd alltid svenska
- Frågor ska vara pedagogiska och åldersanpassade
- För flerval: ha alltid 4 alternativ med exakt 1 korrekt svar
- För fritext: ge en tydlig beskrivning av förväntat svar
- Gör frågorna engagerande och relevanta för ämnet
- Svara endast med JSON, inga förklaringar`;
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
        rubric: undefined
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
    return this.getAvailableProviders().length > 0;
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