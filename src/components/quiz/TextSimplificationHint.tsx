'use client'

import React, { useState } from 'react'
import { AIHintButton } from './AIHintButton'
import { DiffPreview } from './DiffPreview'
import { quizAI, AiTextSimplification } from '@/lib/ai/quizProvider'
import { aiAssistant } from '@/locales/sv/quiz'

interface TextSimplificationHintProps {
  /** Text to simplify */
  text: string
  /** Target grade level for simplification */
  targetGrade: string
  /** Callback when user accepts the simplification */
  onApply: (simplifiedText: string) => void
}

export function TextSimplificationHint({
  text,
  targetGrade,
  onApply
}: TextSimplificationHintProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [simplification, setSimplification] = useState<AiTextSimplification | null>(null)
  const [showDiff, setShowDiff] = useState(false)

  const canSimplify = text.trim().length > 0 && targetGrade

  const handleSimplify = async () => {
    if (!canSimplify) return

    setLoading(true)
    setError(null)

    try {
      const result = await quizAI.simplifyText(text, targetGrade)
      setSimplification(result)
      setShowDiff(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : aiAssistant.hints.simplifyText.error)
    } finally {
      setLoading(false)
    }
  }

  const handleReplace = () => {
    if (simplification) {
      onApply(simplification.simplified)
      setShowDiff(false)
      setSimplification(null)
    }
  }

  const handleCancel = () => {
    setShowDiff(false)
    setSimplification(null)
  }

  return (
    <>
      <AIHintButton
        onClick={handleSimplify}
        loading={loading}
        disabled={!canSimplify}
        ariaLabel={aiAssistant.hints.simplifyText.ariaLabel}
        tooltip={canSimplify ? aiAssistant.hints.simplifyText.tooltip : 'Skriv text och välj årskurs först'}
        size="sm"
        variant="ghost"
      >
        {aiAssistant.hints.simplifyText.button}
      </AIHintButton>

      {error && (
        <div className="text-error-600 text-sm mt-1">
          {error}
        </div>
      )}

      {/* Diff Preview Modal */}
      {showDiff && simplification && (
        <DiffPreview
          title="Förenklad text"
          description="Granska den förenklade texten innan du ersätter originalet"
          before={simplification.original}
          after={simplification.simplified}
          improvements={simplification.improvements}
          onInsert={() => {}} // Not applicable for text simplification
          onReplace={handleReplace}
          onCancel={handleCancel}
          loading={loading}
        />
      )}
    </>
  )
}

export default TextSimplificationHint