'use client'

import React, { useState } from 'react'
import { AIHintButton } from './AIHintButton'
import { quizAI } from '@/lib/ai/quizProvider'
import { aiAssistant } from '@/locales/sv/quiz'
import { MultipleChoiceOption } from '@/types/quiz'

interface AnswerGenerationHintProps {
  /** Question text to generate answers for */
  questionText: string
  /** Current options (if any) */
  _currentOptions?: MultipleChoiceOption[]
  /** Callback when user accepts generated answers */
  onApply: (options: MultipleChoiceOption[]) => void
}

export function AnswerGenerationHint({
  questionText,
  _currentOptions = [],
  onApply
}: AnswerGenerationHintProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canGenerate = questionText.trim().length > 0

  const handleGenerate = async () => {
    if (!canGenerate) return

    setLoading(true)
    setError(null)

    try {
      const result = await quizAI.generateAnswers(questionText)
      
      // Convert AI generated choices to MultipleChoiceOption format
      const newOptions: MultipleChoiceOption[] = result.generatedChoices.map(choice => ({
        id: choice.id,
        text: choice.text,
        isCorrect: choice.correct || false
      }))

      // Apply immediately (since this is answer generation, user can always edit after)
      onApply(newOptions)
    } catch (err) {
      setError(err instanceof Error ? err.message : aiAssistant.hints.generateAnswers.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <AIHintButton
        onClick={handleGenerate}
        loading={loading}
        disabled={!canGenerate}
        ariaLabel={aiAssistant.hints.generateAnswers.ariaLabel}
        tooltip={canGenerate ? aiAssistant.hints.generateAnswers.tooltip : 'Skriv en fråga först'}
        size="sm"
        variant="ghost"
      >
        {aiAssistant.hints.generateAnswers.button}
      </AIHintButton>

      {error && (
        <div className="text-error-600 text-sm mt-1">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-neutral-500 text-sm mt-1">
          {aiAssistant.hints.generateAnswers.loading}
        </div>
      )}
    </div>
  )
}

export default AnswerGenerationHint