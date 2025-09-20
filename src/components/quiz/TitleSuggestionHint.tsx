'use client'

import React, { useState } from 'react'
import { AIHintButton } from './AIHintButton'
import { DiffPreview } from './DiffPreview'
import { Typography } from '@/components/ui/Typography'
import { quizAI, AiTitleSuggestion } from '@/lib/ai/quizProvider'
import { aiAssistant } from '@/locales/sv/quiz'
import { Quiz } from '@/types/quiz'

interface TitleSuggestionHintProps {
  /** Current quiz data */
  quiz: Partial<Quiz>
  /** Callback to update quiz */
  onQuizUpdate: (updates: Partial<Quiz>) => void
  /** Selected subject for suggestions */
  subject?: string
  /** Selected grade level */
  gradeLevel?: string
  /** Additional topics */
  topics?: string[]
}

export function TitleSuggestionHint({
  quiz,
  onQuizUpdate,
  subject,
  gradeLevel,
  topics
}: TitleSuggestionHintProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<AiTitleSuggestion | null>(null)
  const [showDiff, setShowDiff] = useState(false)

  const canSuggest = subject && gradeLevel
  
  const handleSuggestTitle = async () => {
    if (!canSuggest) return

    setLoading(true)
    setError(null)

    try {
      const titleSuggestions = await quizAI.suggestTitle({
        subject: subject!,
        grade: gradeLevel!,
        topics,
        context: quiz.description
      })
      
      // Auto-select first suggestion for preview
      if (titleSuggestions.length > 0) {
        setSelectedSuggestion(titleSuggestions[0])
        setShowDiff(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : aiAssistant.hints.titleSuggestions.error)
    } finally {
      setLoading(false)
    }
  }

  const handleInsert = () => {
    if (!selectedSuggestion) return

    // Insert as additional content, preserving existing
    const currentTitle = quiz.title || ''
    const newTitle = currentTitle ? `${currentTitle} - ${selectedSuggestion.title}` : selectedSuggestion.title
    
    onQuizUpdate({
      title: newTitle,
      description: selectedSuggestion.description || quiz.description
    })

    setShowDiff(false)
    setSelectedSuggestion(null)
  }

  const handleReplace = () => {
    if (!selectedSuggestion) return

    onQuizUpdate({
      title: selectedSuggestion.title,
      description: selectedSuggestion.description || quiz.description
    })

    setShowDiff(false)
    setSelectedSuggestion(null)
  }

  const handleCancel = () => {
    setShowDiff(false)
    setSelectedSuggestion(null)
  }

  const buildDiffContent = () => {
    if (!selectedSuggestion) return { before: '', after: '', improvements: [] }

    const before = `Titel: ${quiz.title || '(ingen titel)'}\nBeskrivning: ${quiz.description || '(ingen beskrivning)'}`
    const after = `Titel: ${selectedSuggestion.title}\nBeskrivning: ${selectedSuggestion.description || quiz.description || '(ingen beskrivning)'}`
    
    const improvements = [
      'AI-genererad titel baserad på ämne och årskurs',
      selectedSuggestion.description ? 'Förbättrad beskrivning' : 'Behållen befintlig beskrivning',
      ...(selectedSuggestion.learningObjectives ? ['Föreslagna lärandemål tillgängliga'] : [])
    ]

    return { before, after, improvements }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <AIHintButton
          onClick={handleSuggestTitle}
          loading={loading}
          disabled={!canSuggest}
          ariaLabel={aiAssistant.hints.titleSuggestions.ariaLabel}
          tooltip={canSuggest ? aiAssistant.hints.titleSuggestions.tooltip : 'Välj ämne och årskurs först'}
        >
          {aiAssistant.hints.titleSuggestions.button}
        </AIHintButton>

        {loading && (
          <Typography variant="caption" className="text-neutral-500">
            {aiAssistant.hints.titleSuggestions.loading}
          </Typography>
        )}
      </div>

      {error && (
        <Typography variant="caption" className="text-error-600 mt-2">
          {error}
        </Typography>
      )}

      {/* Learning objectives preview */}
      {selectedSuggestion?.learningObjectives && !showDiff && (
        <div className="mt-3 p-3 bg-info-50 border border-info-200 rounded-lg">
          <Typography variant="body2" className="font-medium text-info-800 mb-2">
            Föreslagna lärandemål:
          </Typography>
          <ul className="space-y-1">
            {selectedSuggestion.learningObjectives.map((objective, index) => (
              <li key={index} className="text-sm text-info-700">
                • {objective}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Diff Preview Modal */}
      {showDiff && selectedSuggestion && (
        <DiffPreview
          title={aiAssistant.hints.titleSuggestions.diffTitle}
          description={aiAssistant.hints.titleSuggestions.diffDescription}
          {...buildDiffContent()}
          onInsert={handleInsert}
          onReplace={handleReplace}
          onCancel={handleCancel}
          loading={loading}
        />
      )}
    </>
  )
}

export default TitleSuggestionHint