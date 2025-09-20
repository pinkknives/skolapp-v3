'use client'

import React, { useState, useTransition } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Question } from '@/types/quiz'
import { AIResultList } from './AIResultList'
import { generateAiQuestions, type GenerateQuizRequest } from '@/app/teacher/quiz/_actions'

interface AIPanelProps {
  onQuestionsGenerated: (questions: Question[]) => void
}

interface AIFormData {
  subject: string
  gradeLevel: string
  numberOfQuestions: number
  difficulty: 'easy' | 'medium' | 'hard'
  topics: string
  goals: string
}

export function AIPanel({ onQuestionsGenerated }: AIPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState<AIFormData>({
    subject: '',
    gradeLevel: '',
    numberOfQuestions: 5,
    difficulty: 'medium',
    topics: '',
    goals: ''
  })
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const subjectOptions = [
    'Matematik', 'Svenska', 'Engelska', 'Naturkunskap', 'Biologi', 'Fysik', 'Kemi',
    'Historia', 'Geografi', 'Samhällskunskap', 'Teknik', 'Slöjd', 'Bild', 'Musik', 'Idrott och hälsa'
  ]

  const gradeLevels = [
    'Förskola', 'Åk 1', 'Åk 2', 'Åk 3', 'Åk 4', 'Åk 5', 'Åk 6',
    'Åk 7', 'Åk 8', 'Åk 9', 'Gymnasium åk 1', 'Gymnasium åk 2', 'Gymnasium åk 3'
  ]

  const handleInputChange = (field: keyof AIFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrorMessage('')
  }

  const handleGenerate = () => {
    if (!formData.subject || !formData.gradeLevel) {
      setErrorMessage('Ämne och årskurs krävs för att generera frågor.')
      return
    }

    setIsGenerating(true)
    setErrorMessage('')

    const request: GenerateQuizRequest = {
      subject: formData.subject,
      gradeLevel: formData.gradeLevel,
      numberOfQuestions: formData.numberOfQuestions,
      difficulty: formData.difficulty,
      topics: formData.topics ? formData.topics.split(',').map(t => t.trim()).filter(t => t.length > 0) : undefined,
      goals: formData.goals || undefined
    }

    startTransition(async () => {
      try {
        const result = await generateAiQuestions(request)
        
        if (result.success && result.questions) {
          setGeneratedQuestions(result.questions)
          setSelectedQuestions(new Set(result.questions.map(q => q.id)))
        } else {
          setErrorMessage(result.error || 'Ett fel uppstod vid generering av frågor.')
        }
      } catch (error) {
        setErrorMessage('Ett oväntat fel uppstod. Försök igen.')
        console.error('AI generation error:', error)
      } finally {
        setIsGenerating(false)
      }
    })
  }

  const handleToggleSelect = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleEditQuestion = (question: Question) => {
    // TODO: Implement question editing modal
    console.log('Edit question:', question)
  }

  const handleRemoveQuestion = (questionId: string) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId))
    setSelectedQuestions(prev => {
      const newSet = new Set(prev)
      newSet.delete(questionId)
      return newSet
    })
  }

  const handleInsertSelected = () => {
    const questionsToInsert = generatedQuestions.filter(q => selectedQuestions.has(q.id))
    if (questionsToInsert.length > 0) {
      onQuestionsGenerated(questionsToInsert)
      // Clear generated questions after insertion
      setGeneratedQuestions([])
      setSelectedQuestions(new Set())
    }
  }

  const handleInsertAll = () => {
    if (generatedQuestions.length > 0) {
      onQuestionsGenerated(generatedQuestions)
      // Clear generated questions after insertion
      setGeneratedQuestions([])
      setSelectedQuestions(new Set())
    }
  }

  const isFormValid = formData.subject && formData.gradeLevel
  const isGenerateDisabled = !isFormValid || isGenerating || isPending
  const hasSelectedQuestions = selectedQuestions.size > 0
  const hasAllQuestions = generatedQuestions.length > 0

  return (
    <div className="space-y-6">
      {/* AI Disclaimer */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4" role="alert">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <Typography variant="body2" className="font-semibold text-warning-800 mb-1">
              Dubbelkolla alltid innehållet. AI kan ha fel.
            </Typography>
            <Typography variant="caption" className="text-warning-700">
              Granska och redigera alla AI-genererade frågor innan du lägger till dem i ditt quiz.
            </Typography>
          </div>
        </div>
      </div>

      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generera utkast
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="ai-subject" className="block text-sm font-medium text-neutral-700">
                Ämne *
              </label>
              <select
                id="ai-subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                aria-describedby="ai-subject-help"
              >
                <option value="">Välj ämne</option>
                {subjectOptions.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <Typography variant="caption" className="text-neutral-500" id="ai-subject-help">
                Välj ämnet som frågorna ska handla om
              </Typography>
            </div>

            <div className="space-y-2">
              <label htmlFor="ai-grade" className="block text-sm font-medium text-neutral-700">
                Årskurs *
              </label>
              <select
                id="ai-grade"
                value={formData.gradeLevel}
                onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                aria-describedby="ai-grade-help"
              >
                <option value="">Välj årskurs</option>
                {gradeLevels.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              <Typography variant="caption" className="text-neutral-500" id="ai-grade-help">
                Välj årskurs för att anpassa språk och svårighetsgrad
              </Typography>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="ai-questions" className="block text-sm font-medium text-neutral-700">
                Antal frågor
              </label>
              <select
                id="ai-questions"
                value={formData.numberOfQuestions}
                onChange={(e) => handleInputChange('numberOfQuestions', parseInt(e.target.value))}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {[3, 5, 8, 10, 15, 20].map(num => (
                  <option key={num} value={num}>{num} frågor</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="ai-difficulty" className="block text-sm font-medium text-neutral-700">
                Svårighetsgrad
              </label>
              <select
                id="ai-difficulty"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value as 'easy' | 'medium' | 'hard')}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="easy">Lätt</option>
                <option value="medium">Medel</option>
                <option value="hard">Svår</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="ai-topics" className="block text-sm font-medium text-neutral-700">
              Specifika ämnesområden (valfritt)
            </label>
            <Input
              id="ai-topics"
              value={formData.topics}
              onChange={(e) => handleInputChange('topics', e.target.value)}
              placeholder="t.ex. multiplikation, geometri, rörelser"
              aria-describedby="ai-topics-help"
            />
            <Typography variant="caption" className="text-neutral-500" id="ai-topics-help">
              Separera med kommatecken för att fokusera på specifika områden
            </Typography>
          </div>

          <div className="space-y-2">
            <label htmlFor="ai-goals" className="block text-sm font-medium text-neutral-700">
              Kunskapsmål (valfritt)
            </label>
            <Textarea
              id="ai-goals"
              value={formData.goals}
              onChange={(e) => handleInputChange('goals', e.target.value)}
              placeholder="Beskriv vad eleverna ska kunna efter detta quiz..."
              rows={3}
              aria-describedby="ai-goals-help"
            />
            <Typography variant="caption" className="text-neutral-500" id="ai-goals-help">
              Hjälper AI att skapa mer målriktade frågor
            </Typography>
          </div>

          {errorMessage && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-3" role="alert">
              <Typography variant="body2" className="text-error-800">
                {errorMessage}
              </Typography>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Genererar frågor...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generera utkast
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Genererade frågor</CardTitle>
          </CardHeader>
          
          <CardContent>
            <AIResultList
              questions={generatedQuestions}
              selectedQuestions={selectedQuestions}
              onToggleSelect={handleToggleSelect}
              onEditQuestion={handleEditQuestion}
              onRemoveQuestion={handleRemoveQuestion}
            />
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className="flex-1"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generera nya
            </Button>
            
            <Button
              onClick={handleInsertSelected}
              disabled={!hasSelectedQuestions}
              className="flex-1 bg-success-600 hover:bg-success-700 text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Infoga valda ({selectedQuestions.size})
            </Button>
            
            <Button
              variant="outline"
              onClick={handleInsertAll}
              disabled={!hasAllQuestions}
              className="border-success-300 text-success-700 hover:bg-success-50"
            >
              Infoga alla
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}