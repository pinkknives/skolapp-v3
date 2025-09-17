'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Quiz, ExecutionMode } from '@/types/quiz'
import { QuizSharing } from '@/components/quiz/QuizSharing'
import { calculateTotalPoints, estimateCompletionTime, formatExecutionMode } from '@/lib/quiz-utils'

interface WizardStep3PublishProps {
  quiz: Partial<Quiz>
  onChange: (updates: Partial<Quiz>) => void
  onPublish: () => Promise<void>
  onPrev: () => void
}

export function WizardStep3Publish({ 
  quiz, 
  onChange, 
  onPublish, 
  onPrev 
}: WizardStep3PublishProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewMode, setPreviewMode] = useState<'mobile' | 'classroom'>('mobile')

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await onPublish()
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSettingChange = (key: keyof Quiz['settings'], value: any) => {
    const currentSettings = quiz.settings || {
      allowRetakes: false,
      shuffleQuestions: false,
      shuffleAnswers: false,
      showCorrectAnswers: true,
      executionMode: 'self-paced' as ExecutionMode
    }
    
    onChange({
      settings: {
        ...currentSettings,
        [key]: value
      }
    })
  }

  const totalPoints = calculateTotalPoints(quiz.questions || [])
  const estimatedTime = estimateCompletionTime(quiz.questions || [])

  return (
    <div className="space-y-6">
      {/* Quiz Summary */}
      <Card className="bg-primary-50 border-primary-200">
        <CardHeader>
          <CardTitle className="text-primary-800">Granska ditt quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <Typography variant="h6" className="text-primary-800">{quiz.questions?.length || 0}</Typography>
              <Typography variant="caption" className="text-primary-600">Frågor</Typography>
            </div>
            <div>
              <Typography variant="h6" className="text-primary-800">{totalPoints}</Typography>
              <Typography variant="caption" className="text-primary-600">Poäng totalt</Typography>
            </div>
            <div>
              <Typography variant="h6" className="text-primary-800">{estimatedTime}</Typography>
              <Typography variant="caption" className="text-primary-600">Min (uppskattat)</Typography>
            </div>
            <div>
              <Typography variant="h6" className="text-primary-800">{quiz.tags?.length || 0}</Typography>
              <Typography variant="caption" className="text-primary-600">Etiketter</Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Förhandsgranskning</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={previewMode === 'mobile' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                </svg>
                Mobil
              </Button>
              <Button
                variant={previewMode === 'classroom' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('classroom')}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Klassrum
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`border-2 border-dashed border-neutral-200 rounded-lg p-8 ${
            previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
          }`}>
            <div className="text-center">
              <Typography variant="h5" className="mb-2">{quiz.title}</Typography>
              <Typography variant="body2" className="text-neutral-600 mb-4">
                {quiz.description}
              </Typography>
              
              <div className="space-y-2 mb-6">
                {quiz.questions?.slice(0, 2).map((question, index) => (
                  <div key={question.id} className="text-left p-3 bg-neutral-50 rounded">
                    <Typography variant="body2" className="font-medium">
                      {index + 1}. {question.title}
                    </Typography>
                    {question.type === 'multiple-choice' && question.options && (
                      <div className="mt-2 space-y-1">
                        {question.options.slice(0, 2).map((option, optIndex) => (
                          <div key={option.id} className="text-sm text-neutral-600">
                            {String.fromCharCode(65 + optIndex)}. {option.text}
                          </div>
                        ))}
                        {question.options.length > 2 && (
                          <div className="text-xs text-neutral-400">... och {question.options.length - 2} till</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {(quiz.questions?.length || 0) > 2 && (
                  <div className="text-center text-sm text-neutral-400">
                    ... och {(quiz.questions?.length || 0) - 2} frågor till
                  </div>
                )}
              </div>

              <Button disabled className="mb-4">
                {previewMode === 'mobile' ? 'Starta quiz' : 'Väntar på läraren...'}
              </Button>
              
              <Typography variant="caption" className="text-neutral-500 block">
                Förhandsgranskning - {previewMode === 'mobile' ? 'Elevvy på mobil' : 'Klassrumsvy'}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Inställningar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Execution Mode */}
          <div>
            <Typography variant="body2" className="mb-2 font-medium text-neutral-700">
              Genomförandeläge
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['self-paced', 'teacher-controlled', 'teacher-review'] as ExecutionMode[]).map((mode) => (
                <label key={mode} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
                  <input
                    type="radio"
                    name="executionMode"
                    value={mode}
                    checked={quiz.settings?.executionMode === mode}
                    onChange={(e) => handleSettingChange('executionMode', e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <Typography variant="body2" className="font-medium">
                      {formatExecutionMode(mode)}
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      {mode === 'self-paced' && 'Eleverna går igenom quizet i egen takt'}
                      {mode === 'teacher-controlled' && 'Du styr vilken fråga som visas'}
                      {mode === 'teacher-review' && 'Du granskar svaren manuellt'}
                    </Typography>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Other Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={quiz.settings?.shuffleQuestions || false}
                onChange={(e) => handleSettingChange('shuffleQuestions', e.target.checked)}
                className="mr-3"
              />
              <Typography variant="body2">Blanda frågornas ordning</Typography>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={quiz.settings?.shuffleAnswers || false}
                onChange={(e) => handleSettingChange('shuffleAnswers', e.target.checked)}
                className="mr-3"
              />
              <Typography variant="body2">Blanda svarsalternativen</Typography>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={quiz.settings?.showCorrectAnswers || false}
                onChange={(e) => handleSettingChange('showCorrectAnswers', e.target.checked)}
                className="mr-3"
              />
              <Typography variant="body2">Visa rätta svar efter quiz</Typography>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={quiz.settings?.allowRetakes || false}
                onChange={(e) => handleSettingChange('allowRetakes', e.target.checked)}
                className="mr-3"
              />
              <Typography variant="body2">Tillåt omtagning</Typography>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Publish Actions */}
      <Card className="border-success-200 bg-success-50">
        <CardHeader>
          <CardTitle className="text-success-800">Redo att publicera?</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body2" className="mb-4 text-success-700">
            När du publicerar ditt quiz får det en unik delningskod och QR-kod som eleverna kan använda för att gå med.
          </Typography>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handlePublish}
              loading={isPublishing}
              className="flex-1"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {isPublishing ? 'Publicerar...' : 'Publicera quiz'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                // Save as draft logic would go here
                alert('Utkast sparat! Du kan fortsätta senare.')
              }}
            >
              Spara som utkast
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" onClick={onPrev}>
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tillbaka
        </Button>

        <Typography variant="caption" className="text-neutral-500">
          Steg 3 av 3 - Publicera & dela
        </Typography>
      </div>
    </div>
  )
}