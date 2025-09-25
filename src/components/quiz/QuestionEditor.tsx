'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { RubricEditor } from './RubricEditor'
import { Question, MultipleChoiceQuestion, FreeTextQuestion, ImageQuestion, MultipleChoiceOption } from '@/types/quiz'
import { TextSimplificationHint } from './TextSimplificationHint'
import { ClarityImprovementHint } from './ClarityImprovementHint'
import { AnswerGenerationHint } from './AnswerGenerationHint'

interface QuestionEditorProps {
  question: Question
  questionIndex: number
  onChange: (question: Question) => void
  onDelete: () => void
  onDuplicate: () => void
  /** Grade level for AI hints (optional) */
  gradeLevel?: string
}

export function QuestionEditor({ question, questionIndex, onChange, onDelete, onDuplicate, gradeLevel }: QuestionEditorProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleBasicChange = (updates: Partial<Question>) => {
    onChange({ ...question, ...updates } as Question)
  }

  const handleMultipleChoiceChange = (updates: Partial<MultipleChoiceQuestion>) => {
    onChange({ ...question, ...updates } as Question)
  }

  const handleFreeTextChange = (updates: Partial<FreeTextQuestion>) => {
    onChange({ ...question, ...updates } as Question)
  }

  const handleImageChange = (updates: Partial<ImageQuestion>) => {
    onChange({ ...question, ...updates } as Question)
  }

  const addOption = () => {
    if (question.type === 'multiple-choice' || question.type === 'image') {
      const q = question as MultipleChoiceQuestion | ImageQuestion
      const newOption: MultipleChoiceOption = {
        id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        text: '',
        isCorrect: false
      }
      const updatedOptions = [...(q.options || []), newOption]
      
      if (question.type === 'multiple-choice') {
        handleMultipleChoiceChange({ options: updatedOptions })
      } else {
        handleImageChange({ options: updatedOptions })
      }
    }
  }

  const removeOption = (optionId: string) => {
    if (question.type === 'multiple-choice' || question.type === 'image') {
      const q = question as MultipleChoiceQuestion | ImageQuestion
      const updatedOptions = q.options?.filter(opt => opt.id !== optionId) || []
      
      if (question.type === 'multiple-choice') {
        handleMultipleChoiceChange({ options: updatedOptions })
      } else {
        handleImageChange({ options: updatedOptions })
      }
    }
  }

  const updateOption = (optionId: string, updates: Partial<MultipleChoiceOption>) => {
    if (question.type === 'multiple-choice' || question.type === 'image') {
      const q = question as MultipleChoiceQuestion | ImageQuestion
      const updatedOptions = q.options?.map(opt => 
        opt.id === optionId ? { ...opt, ...updates } : opt
      ) || []
      
      if (question.type === 'multiple-choice') {
        handleMultipleChoiceChange({ options: updatedOptions })
      } else {
        handleImageChange({ options: updatedOptions })
      }
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && question.type === 'image') {
      // In a real app, you would upload this to a server
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setImagePreview(imageUrl)
        handleImageChange({ 
          imageUrl,
          imageAlt: file.name 
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const questionTypeLabels = {
    'multiple-choice': 'Flervalsfråga',
    'free-text': 'Fritextfråga',
    'image': 'Bildfråga'
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Fråga {questionIndex + 1} - {questionTypeLabels[question.type]}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Kopiera
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-error-600 hover:text-error-700">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Ta bort
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question Title */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <Typography variant="body2" className="font-medium text-neutral-700">
              Frågetitel <span className="text-red-500">*</span>
            </Typography>
            <div className="flex gap-2">
              {gradeLevel && (
                <TextSimplificationHint
                  text={question.title}
                  targetGrade={gradeLevel}
                  onApply={(simplifiedText) => handleBasicChange({ title: simplifiedText })}
                />
              )}
              <ClarityImprovementHint
                questionText={question.title}
                questionType={question.type === 'multiple-choice' || question.type === 'image' ? 'multiple-choice' : 'free-text'}
                onApply={(improvedText) => handleBasicChange({ title: improvedText })}
              />
            </div>
          </div>
          <Input
            placeholder="Skriv din fråga här"
            value={question.title}
            onChange={(e) => handleBasicChange({ title: e.target.value })}
            required
          />
        </div>

        {/* Points and Time Limit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Poäng"
            type="number"
            min="1"
            value={question.points}
            onChange={(e) => handleBasicChange({ points: parseInt(e.target.value) || 1 })}
            required
          />
          <Input
            label="Tidsgräns (sekunder)"
            type="number"
            min="1"
            placeholder="Valfri"
            value={question.timeLimit || ''}
            onChange={(e) => handleBasicChange({ 
              timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            helperText="Lämna tomt för ingen tidsgräns"
          />
        </div>

        {/* Image Question Specific */}
        {question.type === 'image' && (
          <div className="space-y-4">
            <div>
              <label htmlFor={`image-upload-${question.id}`} className="mb-1 block text-sm font-medium text-neutral-700">
                Bild
              </label>
              <input
                id={`image-upload-${question.id}`}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            
            {(imagePreview || (question as ImageQuestion).imageUrl) && (
              <div className="mt-2">
                <Image
                  src={imagePreview || (question as ImageQuestion).imageUrl!}
                  alt={(question as ImageQuestion).imageAlt || 'Preview'}
                  width={400}
                  height={256}
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="max-w-full h-auto max-h-64 rounded-md border object-contain"
                  priority={false}
                />
              </div>
            )}

            <Input
              label="Bildbeskrivning (för tillgänglighet)"
              placeholder="Beskriv bilden för skärmläsare"
              value={(question as ImageQuestion).imageAlt || ''}
              onChange={(e) => handleImageChange({ imageAlt: e.target.value })}
              helperText="Viktigt för tillgänglighet"
            />
          </div>
        )}

        {/* Multiple Choice and Image Questions Options */}
        {(question.type === 'multiple-choice' || question.type === 'image') && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <Typography variant="body2" className="font-medium text-neutral-700">
                Svarsalternativ
              </Typography>
              <div className="flex gap-2">
                <AnswerGenerationHint
                  questionText={question.title}
                  _currentOptions={(question as MultipleChoiceQuestion | ImageQuestion).options}
                  onApply={(newOptions) => {
                    if (question.type === 'multiple-choice') {
                      handleMultipleChoiceChange({ options: newOptions })
                    } else {
                      handleImageChange({ options: newOptions })
                    }
                  }}
                />
                <Button variant="outline" size="sm" onClick={addOption}>
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Lägg till alternativ
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {((question as MultipleChoiceQuestion | ImageQuestion).options || []).map((option, index) => (
                <div key={option.id} className="flex items-center gap-3 p-3 border rounded-md">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={option.isCorrect}
                      onChange={() => {
                        // Only one option can be correct, so uncheck all others
                        const updatedOptions = ((question as MultipleChoiceQuestion | ImageQuestion).options || []).map(opt => ({
                          ...opt,
                          isCorrect: opt.id === option.id
                        }))
                        
                        if (question.type === 'multiple-choice') {
                          handleMultipleChoiceChange({ options: updatedOptions })
                        } else {
                          handleImageChange({ options: updatedOptions })
                        }
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                    />
                    <span className="ml-2 text-sm text-neutral-600">Korrekt</span>
                  </label>

                  <Input
                    placeholder={`Alternativ ${index + 1}`}
                    value={option.text}
                    onChange={(e) => updateOption(option.id, { text: e.target.value })}
                    className="flex-1"
                  />

                  {((question as MultipleChoiceQuestion | ImageQuestion).options || []).length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(option.id)}
                      className="text-error-600 hover:text-error-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free Text Question Specific */}
        {question.type === 'free-text' && (
          <div className="space-y-4">
            <Input
              label="Förväntat svar (valfritt)"
              placeholder="Exempel på korrekt svar"
              value={(question as FreeTextQuestion).expectedAnswer || ''}
              onChange={(e) => handleFreeTextChange({ expectedAnswer: e.target.value })}
              helperText="Används för automatisk rättning om implementerat"
            />
          </div>
        )}

        {/* Rubric Editor - Show for free-text and image questions */}
        {(question.type === 'free-text' || question.type === 'image') && (
          <RubricEditor
            rubric={question.rubric}
            questionId={question.id}
            onChange={(rubric) => handleBasicChange({ rubric })}
          />
        )}
      </CardContent>
    </Card>
  )
}