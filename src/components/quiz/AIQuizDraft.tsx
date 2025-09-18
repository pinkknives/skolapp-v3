'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Question, MultipleChoiceQuestion, FreeTextQuestion, MultipleChoiceOption } from '@/types/quiz'
import { generateAIQuizDraft } from '@/lib/quiz-utils'

interface AIQuizDraftProps {
  onQuestionsGenerated: (questions: Question[]) => void
  onClose: () => void
}

export function AIQuizDraft({ onQuestionsGenerated, onClose }: AIQuizDraftProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    gradeLevel: '',
    numberOfQuestions: 5,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    topics: ''
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const prompt = {
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        numberOfQuestions: formData.numberOfQuestions,
        difficulty: formData.difficulty,
        topics: formData.topics ? formData.topics.split(',').map(t => t.trim()) : undefined
      }

      const questions = await generateAIQuizDraft(prompt)
      setGeneratedQuestions(questions)
      setHasGenerated(true)
    } catch {
      // Error handling - in a real app, show error message to user
      // For now, just silently fail and keep generating state false
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAcceptQuestions = () => {
    onQuestionsGenerated(generatedQuestions)
    onClose()
  }

  const gradeOptions = [
    { value: 'Förskola', label: 'Förskola' },
    { value: 'Åk 1', label: 'Åk 1' }, 
    { value: 'Åk 2', label: 'Åk 2' }, 
    { value: 'Åk 3', label: 'Åk 3' },
    { value: 'Åk 4', label: 'Åk 4' }, 
    { value: 'Åk 5', label: 'Åk 5' }, 
    { value: 'Åk 6', label: 'Åk 6' },
    { value: 'Åk 7', label: 'Åk 7' }, 
    { value: 'Åk 8', label: 'Åk 8' }, 
    { value: 'Åk 9', label: 'Åk 9' },
    { value: 'Gymnasium åk 1', label: 'Gymnasium åk 1' }, 
    { value: 'Gymnasium åk 2', label: 'Gymnasium åk 2' }, 
    { value: 'Gymnasium åk 3', label: 'Gymnasium åk 3' }
  ]

  const subjectOptions = [
    { value: 'Matematik', label: 'Matematik' },
    { value: 'Svenska', label: 'Svenska' },
    { value: 'Engelska', label: 'Engelska' },
    { value: 'Naturkunskap', label: 'Naturkunskap' },
    { value: 'Biologi', label: 'Biologi' },
    { value: 'Fysik', label: 'Fysik' },
    { value: 'Kemi', label: 'Kemi' },
    { value: 'Historia', label: 'Historia' },
    { value: 'Geografi', label: 'Geografi' },
    { value: 'Samhällskunskap', label: 'Samhällskunskap' },
    { value: 'Teknik', label: 'Teknik' },
    { value: 'Slöjd', label: 'Slöjd' },
    { value: 'Bild', label: 'Bild' },
    { value: 'Musik', label: 'Musik' },
    { value: 'Idrott och hälsa', label: 'Idrott och hälsa' }
  ]

  const difficultyOptions = [
    { value: 'easy', label: 'Lätt' },
    { value: 'medium', label: 'Medel' },
    { value: 'hard', label: 'Svår' }
  ]

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-quiz-dialog-title"
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle id="ai-quiz-dialog-title">AI-utkast för quiz</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                aria-label="Stäng dialog"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Warning Banner */}
            <div className="bg-warning-50 border border-warning-200 rounded-md p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-warning-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <Typography variant="body2" className="font-medium text-warning-800">
                    Viktigt att dubbelkolla
                  </Typography>
                  <Typography variant="caption" className="text-warning-700">
                    AI kan ha fel. Granska alltid frågorna och svaren noga innan du publicerar quizet.
                  </Typography>
                </div>
              </div>
            </div>

            {!hasGenerated ? (
              <>
                {/* Generation Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Ämne"
                    placeholder="Välj ämne"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    options={subjectOptions}
                    required
                  />

                  <Select
                    label="Årskurs"
                    placeholder="Välj årskurs"
                    value={formData.gradeLevel}
                    onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                    options={gradeOptions}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Antal frågor"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.numberOfQuestions}
                    onChange={(e) => handleInputChange('numberOfQuestions', parseInt(e.target.value) || 5)}
                    required
                  />

                  <Select
                    label="Svårighetsgrad"
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    options={difficultyOptions}
                  />
                </div>

                <Input
                  label="Specifika ämnesområden (valfritt)"
                  placeholder="t.ex. algebra, geometri, decimaler"
                  value={formData.topics}
                  onChange={(e) => handleInputChange('topics', e.target.value)}
                  helperText="Separera med kommatecken"
                />
              </>
            ) : (
              <>
                {/* Generated Questions Preview */}
                <div>
                  <Typography variant="body1" className="font-medium mb-4">
                    Genererade frågor ({generatedQuestions.length} st)
                  </Typography>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedQuestions.map((question, index) => (
                      <div key={question.id} className="border rounded-md p-4 bg-neutral-50">
                        <Typography variant="body2" className="font-medium mb-2">
                          {index + 1}. {question.title}
                        </Typography>
                        {question.type === 'multiple-choice' && (
                          <div className="space-y-1">
                            {(question as MultipleChoiceQuestion).options?.map((option: MultipleChoiceOption, optIndex: number) => (
                              <div key={option.id} className={`text-sm pl-4 ${option.isCorrect ? 'text-success-600 font-medium' : 'text-neutral-600'}`}>
                                {String.fromCharCode(65 + optIndex)}. {option.text}
                                {option.isCorrect && ' ✓'}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === 'free-text' && (
                          <Typography variant="caption" className="text-neutral-600">
                            Fritextsvar förväntat: {(question as FreeTextQuestion).expectedAnswer}
                          </Typography>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            
            {!hasGenerated ? (
              <Button 
                onClick={handleGenerate} 
                loading={isGenerating}
                disabled={!formData.subject || !formData.gradeLevel}
              >
                {isGenerating ? 'Genererar...' : 'Generera frågor'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setHasGenerated(false)
                    setGeneratedQuestions([])
                  }}
                >
                  Generera nya
                </Button>
                <Button onClick={handleAcceptQuestions}>
                  Acceptera frågor
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}