'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Question, MultipleChoiceQuestion, FreeTextQuestion, ImageQuestion } from '@/types/quiz'

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
  gradeLevel: string
  questionCount: number
  difficulty: string
  questionType: 'multiple-choice' | 'free-text' | 'image' | 'mixed'
  topics: string
  context: string
}

export function ImprovedAIQuizDraft({ quizTitle, onQuestionsGenerated, onClose }: ImprovedAIQuizDraftProps) {
  const [step, setStep] = useState<'form' | 'generating' | 'preview' | 'error'>('form')
  const [formData, setFormData] = useState<AIFormData>({
    subject: '',
    gradeLevel: '',
    questionCount: 5,
    difficulty: 'medel',
    questionType: 'multiple-choice',
    topics: '',
    context: quizTitle || ''
  })
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Load saved draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('ai-quiz-draft')
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        if (parsed.formData) setFormData(parsed.formData)
        if (parsed.generatedQuestions) {
          setGeneratedQuestions(parsed.generatedQuestions)
          setSelectedQuestions(new Set(parsed.selectedQuestions || []))
          if (parsed.generatedQuestions.length > 0) {
            setStep('preview')
          }
        }
      } catch {
        // Failed to load from localStorage, continue with empty draft
      }
    }
  }, [])

  // Save draft to localStorage
  useEffect(() => {
    const draftData = {
      formData,
      generatedQuestions,
      selectedQuestions: Array.from(selectedQuestions),
      timestamp: Date.now()
    }
    localStorage.setItem('ai-quiz-draft', JSON.stringify(draftData))
  }, [formData, generatedQuestions, selectedQuestions])

  const subjectOptions = [
    'Matematik', 'Svenska', 'Engelska', 'Naturkunskap', 'Biologi', 'Fysik', 'Kemi',
    'Historia', 'Geografi', 'Samhällskunskap', 'Teknik', 'Slöjd', 'Bild', 'Musik', 'Idrott och hälsa'
  ]

  const gradeLevels = [
    'Förskola', 'Åk 1', 'Åk 2', 'Åk 3', 'Åk 4', 'Åk 5', 'Åk 6',
    'Åk 7', 'Åk 8', 'Åk 9', 'Gymnasium åk 1', 'Gymnasium åk 2', 'Gymnasium åk 3'
  ]

  const handleGenerate = async () => {
    setStep('generating')
    setErrorMessage('')
    
    try {
      // Simulate AI generation with mock data
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional failures for demo
          if (Math.random() < 0.1) {
            reject(new Error('AI service temporarily unavailable'))
            return
          }
          
          const mockQuestions: Question[] = Array.from({ length: formData.questionCount }, (_, i) => {
            const questionNumber = i + 1
            let questionType: 'multiple-choice' | 'free-text' | 'image'
            
            // Determine question type based on selection
            if (formData.questionType === 'mixed') {
              const types: ('multiple-choice' | 'free-text' | 'image')[] = ['multiple-choice', 'free-text', 'image']
              questionType = types[i % types.length]
            } else {
              questionType = formData.questionType as 'multiple-choice' | 'free-text' | 'image'
            }

            const baseQuestion = {
              id: `ai-question-${Date.now()}-${questionNumber}`,
              type: questionType,
              title: `AI-genererad fråga ${questionNumber} om ${formData.subject.toLowerCase()}`,
              points: 1,
            }

            switch (questionType) {
              case 'multiple-choice':
                return {
                  ...baseQuestion,
                  type: 'multiple-choice' as const,
                  options: [
                    { id: `option-${i}-1`, text: 'Alternativ A', isCorrect: true },
                    { id: `option-${i}-2`, text: 'Alternativ B', isCorrect: false },
                    { id: `option-${i}-3`, text: 'Alternativ C', isCorrect: false },
                    { id: `option-${i}-4`, text: 'Alternativ D', isCorrect: false }
                  ]
                }
              
              case 'free-text':
                return {
                  ...baseQuestion,
                  type: 'free-text' as const,
                  expectedAnswer: `Exempelsvar för fråga ${questionNumber}`,
                  acceptedAnswers: [`Exempelsvar för fråga ${questionNumber}`, `Alternativt svar ${questionNumber}`]
                }
              
              case 'image':
                return {
                  ...baseQuestion,
                  type: 'image' as const,
                  imageUrl: undefined, // Would be generated by AI
                  imageAlt: `Bildfråga ${questionNumber}`,
                  options: [
                    { id: `img-option-${i}-1`, text: 'Alternativ A', isCorrect: true },
                    { id: `img-option-${i}-2`, text: 'Alternativ B', isCorrect: false },
                    { id: `img-option-${i}-3`, text: 'Alternativ C', isCorrect: false },
                    { id: `img-option-${i}-4`, text: 'Alternativ D', isCorrect: false }
                  ]
                }
              
              default:
                return {
                  ...baseQuestion,
                  type: 'multiple-choice' as const,
                  options: [
                    { id: `option-${i}-1`, text: 'Alternativ A', isCorrect: true },
                    { id: `option-${i}-2`, text: 'Alternativ B', isCorrect: false },
                    { id: `option-${i}-3`, text: 'Alternativ C', isCorrect: false },
                    { id: `option-${i}-4`, text: 'Alternativ D', isCorrect: false }
                  ]
                }
            }
          })
          
          resolve(mockQuestions)
        }, 2000)
      }).then((questions) => {
        setGeneratedQuestions(questions as Question[])
        setSelectedQuestions(new Set((questions as Question[]).map(q => q.id)))
        setStep('preview')
      })
    } catch {
      setErrorMessage('Kunde inte generera frågor just nu. Kontrollera din internetanslutning och försök igen.')
      setStep('error')
    }
  }

  const handleAcceptQuestions = () => {
    const questionsToAdd = generatedQuestions.filter(q => selectedQuestions.has(q.id))
    onQuestionsGenerated(questionsToAdd)
    // Clear the draft after successful addition
    localStorage.removeItem('ai-quiz-draft')
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
  }

  const isFormValid = formData.subject && formData.gradeLevel && formData.questionCount > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <Card className="border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl">AI Quiz-assistent</CardTitle>
                  <Typography variant="caption" className="text-neutral-600">
                    Generera frågor automatiskt baserat på dina inställningar
                  </Typography>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* AI Disclaimer */}
            <div id="ai-form-disclaimer" className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <Typography variant="body2" className="font-semibold text-warning-800 mb-1">
                    Dubbelkolla alltid innehållet. AI kan ha fel.
                  </Typography>
                  <Typography variant="caption" className="text-warning-700">
                    Granska frågorna noga innan du lägger till dem i ditt quiz. Se till att de passar din undervisning och elevernas nivå.
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
                      Ämne <span className="text-error-500">*</span>
                    </Typography>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Välj ämne</option>
                      {subjectOptions.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  {/* Grade Level */}
                  <div>
                    <Typography variant="body2" className="font-medium mb-2">
                      Årskurs <span className="text-error-500">*</span>
                    </Typography>
                    <select
                      value={formData.gradeLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Välj årskurs</option>
                      {gradeLevels.map((grade) => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>

                  {/* Question Count */}
                  <div>
                    <Typography variant="body2" className="font-medium mb-2">
                      Antal frågor
                    </Typography>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.questionCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 5 }))}
                    />
                  </div>

                  {/* Question Type */}
                  <div>
                    <Typography variant="body2" className="font-medium mb-2">
                      Frågetyp
                    </Typography>
                    <select
                      value={formData.questionType}
                      onChange={(e) => setFormData(prev => ({ ...prev, questionType: e.target.value as 'multiple-choice' | 'free-text' | 'image' | 'mixed' }))}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="multiple-choice">Flerval</option>
                      <option value="free-text">Fritext</option>
                      <option value="image">Bild</option>
                      <option value="mixed">Blandade typer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Difficulty */}
                  <div>
                    <Typography variant="body2" className="font-medium mb-2">
                      Svårighetsgrad
                    </Typography>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="lätt">Lätt</option>
                      <option value="medel">Medel</option>
                      <option value="svår">Svår</option>
                    </select>
                  </div>
                </div>

                {/* Topics */}
                <div>
                  <Typography variant="body2" className="font-medium mb-2">
                    Specifika ämnesområden (valfritt)
                  </Typography>
                  <Input
                    placeholder="t.ex. multiplikationstabeller, fraktioner, geometri"
                    value={formData.topics}
                    onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
                  />
                  <Typography variant="caption" className="text-neutral-500 mt-1">
                    Separera med kommatecken för att specificera vad frågorna ska fokusera på
                  </Typography>
                </div>

                {/* Context */}
                <div>
                  <Typography variant="body2" className="font-medium mb-2">
                    Extra kontext (valfritt)
                  </Typography>
                  <Textarea
                    rows={3}
                    placeholder="Beskriv eventuella speciella krav eller fokus för frågorna..."
                    value={formData.context}
                    onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {step === 'generating' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <Typography variant="h6" className="mb-2">
                  Genererar {formData.questionCount} frågor...
                </Typography>
                <Typography variant="body2" className="text-neutral-600">
                  AI:n skapar frågor baserat på {formData.subject} för {formData.gradeLevel}
                </Typography>
              </div>
            )}

            {step === 'error' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <Typography variant="h6" className="mb-2 text-error-800">
                  Något gick fel
                </Typography>
                <Typography variant="body2" className="text-neutral-600 mb-4">
                  {errorMessage}
                </Typography>
                <Button onClick={retryGeneration} variant="outline">
                  Försök igen
                </Button>
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography variant="h6">
                    AI-genererade frågor ({generatedQuestions.length})
                  </Typography>
                  <Typography variant="caption" className="text-neutral-500">
                    Välj vilka frågor du vill lägga till
                  </Typography>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generatedQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`p-4 border rounded-lg transition-all ${
                        selectedQuestions.has(question.id)
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.has(question.id)}
                            onChange={() => toggleQuestionSelection(question.id)}
                            className="h-4 w-4 text-primary-600 rounded"
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
                                  {question.type === 'multiple-choice' ? 'Flerval' :
                                   question.type === 'free-text' ? 'Fritext' : 'Bild'}
                                </span>
                              </div>
                              
                              {question.type === 'multiple-choice' && question.options && (
                                <div className="space-y-1 mb-3">
                                  {question.options.map((option) => (
                                    <div key={option.id} className="flex items-center gap-2">
                                      <span className={`text-sm ${option.isCorrect ? 'text-success-600 font-medium' : 'text-neutral-600'}`}>
                                        {option.isCorrect && '✓'} {option.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {question.type === 'free-text' && (
                                <div className="mb-3">
                                  <Typography variant="caption" className="text-neutral-600 bg-neutral-50 px-2 py-1 rounded">
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
                                  aria-label={`Redigera fråga ${index + 1}`}
                                >
                                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Redigera
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteQuestion(question.id)
                                  }}
                                  className="text-error-600 hover:text-error-700 hover:border-error-300"
                                  aria-label={`Ta bort fråga ${index + 1}`}
                                >
                                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Ta bort
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
                    {selectedQuestions.size} av {generatedQuestions.length} frågor valda
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
                  aria-describedby="ai-form-disclaimer"
                >
                  Generera frågor
                </Button>
              )}

              {step === 'error' && (
                <Button
                  onClick={retryGeneration}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Försök igen
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
                    Generera nya
                  </Button>
                  <Button
                    onClick={handleAcceptQuestions}
                    disabled={selectedQuestions.size === 0}
                    className="bg-success-600 hover:bg-success-700"
                  >
                    Lägg till {selectedQuestions.size} frågor
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default ImprovedAIQuizDraft