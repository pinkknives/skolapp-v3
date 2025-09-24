'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Quiz, ExecutionMode } from '@/types/quiz'
import { formatExecutionMode } from '@/lib/quiz-utils'

interface QuizBasicInfoProps {
  quiz: Partial<Quiz>
  onChange: (updates: Partial<Quiz>) => void
}

export function QuizBasicInfo({ quiz, onChange }: QuizBasicInfoProps) {
  const [tagInput, setTagInput] = useState('')

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const executionModes: ExecutionMode[] = ['self-paced', 'teacher-controlled', 'teacher-review']

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grundläggande information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <Input
          label="Titel"
          placeholder="Ange en titel för ditt quiz"
          value={quiz.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          required
        />

        {/* Description */}
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-neutral-700">
            Beskrivning
          </label>
          <textarea
            id="description"
            className="flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-all duration-200 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-vertical"
            placeholder="Beskriv vad quizet handlar om"
            value={quiz.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={4}
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tag-input" className="mb-1 block text-sm font-medium text-neutral-700">
            Taggar
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              id="tag-input"
              placeholder="Lägg till en tagg"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button type="button" onClick={handleAddTag} disabled={!tagInput.trim()}>
              Lägg till
            </Button>
          </div>
          {quiz.tags && quiz.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quiz.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded-md"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-primary-600 hover:text-primary-800 text-lg leading-none"
                    aria-label={`Ta bort tagg ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Time Limit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tidsgräns (minuter)"
            type="number"
            min="1"
            placeholder="Valfri"
            value={quiz.settings?.timeLimit || ''}
            onChange={(e) => onChange({
              settings: {
                ...{
                  allowRetakes: false,
                  shuffleQuestions: false,
                  shuffleAnswers: false,
                  showCorrectAnswers: true,
                  executionMode: 'self-paced' as ExecutionMode
                },
                ...quiz.settings,
                timeLimit: e.target.value ? parseInt(e.target.value) : undefined
              }
            })}
            helperText="Lämna tomt för obegränsad tid"
          />
        </div>

        {/* Execution Mode */}
        <div>
          <Typography variant="body2" className="mb-2 font-medium text-neutral-700">
            Genomförandeläge
          </Typography>
          <div className="space-y-2">
            {executionModes.map((mode) => (
              <label key={mode} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="executionMode"
                  value={mode}
                  checked={quiz.settings?.executionMode === mode}
                  onChange={(e) => onChange({
                    settings: {
                      ...{
                        allowRetakes: false,
                        shuffleQuestions: false,
                        shuffleAnswers: false,
                        showCorrectAnswers: true,
                        executionMode: 'self-paced' as ExecutionMode
                      },
                      ...quiz.settings,
                      executionMode: e.target.value as ExecutionMode
                    }
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                />
                <div>
                  <Typography variant="body2" className="font-medium">
                    {formatExecutionMode(mode)}
                  </Typography>
                  <Typography variant="caption" className="text-neutral-600">
                    {mode === 'self-paced' && 'Eleven styr tempot själv'}
                    {mode === 'teacher-controlled' && 'Du styr när nästa fråga visas'}
                    {mode === 'teacher-review' && 'Projicera och gå igenom tillsammans med klassen'}
                  </Typography>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <Typography variant="body2" className="mb-3 font-medium text-neutral-700">
            Avancerade inställningar
          </Typography>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={quiz.settings?.allowRetakes || false}
                onChange={(e) => onChange({
                  settings: {
                    ...{
                      allowRetakes: false,
                      shuffleQuestions: false,
                      shuffleAnswers: false,
                      showCorrectAnswers: true,
                      executionMode: 'self-paced' as ExecutionMode
                    },
                    ...quiz.settings,
                    allowRetakes: e.target.checked
                  }
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <Typography variant="body2">Tillåt flera försök</Typography>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={quiz.settings?.shuffleQuestions || false}
                onChange={(e) => onChange({
                  settings: {
                    ...{
                      allowRetakes: false,
                      shuffleQuestions: false,
                      shuffleAnswers: false,
                      showCorrectAnswers: true,
                      executionMode: 'self-paced' as ExecutionMode
                    },
                    ...quiz.settings,
                    shuffleQuestions: e.target.checked
                  }
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <Typography variant="body2">Blanda frågorna</Typography>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={quiz.settings?.shuffleAnswers || false}
                onChange={(e) => onChange({
                  settings: {
                    ...{
                      allowRetakes: false,
                      shuffleQuestions: false,
                      shuffleAnswers: false,
                      showCorrectAnswers: true,
                      executionMode: 'self-paced' as ExecutionMode
                    },
                    ...quiz.settings,
                    shuffleAnswers: e.target.checked
                  }
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <Typography variant="body2">Blanda svarsalternativen</Typography>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={quiz.settings?.showCorrectAnswers !== false}
                onChange={(e) => onChange({
                  settings: {
                    ...{
                      allowRetakes: false,
                      shuffleQuestions: false,
                      shuffleAnswers: false,
                      showCorrectAnswers: true,
                      executionMode: 'self-paced' as ExecutionMode
                    },
                    ...quiz.settings,
                    showCorrectAnswers: e.target.checked
                  }
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <Typography variant="body2">Visa korrekta svar efter inlämning</Typography>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}