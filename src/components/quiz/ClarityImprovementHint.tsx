'use client'

import React, { useState } from 'react'
import { AIHintButton } from './AIHintButton'
import { DiffPreview } from './DiffPreview'
import { quizAI, AiClarityImprovement } from '@/lib/ai/quizProvider'
import { aiAssistant } from '@/locales/sv/quiz'

interface ClarityImprovementHintProps {
  /** Question text to improve */
  questionText: string
  /** Type of question */
  questionType: 'multiple-choice' | 'free-text'
  /** Callback when user accepts the improvement */
  onApply: (improvedText: string) => void
}

export function ClarityImprovementHint({
  questionText,
  questionType,
  onApply
}: ClarityImprovementHintProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [improvement, setImprovement] = useState<AiClarityImprovement | null>(null)
  const [showDiff, setShowDiff] = useState(false)

  const canImprove = questionText.trim().length > 0

  const handleImprove = async () => {
    if (!canImprove) return

    setLoading(true)
    setError(null)

    try {
      const result = await quizAI.improveClarity(questionText, questionType)
      setImprovement(result)
      setShowDiff(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : aiAssistant.hints.improveClarity.error)
    } finally {
      setLoading(false)
    }
  }

  const handleReplace = () => {
    if (improvement) {
      onApply(improvement.improved)
      setShowDiff(false)
      setImprovement(null)
    }
  }

  const handleCancel = () => {
    setShowDiff(false)
    setImprovement(null)
  }

  return (
    <>
      <AIHintButton
        onClick={handleImprove}
        loading={loading}
        disabled={!canImprove}
        ariaLabel={aiAssistant.hints.improveClarity.ariaLabel}
        tooltip={canImprove ? aiAssistant.hints.improveClarity.tooltip : 'Skriv en fråga först'}
        size="sm"
        variant="ghost"
      >
        {aiAssistant.hints.improveClarity.button}
      </AIHintButton>

      {error && (
        <div className="text-error-600 text-sm mt-1">
          {error}
        </div>
      )}

      {/* Diff Preview Modal */}
      {showDiff && improvement && (
        <DiffPreview
          title="Förbättrad fråga"
          description="Granska den förbättrade frågetexten innan du ersätter originalet"
          before={improvement.original}
          after={improvement.improved}
          improvements={improvement.improvements}
          onInsert={() => {}} // Not applicable for clarity improvement
          onReplace={handleReplace}
          onCancel={handleCancel}
          loading={loading}
        />
      )}
    </>
  )
}

export default ClarityImprovementHint