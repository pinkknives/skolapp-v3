'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Question } from '@/types/quiz'
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
    } catch (error) {
      console.error('Error generating AI quiz:', error)
      // In a real app, show error message to user
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAcceptQuestions = () => {
    onQuestionsGenerated(generatedQuestions)
    onClose()
  }

  const gradeOptions = [
    'Förskola',
    'Åk 1', 'Åk 2', 'Åk 3',
    'Åk 4', 'Åk 5', 'Åk 6',
    'Åk 7', 'Åk 8', 'Åk 9',
    'Gymnasium åk 1', 'Gymnasium åk 2', 'Gymnasium åk 3'
  ]

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI-utkast för quiz</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Ämne
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">Välj ämne</option>
                      {subjectOptions.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Årskurs
                    </label>
                    <select
                      value={formData.gradeLevel}
                      onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                      className="flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">Välj årskurs</option>
                      {gradeOptions.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
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

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Svårighetsgrad
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    >
                      <option value="easy">Lätt</option>
                      <option value="medium">Medel</option>
                      <option value="hard">Svår</option>
                    </select>
                  </div>
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
                            {(question as any).options?.map((option: any, optIndex: number) => (
                              <div key={option.id} className={`text-sm pl-4 ${option.isCorrect ? 'text-success-600 font-medium' : 'text-neutral-600'}`}>
                                {String.fromCharCode(65 + optIndex)}. {option.text}
                                {option.isCorrect && ' ✓'}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === 'free-text' && (
                          <Typography variant="caption" className="text-neutral-600">
                            Fritextsvar förväntat: {(question as any).expectedAnswer}
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