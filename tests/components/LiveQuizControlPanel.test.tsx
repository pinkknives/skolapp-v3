import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LiveQuizControlPanel } from '@/components/quiz/LiveQuizControlPanel'

// Mock the Ably hooks
vi.mock('@/hooks/useQuizControl', () => ({
  useQuizControl: () => ({
    state: { phase: 'idle' },
    participants: [],
    isConnected: false,
    studentCount: 0
  })
}))

vi.mock('@/hooks/useQuizAnswers', () => ({
  useQuizAnswers: () => ({
    getAnswerCountForQuestion: () => 0
  })
}))

// Mock the realtime functions
vi.mock('@/lib/realtime/quiz', () => ({
  startQuiz: vi.fn(),
  nextQuestion: vi.fn(),
  endQuiz: vi.fn(),
  joinRoom: vi.fn().mockResolvedValue(undefined)
}))

describe('LiveQuizControlPanel', () => {
  const mockProps = {
    quizId: 'test-quiz-123',
    questions: [
      { id: 'q1', title: 'Test fråga 1' },
      { id: 'q2', title: 'Test fråga 2' }
    ],
    teacherName: 'Test Lärare'
  }

  it('should render connection status', () => {
    render(<LiveQuizControlPanel {...mockProps} />)
    
    expect(screen.getByText('Ansluter till realtid...')).toBeInTheDocument()
    expect(screen.getByText('0 elever anslutna')).toBeInTheDocument()
  })

  it('should show start quiz button when in idle state', () => {
    render(<LiveQuizControlPanel {...mockProps} />)
    
    expect(screen.getByText('Starta quiz')).toBeInTheDocument()
  })

  it('should be accessible with proper ARIA labels', () => {
    render(<LiveQuizControlPanel {...mockProps} />)
    
    const startButton = screen.getByRole('button', { name: /starta quiz/i })
    expect(startButton).toBeInTheDocument()
    expect(startButton).toHaveAttribute('disabled')
  })
})