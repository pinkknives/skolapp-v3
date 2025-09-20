// AI Quiz Provider - Provider abstraction layer for quiz question generation
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

export interface QuizAIProvider {
  generateQuestions(params: AiParams): Promise<AiQuestion[]>;
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
}

// Future provider stubs - ready for real implementation
export class OpenAIQuizProvider implements QuizAIProvider {
  name = 'OpenAI GPT';
  isAvailable = false; // Will be true when API key is configured

  async generateQuestions(_params: AiParams): Promise<AiQuestion[]> {
    throw new Error('OpenAI provider not yet implemented');
  }
}

export class AnthropicQuizProvider implements QuizAIProvider {
  name = 'Anthropic Claude';
  isAvailable = false; // Will be true when API key is configured

  async generateQuestions(_params: AiParams): Promise<AiQuestion[]> {
    throw new Error('Anthropic provider not yet implemented');
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