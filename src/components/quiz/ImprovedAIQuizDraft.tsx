'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Question, MultipleChoiceQuestion, FreeTextQuestion, ImageQuestion } from '@/types/quiz'
import { quizAI, AiParams, GRADE_LEVELS, DIFFICULTY_LEVELS, QUESTION_TYPES } from '@/lib/ai/quizProvider'
import { aiAssistant } from '@/locales/sv/quiz'
import { Plus, AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react'
import { track } from '@/lib/telemetry'

interface ImprovedAIQuizDraftProps {
  quizTitle?: string
  onQuestionsGenerated: (questions: Question[]) => void
  onClose: () => void
}

interface QuestionEditFormProps {
  question: Question
  onSave: (question: Question) => void
  onCancel: () => void
}

function QuestionEditForm({ question, onSave, onCancel }: QuestionEditFormProps) {
  const [title, setTitle] = useState(question.title)
  const [options, setOptions] = useState(
    question.type === 'multiple-choice' ? question.options || [] : 
    question.type === 'image' ? question.options || [] : []
  )
  const [expectedAnswer, setExpectedAnswer] = useState(
    question.type === 'free-text' ? question.expectedAnswer || '' : ''
  )
  const [imageAlt, setImageAlt] = useState(
    question.type === 'image' ? question.imageAlt || '' : ''
  )

  const handleSave = () => {    
    switch (question.type) {
      case 'multiple-choice':
        onSave({
          ...question,
          title,
          options
        } as MultipleChoiceQuestion)
        break
      
      case 'free-text':
        onSave({
          ...question,
          title,
          expectedAnswer: expectedAnswer || undefined,
          acceptedAnswers: expectedAnswer ? [expectedAnswer] : undefined
        } as FreeTextQuestion)
        break
      
      case 'image':
        onSave({
          ...question,
          title,
          imageAlt: imageAlt || undefined,
          options: options.length > 0 ? options : undefined
        } as ImageQuestion)
        break
    }
  }

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], text }
    setOptions(newOptions)
  }

  const toggleCorrectAnswer = (index: number) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }))
    setOptions(newOptions)
  }

  const addOption = () => {
    const newOption = {
      id: `option-${Date.now()}-${options.length + 1}`,
      text: '',
      isCorrect: false
    }
    setOptions([...options, newOption])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) { // Keep at least 2 options
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-4 bg-white p-4 border rounded-lg">
      <Input
        label="Frågetext"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Skriv din fråga här..."
      />
      
      {question.type === 'multiple-choice' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Typography variant="body2" className="font-medium">Svarsalternativ</Typography>
            <Button onClick={addOption} size="sm" variant="outline" className="gap-x-1">
              <Plus size={12} strokeWidth={2} />
              Lägg till
            </Button>
          </div>
          {options.map((option, index) => (
            <div key={option.id} className="flex gap-2 items-center">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={option.isCorrect}
                onChange={() => toggleCorrectAnswer(index)}
                className="h-4 w-4 text-primary-600"
                aria-label={`Markera alternativ ${index + 1} som korrekt`}
              />
              <Input
                value={option.text}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Alternativ ${index + 1}`}
                className="flex-1"
              />
              {options.length > 2 && (
                <Button
                  onClick={() => removeOption(index)}
                  size="sm"
                  variant="outline"
                  className="text-error-600 hover:text-error-700"
                  aria-label={`Ta bort alternativ ${index + 1}`}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {question.type === 'free-text' && (
        <div className="space-y-2">
          <Input
            label="Förväntat svar (valfritt)"
            value={expectedAnswer}
            onChange={(e) => setExpectedAnswer(e.target.value)}
            placeholder="Exempel på korrekt svar..."
          />
          <Typography variant="caption" className="text-neutral-500">
            Detta hjälper AI-bedömning att ge bättre förslag
          </Typography>
        </div>
      )}

      {question.type === 'image' && (
        <div className="space-y-3">
          <Input
            label="Bildbeskrivning"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="Beskriv bilden för tillgänglighet..."
          />
          <Typography variant="caption" className="text-neutral-500">
            Bilden skulle genereras av AI. Lägg till svarsalternativ om det behövs.
          </Typography>
          
          {/* Options for image questions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Typography variant="body2" className="font-medium">Svarsalternativ (valfritt)</Typography>
              <Button onClick={addOption} size="sm" variant="outline">
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Lägg till
              </Button>
            </div>
            {options.map((option, index) => (
              <div key={option.id} className="flex gap-2 items-center">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={option.isCorrect}
                  onChange={() => toggleCorrectAnswer(index)}
                  className="h-4 w-4 text-primary-600"
                  aria-label={`Markera alternativ ${index + 1} som korrekt`}
                />
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Alternativ ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  onClick={() => removeOption(index)}
                  size="sm"
                  variant="outline"
                  className="text-error-600 hover:text-error-700"
                  aria-label={`Ta bort alternativ ${index + 1}`}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-2 pt-2 border-t">
        <Button onClick={handleSave} size="sm" disabled={!title.trim()}>
          Spara
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Avbryt
        </Button>
      </div>
    </div>
  )
}

interface AIFormData {
  subject: string
  grade: string
  count: number
  type: 'multiple-choice' | 'free-text'
  difficulty: 'easy' | 'medium' | 'hard'
  topics: string
  context: string
}

type PendingAction = { action: 'improve' | 'simplify' | 'distractors' | 'regenerate'; question: Question; index: number }

export function ImprovedAIQuizDraft({ quizTitle, onQuestionsGenerated, onClose, variant = 'panel' as 'panel' | 'sheet', pendingAction, onReplaceQuestion, onClearPending, batchMode = null as 'replace' | 'add' | null, onSetBatchMode, onBatchReplace }: ImprovedAIQuizDraftProps & { variant?: 'panel' | 'sheet'; pendingAction?: PendingAction | null; onReplaceQuestion?: (index: number, updated: Question) => void; onClearPending?: () => void; batchMode?: 'replace' | 'add' | null; onSetBatchMode?: (m: 'replace' | 'add' | null) => void; onBatchReplace?: (qs: Question[]) => void }) {
  const [isPanelOpen, setIsPanelOpen] = React.useState(true)
  React.useEffect(() => {
    try {
      const w = window.innerWidth
      if (w >= 640 && w < 1024) setIsPanelOpen(false)
      else setIsPanelOpen(true)
    } catch {}
  }, [])
  const [step, setStep] = useState<'form' | 'generating' | 'preview' | 'error'>('form')
  const [formData, setFormData] = useState<AIFormData>({
    subject: '',
    grade: '',
    count: 5,
    difficulty: 'medium',
    type: 'multiple-choice',
    topics: '',
    context: quizTitle || ''
  })
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [errorDetails, setErrorDetails] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [liveText, setLiveText] = useState<string>('')
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLSelectElement>(null)
  const prevFocusRef = useRef<Element | null>(null)

  // Draft persistence keys
  const draftKey = React.useMemo(() => {
    const base = (quizTitle || 'untitled').toString().slice(0, 50)
    return `sk_ai_panel_draft_${base}`
  }, [quizTitle])

  // Save draft helper
  const saveDraft = React.useCallback(() => {
    try {
      const payload = {
        formData,
        step,
        generatedQuestions,
        selectedIds: Array.from(selectedQuestions),
      }
      localStorage.setItem(draftKey, JSON.stringify(payload))
    } catch {}
  }, [draftKey, formData, step, generatedQuestions, selectedQuestions])

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as {
        formData?: AIFormData
        step?: typeof step
        generatedQuestions?: Question[]
        selectedIds?: string[]
      }
      if (parsed.formData) setFormData(parsed.formData)
      if (parsed.generatedQuestions && Array.isArray(parsed.generatedQuestions)) {
        setGeneratedQuestions(parsed.generatedQuestions)
        setSelectedQuestions(new Set(parsed.selectedIds || []))
      }
      if (parsed.step === 'preview' || parsed.step === 'form') setStep(parsed.step)
    } catch {}
  }, [draftKey])

  // Auto-save draft on relevant changes
  useEffect(() => {
    saveDraft()
  }, [saveDraft])

  // Focus management for accessibility
  useEffect(() => {
    // capture previously focused element before moving focus
    try { prevFocusRef.current = document.activeElement } catch {}
    if (modalRef.current) {
      modalRef.current.focus()
    }
    // Focus first field after a short delay to ensure modal is rendered
    const timer = setTimeout(() => {
      if (firstFieldRef.current) {
        firstFieldRef.current.focus()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        // try to restore focus to FAB or previous focus target
        try {
          const fab = document.querySelector('[data-ai-fab="true"]') as HTMLElement | null
          if (fab) fab.focus()
          else (prevFocusRef.current as HTMLElement | null)?.focus?.()
        } catch {}
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [onClose])

  // Load saved draft from localStorage (removed to simplify implementation)

  const handleGenerate = async () => {
    setStep('generating')
    setErrorMessage('')
    setErrorDetails('')
    track('ai_panel_generate', { subject: formData.subject, grade: formData.grade, type: formData.type, count: formData.count })
    
    try {
      // Prepare AI parameters according to the interface specification
      const aiParams: AiParams = {
        subject: formData.subject,
        grade: formData.grade,
        count: formData.count,
        type: formData.type,
        difficulty: formData.difficulty,
        topics: formData.topics ? formData.topics.split(',').map(t => t.trim()).filter(t => t.length > 0) : undefined,
        context: formData.context || undefined,
        locale: 'sv-SE'
      }

      // Use the new AI provider
      const questions = await quizAI.generateQuestions(aiParams)
      
      setGeneratedQuestions(questions)
      setSelectedQuestions(new Set(questions.map(q => q.id)))
      setStep('preview')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Ett oväntat fel uppstod'
      setErrorMessage('Kunde inte generera frågor just nu.')
      setErrorDetails(`Teknisk information: ${errorMsg}`)
      setStep('error')
    }
  }

  // If a pending per-question action exists, auto-trigger a focused generation and keep only first result for replacement UX
  useEffect(() => {
    const run = async () => {
      if (!pendingAction) return
      try {
        setStep('generating')
        const aiParams: AiParams = {
          subject: formData.subject || 'Allmänt',
          grade: formData.grade || 'Åk 7',
          count: 1,
          type: formData.type,
          difficulty: formData.difficulty,
          topics: formData.topics ? formData.topics.split(',').map(t => t.trim()).filter(Boolean) : undefined,
          context: formData.context || undefined,
          locale: 'sv-SE'
        }
        // Reuse normal generation for now; API consolidates in C3 server
        const qs = await quizAI.generateQuestions(aiParams)
        setGeneratedQuestions(qs)
        setSelectedQuestions(new Set(qs.slice(0, 1).map(q => q.id)))
        setStep('preview')
      } catch (e) {
        setErrorMessage('Kunde inte generera förslag just nu.')
        setErrorDetails(e instanceof Error ? e.message : String(e))
        setStep('error')
      }
    }
    run()
  }, [
    pendingAction,
    formData.subject,
    formData.grade,
    formData.type,
    formData.difficulty,
    formData.topics,
    formData.context
  ])

  const handleAcceptQuestions = () => {
    const questionsToAdd = generatedQuestions.filter(q => selectedQuestions.has(q.id))
    if (questionsToAdd.length === 0) return
    onQuestionsGenerated(questionsToAdd)
    setLiveText(`${questionsToAdd.length} frågor infogade`)
    track('ai_panel_add_selected', { count: questionsToAdd.length })
    // Clear draft after successful import
    try { localStorage.removeItem(draftKey) } catch {}
    // restore focus to FAB or previous
    try {
      const fab = document.querySelector('[data-ai-fab="true"]') as HTMLElement | null
      if (fab) fab.focus()
      else (prevFocusRef.current as HTMLElement | null)?.focus?.()
    } catch {}
    // Close modal after adding to make the update visible immediately
    onClose()
  }

  const handleReplaceActiveQuestion = () => {
    if (!pendingAction || !onReplaceQuestion) return
    const selected = generatedQuestions.filter(q => selectedQuestions.has(q.id))
    const chosen = selected[0] || generatedQuestions[0]
    if (!chosen) return
    onReplaceQuestion(pendingAction.index, chosen)
    setLiveText('Fråga uppdaterad')
    track('ai_question_replace', { index: pendingAction.index })
    if (onClearPending) onClearPending()
  }

  const handleBatchReplaceSelected = () => {
    if (!onBatchReplace) return
    const selected = generatedQuestions.filter(q => selectedQuestions.has(q.id))
    if (selected.length === 0) return
    onBatchReplace(selected)
    track('ai_batch_apply', { count: selected.length, mode: 'replace' })
    if (onSetBatchMode) onSetBatchMode(null)
  }

  const toggleQuestionSelection = (questionId: string) => {
    const newSelection = new Set(selectedQuestions)
    if (newSelection.has(questionId)) {
      newSelection.delete(questionId)
    } else {
      newSelection.add(questionId)
    }
    setSelectedQuestions(newSelection)
  }

  const selectAllQuestions = () => {
    setSelectedQuestions(new Set(generatedQuestions.map(q => q.id)))
  }

  const deselectAllQuestions = () => {
    setSelectedQuestions(new Set())
  }

  const editQuestion = (questionId: string, updatedQuestion: Question) => {
    setGeneratedQuestions(prev => 
      prev.map(q => q.id === questionId ? updatedQuestion : q)
    )
    setEditingQuestion(null)
  }

  const deleteQuestion = (questionId: string) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId))
    setSelectedQuestions(prev => {
      const newSet = new Set(prev)
      newSet.delete(questionId)
      return newSet
    })
  }

  const retryGeneration = () => {
    setStep('form')
    setErrorMessage('')
    setErrorDetails('')
  }

  const copyErrorDetails = async () => {
    try {
      await navigator.clipboard.writeText(errorDetails)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = errorDetails
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const isFormValid = formData.subject && formData.grade && formData.count > 0

  // Wrapper render function to support panel vs sheet/modal variants
  const renderCard = () => (
    <Card className="border-0">
          <div aria-live="polite" role="status" className="sr-only" data-testid="ai-live-region">{liveText}</div>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <CardTitle id="ai-modal-title" className="text-xl">{aiAssistant.modal.title}</CardTitle>
                  <Typography variant="caption" className="text-neutral-600" id="ai-modal-description">
                    {aiAssistant.modal.description}
                  </Typography>
              {batchMode && (
                <div className="mt-1 text-xs text-primary-700">Batch-läge: {batchMode === 'replace' ? 'Ersätt' : 'Lägg till'}</div>
              )}
                </div>
              </div>
          <div className="flex items-center gap-2">
            {onSetBatchMode && (
              <>
                <Button variant="outline" size="sm" onClick={() => onSetBatchMode('replace')}>Batch: ersätt</Button>
                <Button variant="outline" size="sm" onClick={() => onSetBatchMode('add')}>Batch: lägg till</Button>
              </>
            )}
            <Button 
                variant="outline" 
                size="sm" 
                onClick={onClose}
                aria-label={aiAssistant.modal.closeLabel}
                data-testid="ai-modal-close"
          >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
          </Button>
          </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* AI Disclaimer */}
            <div id="ai-disclaimer" className="bg-warning-50 border border-warning-200 rounded-lg p-4" data-testid="ai-disclaimer">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                <div>
                  <Typography variant="body2" className="font-semibold text-warning-800 mb-1">
                    {aiAssistant.disclaimer.title}
                  </Typography>
                  <Typography variant="caption" className="text-warning-700">
                    {aiAssistant.disclaimer.description}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Step content */}
            {step === 'form' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Subject */}
                  <div>
                    <Typography variant="body2" className="font-medium mb-2">
                      {aiAssistant.form.subject.label} <span className="text-error-500">*</span>
                    </Typography>
                    <select
                      ref={firstFieldRef}
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      aria-required="true"
                      aria-describedby="subject-help"
                      data-testid="ai-subject-select"
                    >
                      <option value="">{aiAssistant.form.subject.placeholder}</option>
                      {aiAssistant.subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                    <Typography variant="caption" className="text-neutral-500 mt-1" id="subject-help">
                      {aiAssistant.form.subject.help}
                    </Typography>
                  </div>

                  {/* Grade Level */}
                  <div>
                    <Typography variant="body2" className="font-medium mb-2">
                      {aiAssistant.form.grade.label} <span className="text-error-500">*</span>
                    </Typography>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      aria-required="true"
                      aria-describedby="grade-help"
                      data-testid="ai-grade-select"
                    >
                      <option value="">{aiAssistant.form.grade.placeholder}</option>
                      {GRADE_LEVELS.map((grade) => (
                        <option key={grade.value} value={grade.value}>{grade.label}</option>
                      ))}
                    </select>
                    <Typography variant="caption" className="text-neutral-500 mt-1" id="grade-help">
                      {aiAssistant.form.grade.help}
                    </Typography>
                  </div>

                  {/* Question Count */}
                  <div>
                    <Typography variant="body2" className="font-medium mb-2">
                      {aiAssistant.form.count.label}
                    </Typography>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.count}
                      onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) || 5 }))}
                      aria-describedby="count-help"
                    />
                    <Typography variant="caption" className="text-neutral-500 mt-1" id="count-help">
                      {aiAssistant.form.count.help}
                    </Typography>
                  </div>

                  {/* Question Type */}
                  <div>
                    <Typography variant="body2" className="font-medium mb-2">
                      {aiAssistant.form.type.label}
                    </Typography>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'multiple-choice' | 'free-text' }))}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      aria-describedby="type-help"
                    >
                      {QUESTION_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <Typography variant="caption" className="text-neutral-500 mt-1" id="type-help">
                      {aiAssistant.form.type.help}
                    </Typography>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Difficulty */}
                  <div>
                    <Typography variant="body2" className="font-medium mb-2">
                      {aiAssistant.form.difficulty.label}
                    </Typography>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      aria-describedby="difficulty-help"
                    >
                      {DIFFICULTY_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                    <Typography variant="caption" className="text-neutral-500 mt-1" id="difficulty-help">
                      {aiAssistant.form.difficulty.help}
                    </Typography>
                  </div>
                </div>

                {/* Topics */}
                <div>
                  <Typography variant="body2" className="font-medium mb-2">
                    {aiAssistant.form.topics.label}
                  </Typography>
                  <Input
                    placeholder={aiAssistant.form.topics.placeholder}
                    value={formData.topics}
                    onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
                    aria-describedby="topics-help"
                  />
                  <Typography variant="caption" className="text-neutral-500 mt-1" id="topics-help">
                    {aiAssistant.form.topics.help}
                  </Typography>
                </div>

                {/* Context */}
                <div>
                  <Typography variant="body2" className="font-medium mb-2">
                    {aiAssistant.form.context.label}
                  </Typography>
                  <Textarea
                    rows={3}
                    placeholder={aiAssistant.form.context.placeholder}
                    value={formData.context}
                    onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                    aria-describedby="context-help"
                  />
                  <Typography variant="caption" className="text-neutral-500 mt-1" id="context-help">
                    {aiAssistant.form.context.help}
                  </Typography>
                </div>
              </div>
            )}

            {step === 'generating' && (
              <div className="text-center py-12" data-testid="ai-quiz-status">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <Typography variant="h6" className="mb-2">
                  {aiAssistant.states.generating.replace('{count}', formData.count.toString())}
                </Typography>
                <Typography variant="body2" className="text-neutral-600">
                  {aiAssistant.states.generatingDescription
                    .replace('{subject}', formData.subject)
                    .replace('{grade}', formData.grade)
                  }
                </Typography>

                {/* Skeleton preview placeholders for better perceived performance */}
                <div className="mt-8 space-y-3 max-w-md mx-auto text-left">
                  {[0,1,2].map((i) => (
                    <div key={i} className="border border-neutral-200 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-neutral-200 rounded w-2/3 mb-3" />
                      <div className="space-y-2">
                        <div className="h-3 bg-neutral-200 rounded w-full" />
                        <div className="h-3 bg-neutral-200 rounded w-5/6" />
                        <div className="h-3 bg-neutral-200 rounded w-4/6" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'error' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-error-600" />
                </div>
                <Typography variant="h6" className="mb-2 text-error-800">
                  {aiAssistant.states.errorTitle}
                </Typography>
                <Typography variant="body2" className="text-neutral-600 mb-4">
                  {errorMessage}
                </Typography>
                
                {errorDetails && (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-4 text-left max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-2">
                      <Typography variant="body2" className="font-medium text-neutral-800">
                        {aiAssistant.states.errorTechnical}
                      </Typography>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyErrorDetails}
                        className="gap-1 h-8 px-2"
                        aria-label={aiAssistant.actions.copyError}
                      >
                        {copySuccess ? (
                          <>
                            <Check className="h-3 w-3" />
                            {aiAssistant.states.copied}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            {aiAssistant.actions.copyError}
                          </>
                        )}
                      </Button>
                    </div>
                    <Typography variant="caption" className="text-neutral-600 font-mono">
                      {errorDetails}
                    </Typography>
                  </div>
                )}
                
                <div className="flex gap-3 justify-center">
                  <Button onClick={retryGeneration} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    {aiAssistant.actions.tryAgain}
                  </Button>
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-4" data-testid="ai-quiz-result">
                <div className="flex items-center justify-between">
                  <Typography variant="h6">
                    {aiAssistant.states.previewTitle.replace('{count}', generatedQuestions.length.toString())}
                  </Typography>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={selectAllQuestions}
                      disabled={selectedQuestions.size === generatedQuestions.length}
                      data-testid="ai-select-all-questions"
                    >
                      {aiAssistant.actions.selectAll}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={deselectAllQuestions}
                      disabled={selectedQuestions.size === 0}
                    >
                      {aiAssistant.actions.selectNone}
                    </Button>
                  </div>
                </div>

                <Typography variant="caption" className="text-neutral-500 block">
                  {aiAssistant.states.previewDescription}
                </Typography>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generatedQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`p-4 border rounded-lg transition-all ${
                        selectedQuestions.has(question.id)
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      data-testid="ai-quiz-question"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.has(question.id)}
                            onChange={() => toggleQuestionSelection(question.id)}
                            className="h-4 w-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                            aria-label={`Välj fråga ${index + 1}`}
                          />
                        </div>
                        <div className="flex-1">
                          {editingQuestion === question.id ? (
                            <QuestionEditForm
                              question={question}
                              onSave={(updatedQuestion) => editQuestion(question.id, updatedQuestion)}
                              onCancel={() => setEditingQuestion(null)}
                            />
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <Typography variant="body2" className="font-medium">
                                  {index + 1}. {question.title}
                                </Typography>
                                <span className={`text-xs px-2 py-1 rounded-full border ${
                                  question.type === 'multiple-choice' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  question.type === 'free-text' ? 'bg-green-50 text-green-700 border-green-200' :
                                  'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                  {question.type === 'multiple-choice' ? 'Flervalsfråga' :
                                   question.type === 'free-text' ? 'Fritext' : 'Bild'}
                                </span>
                              </div>
                              
                              {question.type === 'multiple-choice' && question.options && (
                                <div className="space-y-1 mb-3">
                                  {question.options.map((option) => (
                                    <div key={option.id} className="flex items-center gap-2">
                                      <span className={`text-sm ${option.isCorrect ? 'text-success-600 dark:text-success-400 font-medium' : 'text-neutral-600 dark:text-neutral-300'}`}>
                                        {option.isCorrect && '✓'} {option.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {question.type === 'free-text' && (
                                <div className="mb-3">
                                  <Typography variant="caption" className="text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 px-2 py-1 rounded">
                                    Fritextsvar: {question.expectedAnswer || 'Öppet svar'}
                                  </Typography>
                                </div>
                              )}

                              {question.type === 'image' && (
                                <div className="mb-3 space-y-2">
                                  <div className="bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
                                    <svg className="h-8 w-8 mx-auto mb-2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <Typography variant="caption" className="text-neutral-500">
                                      {question.imageAlt || 'AI-genererad bild skulle visas här'}
                                    </Typography>
                                  </div>
                                  {question.options && question.options.length > 0 && (
                                    <div className="space-y-1">
                                      {question.options.map((option) => (
                                        <div key={option.id} className="flex items-center gap-2">
                                          <span className={`text-sm ${option.isCorrect ? 'text-success-600 font-medium' : 'text-neutral-600'}`}>
                                            {option.isCorrect && '✓'} {option.text}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingQuestion(question.id)
                                  }}
                                  aria-label={`${aiAssistant.actions.edit} fråga ${index + 1}`}
                                >
                                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  {aiAssistant.actions.edit}
                                </Button>
                                {/* Feedback controls */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                      await fetch('/api/ai/feedback', {
                                        method: 'POST',
                                        headers: { 'content-type': 'application/json' },
                                        body: JSON.stringify({ rating: 1, question_title: question.title })
                                      })
                                      track('ai_feedback.submit', { rating: 1, hasComment: false })
                                    } catch {}
                                  }}
                                  aria-label="Gilla förslag"
                                >
                                  👍
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                      await fetch('/api/ai/feedback', {
                                        method: 'POST',
                                        headers: { 'content-type': 'application/json' },
                                        body: JSON.stringify({ rating: -1, question_title: question.title })
                                      })
                                      track('ai_feedback.submit', { rating: -1, hasComment: false })
                                    } catch {}
                                  }}
                                  aria-label="Ogilla förslag"
                                >
                                  👎
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteQuestion(question.id)
                                  }}
                                  className="text-error-600 hover:text-error-700 hover:border-error-300"
                                  aria-label={`${aiAssistant.actions.delete} fråga ${index + 1}`}
                                >
                                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  {aiAssistant.actions.delete}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <Typography variant="body2" className="text-primary-800">
                    {aiAssistant.states.selectedCount
                      .replace('{selected}', selectedQuestions.size.toString())
                      .replace('{total}', generatedQuestions.length.toString())
                    }
                  </Typography>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Avbryt
            </Button>

            <div className="flex gap-3">
              {step === 'form' && (
                <Button
                  onClick={handleGenerate}
                  disabled={!isFormValid}
                  className="bg-primary-600 hover:bg-primary-700"
                  aria-describedby="ai-disclaimer"
                  data-testid="ai-quiz-start"
                >
                  {aiAssistant.actions.generate}
                </Button>
              )}

              {step === 'error' && (
                <Button
                  onClick={retryGeneration}
                  className="bg-primary-600 hover:bg-primary-700 gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {aiAssistant.actions.tryAgain}
                </Button>
              )}

              {step === 'preview' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep('form')
                      setGeneratedQuestions([])
                      setSelectedQuestions(new Set())
                    }}
                  >
                    {aiAssistant.actions.generateNew}
                  </Button>
                  <Button
                    onClick={handleAcceptQuestions}
                    disabled={selectedQuestions.size === 0}
                    className="bg-success-600 hover:bg-success-700"
                    aria-label={`${aiAssistant.actions.addSelected} (${selectedQuestions.size})`}
                    data-testid="ai-import-questions"
                  >
                    {aiAssistant.actions.addSelected} ({selectedQuestions.size})
                  </Button>
                  {batchMode === 'replace' && onBatchReplace && (
                    <Button
                      onClick={handleBatchReplaceSelected}
                      disabled={selectedQuestions.size === 0}
                      className="bg-danger-600 hover:bg-danger-700"
                      aria-label="Ersätt valda"
                    >
                      Ersätt valda
                    </Button>
                  )}
                  {pendingAction && onReplaceQuestion && (
                    <Button
                      onClick={handleReplaceActiveQuestion}
                      disabled={generatedQuestions.length === 0}
                      className="bg-primary-600 hover:bg-primary-700"
                      aria-label="Ersätt aktiv fråga"
                    >
                      Ersätt aktiv
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardFooter>
    </Card>
  )

  if (variant === 'panel') {
    return (
      <aside aria-label="AI-hjälp" className="sticky top-20" data-state={isPanelOpen ? 'open' : 'closed'}>
        {/* Sticky side tab for tablet to toggle open/closed */}
        <button
          type="button"
          onClick={() => setIsPanelOpen((v) => !v)}
          className="hidden md:block lg:hidden sticky top-20 -ml-2 mb-2 text-xs rounded-r bg-primary-600 text-white px-2 py-1"
          aria-expanded={isPanelOpen}
          aria-controls="ai-panel-content"
        >
          {isPanelOpen ? 'Stäng AI' : 'AI'}
        </button>
        {isPanelOpen && (
          <div id="ai-panel-content" ref={modalRef} className="max-h-[calc(100vh-8rem)] overflow-auto">
            {renderCard()}
          </div>
        )}
      </aside>
    )
  }

  // Default to previous modal behavior (sheet will be implemented in A2)
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 sm:hidden">
      <div className="bg-black/30" onClick={onClose} aria-hidden="true" />
      <div
        ref={modalRef}
        className="bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto p-2"
        role="dialog"
        aria-labelledby="ai-modal-title"
        aria-describedby="ai-modal-description ai-disclaimer"
        tabIndex={-1}
      >
        {renderCard()}
      </div>
    </div>
  )
}

export default ImprovedAIQuizDraft