'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Quiz } from '@/types/quiz'
import { AIQuizDraft } from '@/components/quiz/AIQuizDraft'

interface WizardStep1BasicInfoProps {
  quiz: Partial<Quiz>
  quizType: 'empty' | 'template' | 'ai-draft'
  onChange: (updates: Partial<Quiz>) => void
  onNext: () => void
}

const subjectOptions = [
  'Matematik',
  'Svenska', 
  'Engelska',
  'Naturkunskap',
  'Biologi',
  'Fysik',
  'Kemi',
  'Historia',
  'Geografi',
  'Samhällskunskap',
  'Teknik',
  'Slöjd',
  'Bild',
  'Musik',
  'Idrott och hälsa'
]

const gradeOptions = [
  'Förskola',
  'Åk 1', 'Åk 2', 'Åk 3',
  'Åk 4', 'Åk 5', 'Åk 6', 
  'Åk 7', 'Åk 8', 'Åk 9',
  'Gymnasium åk 1', 'Gymnasium åk 2', 'Gymnasium åk 3'
]

export function WizardStep1BasicInfo({ 
  quiz, 
  quizType, 
  onChange, 
  onNext 
}: WizardStep1BasicInfoProps) {
  const [showAIDraft, setShowAIDraft] = useState(quizType === 'ai-draft')
  const [tagInput, setTagInput] = useState('')

  const handleInputChange = (field: keyof Quiz, value: string) => {
    onChange({ [field]: value })
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !quiz.tags?.includes(tagInput.trim())) {
      onChange({
        tags: [...(quiz.tags || []), tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      tags: quiz.tags?.filter(tag => tag !== tagToRemove) || []
    })
  }

  const handleAIQuestionsGenerated = (questions: any[]) => {
    onChange({ questions })
    setShowAIDraft(false)
    // Auto-advance to next step after AI generates questions
    setTimeout(onNext, 500)
  }

  const canProceed = quiz.title?.trim()

  return (
    <div className="space-y-6">
      {/* Quiz Type Info */}
      <Card className="bg-primary-50 border-primary-200">
        <CardContent className="text-center py-6">
          <Typography variant="h6" className="mb-2 text-primary-800">
            {quizType === 'empty' && 'Tomt quiz - Bygg från grunden'}
            {quizType === 'template' && 'Mall - Börja med en förlaga'} 
            {quizType === 'ai-draft' && 'AI-utkast - Låt AI hjälpa dig'}
          </Typography>
          <Typography variant="body2" className="text-primary-700">
            {quizType === 'empty' && 'Du lägger till alla frågor manuellt i nästa steg'}
            {quizType === 'template' && 'Välj en mall som passar ditt ämne och årskurs'}
            {quizType === 'ai-draft' && 'Fyll i informationen nedan så skapar AI ett förslag på frågor'}
          </Typography>
        </CardContent>
      </Card>

      {/* Basic Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Grundinformation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <Typography variant="body2" className="mb-2 font-medium text-neutral-700">
              Titel <span className="text-error-600">*</span>
            </Typography>
            <Input
              placeholder="t.ex. Matematik - Multiplikation åk 3"
              value={quiz.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Typography variant="body2" className="mb-2 font-medium text-neutral-700">
              Beskrivning
            </Typography>
            <Input
              placeholder="Kort beskrivning av vad quizet handlar om"
              value={quiz.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          {/* Subject and Grade in a row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Typography variant="body2" className="mb-2 font-medium text-neutral-700">
                Ämne
              </Typography>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={quiz.subject || ''}
                onChange={(e) => onChange({ subject: e.target.value })}
              >
                <option value="">Välj ämne</option>
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Typography variant="body2" className="mb-2 font-medium text-neutral-700">
                Årskurs
              </Typography>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={quiz.gradeLevel || ''}
                onChange={(e) => onChange({ gradeLevel: e.target.value })}
              >
                <option value="">Välj årskurs</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Typography variant="body2" className="mb-2 font-medium text-neutral-700">
              Etiketter
            </Typography>
            <div className="flex flex-wrap gap-2 mb-3">
              {quiz.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-primary-500 hover:text-primary-700"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Lägg till etikett"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button variant="outline" onClick={handleAddTag}>
                Lägg till
              </Button>
            </div>
            <Typography variant="caption" className="text-neutral-500 mt-1">
              Etiketter hjälper dig att organisera och hitta dina quiz
            </Typography>
          </div>
        </CardContent>
      </Card>

      {/* AI Draft Section for ai-draft type */}
      {quizType === 'ai-draft' && (
        <Card className="border-primary-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI-hjälp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="mb-4 text-neutral-600">
              När du har fyllt i grundinformationen kan du låta AI skapa frågor åt dig.
            </Typography>
            <Button
              onClick={() => setShowAIDraft(true)}
              disabled={!quiz.title?.trim()}
              className="mb-4"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Skapa AI-utkast
            </Button>
            
            {/* AI Disclaimer */}
            <div className="p-3 bg-warning-50 border border-warning-200 rounded-md">
              <Typography variant="caption" className="text-warning-800 font-medium">
                ⚠️ Dubbelkolla alltid innehållet. AI kan ha fel.
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" onClick={() => window.history.back()}>
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tillbaka
        </Button>

        <Button 
          onClick={onNext}
          disabled={!canProceed}
        >
          Fortsätt till frågor
          <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* AI Draft Modal */}
      {showAIDraft && (
        <AIQuizDraft
          onQuestionsGenerated={handleAIQuestionsGenerated}
          onClose={() => setShowAIDraft(false)}
        />
      )}
    </div>
  )
}