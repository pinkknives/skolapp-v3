export type PromptDifficulty = 'easy' | 'medium' | 'hard'

export interface PromptMeta {
  id: string
  subject: string
  grade: string
  title: string
  goal?: string
  variants: Record<PromptDifficulty, string>
}

export const PROMPT_LIBRARY: PromptMeta[] = [
  {
    id: 'math-fractions-åk5',
    subject: 'Matematik',
    grade: 'Åk 5',
    title: 'Bråk och procent',
    goal: 'Förstå sambandet mellan bråk, decimaltal och procent',
    variants: {
      easy: 'Skapa 5 korta frågor om enkla bråk (1/2, 1/3, 1/4) med vardagliga exempel.',
      medium: 'Skapa 8 frågor som kopplar bråk, decimaltal och procent i blandade problem.',
      hard: 'Skapa 10 utmanande frågor om jämförelser och omvandlingar mellan bråk, decimaltal och procent.'
    }
  },
  {
    id: 'sv-grammar-åk7',
    subject: 'Svenska',
    grade: 'Åk 7',
    title: 'Grammatik – satsdelar',
    variants: {
      easy: 'Skapa 5 frågor som tränar grundläggande satsdelar (subjekt, predikat).',
      medium: 'Skapa 8 frågor med korta meningar där eleven identifierar satsdelar.',
      hard: 'Skapa 10 frågor där eleven analyserar längre meningar och motiverar sina val.'
    }
  }
]
