'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { quizAI, GRADE_LEVELS } from '@/lib/ai/quizProvider'
import { Question, QuestionCitation } from '@/types/quiz'
import { Sparkles, AlertCircle, CheckCircle, X, ExternalLink, BookOpen } from 'lucide-react'

interface AIQuestionGeneratorProps {
  onQuestionsGenerated: (questions: Question[]) => void
  onClose: () => void
  className?: string
}

type GenerationState = 'form' | 'generating' | 'review' | 'error'

// Citation display component
function CitationSources({ citations }: { citations: QuestionCitation[] }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded-md">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-4 h-4 text-neutral-600" />
        <Typography variant="body2" className="font-medium text-neutral-700">
          Källor från läroplaner:
        </Typography>
      </div>
      <div className="space-y-2">
        {citations.map((citation, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            <span className="text-neutral-500 font-mono text-xs mt-0.5">[{index + 1}]</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-700">{citation.sourceTitle}</span>
                {citation.sourceUrl && (
                  <a
                    href={citation.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                    title="Öppna källa"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {citation.license && (
                <div className="text-xs text-neutral-500 mt-1">
                  Licens: {citation.license}
                </div>
              )}
              {citation.span && (
                <div className="text-xs text-neutral-600 mt-1 italic">
                  &ldquo;{citation.span}&rdquo;
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AIQuestionGenerator({ onQuestionsGenerated, onClose, className }: AIQuestionGeneratorProps) {
  const [state, setState] = useState<GenerationState>('form')
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [numberOfQuestions, setNumberOfQuestions] = useState(5)
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'free-text' | 'mixed'>('multiple-choice')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [context, setContext] = useState('')
  const [useRAG, setUseRAG] = useState(true) // Enable RAG by default
  const [syllabusAvailable, setSyllabusAvailable] = useState<boolean | null>(null) // null = checking, true/false = available/unavailable
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)

  // Check if syllabus feature is available
  useEffect(() => {
    const checkSyllabusAvailability = async () => {
      try {
        const response = await fetch('/api/rag/quiz/context', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: 'test',
            gradeBand: '1-3',
            k: 1
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setSyllabusAvailable(!data.featureDisabled);
        } else {
          setSyllabusAvailable(false);
        }
      } catch {
        setSyllabusAvailable(false);
      }
    };
    
    checkSyllabusAvailability();
  }, []);

  const handleGenerate = async () => {
    if (!subject.trim() || !gradeLevel) {
      setError('Ämne och årskurs krävs')
      return
    }

    setState('generating')
    setError(null)

    try {
      const questions = await quizAI.generateQuestions({
        subject: subject.trim(),
        grade: gradeLevel,
        count: numberOfQuestions,
        type: questionType === 'mixed' ? 'multiple-choice' : questionType, // Handle mixed type
        difficulty,
        context: context.trim() || undefined,
        locale: 'sv-SE',
        useRAG
      })

      setGeneratedQuestions(questions)
      setState('review')
    } catch (err) {
      console.error('AI generation error:', err)
      setError(err instanceof Error ? err.message : 'Ett oväntat fel uppstod')
      setState('error')
    }
  }

  const handleAcceptQuestions = () => {
    onQuestionsGenerated(generatedQuestions)
    onClose()
  }

  const handleReject = () => {
    setGeneratedQuestions([])
    setState('form')
  }

  const difficultyOptions = [
    { value: 'easy', label: 'Lätt' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Svår' }
  ]

  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Flerval' },
    { value: 'free-text', label: 'Fritext' },
    { value: 'mixed', label: 'Blandade' }
  ]

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              Skapa frågor med AI
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Form State */}
          {state === 'form' && (
            <div className="space-y-6">
              <div className="bg-warning-50 border border-warning-200 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <Typography variant="body2" className="font-medium text-warning-800">
                      Dubbelkolla alltid innehållet. AI kan ha fel.
                    </Typography>
                    <Typography variant="caption" className="text-warning-700">
                      Granska och redigera frågorna innan du lägger till dem i ditt quiz.
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Ämne *"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="t.ex. Matematik, Svenska, Historia"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Årskurs *
                    </label>
                    <select
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Välj årskurs</option>
                      {GRADE_LEVELS.map((grade) => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Antal frågor"
                    type="number"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(Math.max(1, Math.min(10, parseInt(e.target.value) || 5)))}
                    min={1}
                    max={10}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Frågetyp
                    </label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value as 'multiple-choice' | 'free-text' | 'mixed')}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {questionTypeOptions.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Svårighetsgrad
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {difficultyOptions.map((diff) => (
                        <option key={diff.value} value={diff.value}>
                          {diff.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Kontext (valfritt)
                    </label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="t.ex. Fokusera på geometri, använd exempel från vardagen..."
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                    />
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-md border ${
                    syllabusAvailable === false 
                      ? 'bg-neutral-50 border-neutral-200' 
                      : 'bg-primary-50 border-primary-200'
                  }`}>
                    <input
                      type="checkbox"
                      id="use-rag"
                      checked={useRAG && syllabusAvailable !== false}
                      onChange={(e) => setUseRAG(e.target.checked)}
                      className={`w-4 h-4 rounded focus:ring-primary-500 ${
                        syllabusAvailable === false 
                          ? 'text-neutral-400 border-neutral-300 cursor-not-allowed' 
                          : 'text-primary-600 border-primary-300'
                      }`}
                      disabled={syllabusAvailable === false}
                    />
                    <label htmlFor="use-rag" className={`text-sm ${
                      syllabusAvailable === false 
                        ? 'text-neutral-500' 
                        : 'text-primary-700'
                    }`}>
                      <strong>Använd svenska läroplaner</strong> - 
                      {syllabusAvailable === null && ' Kontrollerar tillgänglighet...'}
                      {syllabusAvailable === true && ' Basera frågor på Skolverkets curriculum (rekommenderas)'}
                      {syllabusAvailable === false && ' Tillgängligt endast när FEATURE_SYLLABUS är aktiverat'}
                    </label>
                  </div>
                  
                  {syllabusAvailable === false && (
                    <div className="p-3 bg-warning-50 border border-warning-200 rounded-md">
                      <Typography variant="body2" className="text-warning-700">
                        <strong>Info:</strong> Välj ämne och årskurs för att använda kursplanen som underlag när syllabusdata är tillgänglig.
                      </Typography>
                    </div>
                  )}
                  
                  {syllabusAvailable === true && useRAG && subject && gradeLevel && (
                    <div className="p-3 bg-info-50 border border-info-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-info-600" />
                        <Typography variant="body2" className="font-medium text-info-700">
                          Underlag från Skolverket
                        </Typography>
                      </div>
                      <Typography variant="caption" className="text-info-600">
                        Frågor kommer att baseras på officiellt kursmaterial för {subject}, årskurs {gradeLevel}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-error-50 border border-error-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0" />
                  <Typography variant="body2" className="text-error-700">
                    {error}
                  </Typography>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Avbryt
                </Button>
                <Button onClick={handleGenerate} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generera frågor
                </Button>
              </div>
            </div>
          )}

          {/* Generating State */}
          {state === 'generating' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <Typography variant="h6" className="mb-2">
                Genererar frågor...
              </Typography>
              <Typography variant="body2" className="text-neutral-600">
                AI:n skapar {numberOfQuestions} frågor om {subject} för {gradeLevel}
              </Typography>
            </div>
          )}

          {/* Review State */}
          {state === 'review' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-3 bg-success-50 border border-success-200 rounded-md">
                <CheckCircle className="w-4 h-4 text-success-600 flex-shrink-0" />
                <Typography variant="body2" className="text-success-700">
                  {generatedQuestions.length} frågor genererade! Granska dem nedan.
                </Typography>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {generatedQuestions.map((question, index) => (
                  <Card key={question.id} className="border-neutral-200">
                    <CardContent className="p-4">
                      <Typography variant="body1" className="font-medium mb-2">
                        {index + 1}. {question.title}
                      </Typography>
                      
                      {question.type === 'multiple-choice' && 'options' in question && (
                        <ul className="space-y-1 ml-4">
                          {question.options.map((option, optIndex) => (
                            <li
                              key={option.id}
                              className={`text-sm ${option.isCorrect ? 'text-success-700 font-medium' : 'text-neutral-600'}`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option.text}
                              {option.isCorrect && ' ✓'}
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {question.type === 'free-text' && 'expectedAnswer' in question && question.expectedAnswer && (
                        <Typography variant="body2" className="text-neutral-600 ml-4">
                          Förväntat svar: {question.expectedAnswer}
                        </Typography>
                      )}
                      
                      {question.explanation && (
                        <div className="mt-3 p-2 bg-info-50 border border-info-200 rounded-md">
                          <Typography variant="body2" className="text-info-800">
                            <strong>Koppling till läroplanen:</strong> {question.explanation}
                          </Typography>
                        </div>
                      )}
                      
                      {question.citations && <CitationSources citations={question.citations} />}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-warning-50 border border-warning-200 rounded-md p-4">
                <Typography variant="body2" className="text-warning-800">
                  <strong>Dubbelkolla alltid innehållet. AI kan ha fel.</strong> Granska frågorna noga innan du lägger till dem. Du kan redigera dem efter att du lagt till dem i ditt quiz.
                </Typography>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleReject}>
                  Generera nya
                </Button>
                <Button onClick={handleAcceptQuestions} className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Lägg till frågorna
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-error-600 mx-auto mb-4" />
              <Typography variant="h6" className="mb-2 text-error-700">
                Kunde inte generera frågor
              </Typography>
              <Typography variant="body2" className="text-neutral-600 mb-6">
                {error}
              </Typography>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={onClose}>
                  Stäng
                </Button>
                <Button onClick={() => setState('form')}>
                  Försök igen
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}