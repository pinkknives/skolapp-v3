'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Typography, Heading } from '@/components/ui/Typography'
import { 
  Brain, 
  Target, 
  Clock, 
  Star,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3,
  XCircle
} from 'lucide-react'
import { enhancedAIService, type EnhancedAIParams, type AdaptiveQuestion } from '@/lib/ai/enhanced-ai-service'
import type { Question } from '@/types/quiz'

interface StudentProfile {
  strengths: string[]
  weaknesses: string[]
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  interests: string[]
  previousPerformance: number
  averageTimePerQuestion: number
  commonMistakes: string[]
}

interface AdaptiveQuestionGeneratorProps {
  onQuestionsGenerated: (questions: Question[]) => void
  onClose: () => void
  initialSubject?: string
  initialGrade?: string
  studentProfile?: StudentProfile
  className?: string
}

const learningStyleLabels = {
  visual: 'Visuell',
  auditory: 'Auditiv',
  kinesthetic: 'Kinestetisk',
  reading: 'Läsning'
}

const pedagogicalApproaches = [
  { value: 'conceptual', label: 'Begreppsfokuserad', description: 'Fokus på teoretisk förståelse' },
  { value: 'practical', label: 'Praktisk', description: 'Fokus på tillämpning och problemlösning' },
  { value: 'analytical', label: 'Analytisk', description: 'Fokus på kritiskt tänkande' },
  { value: 'creative', label: 'Kreativ', description: 'Fokus på innovation och kreativitet' }
]

export function AdaptiveQuestionGenerator({
  onQuestionsGenerated,
  onClose,
  initialSubject = '',
  initialGrade = '',
  studentProfile,
  className = ''
}: AdaptiveQuestionGeneratorProps) {
  const [params, setParams] = useState<EnhancedAIParams>({
    subject: initialSubject,
    grade: initialGrade,
    difficulty: 'medel',
    count: 5,
    type: 'mixed',
    topics: [],
    learningObjectives: [],
    extraContext: '',
    pedagogicalApproach: 'conceptual'
  })
  
  const [generatedQuestions, setGeneratedQuestions] = useState<AdaptiveQuestion[]>([])
  const [_loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [currentStep, setCurrentStep] = useState<'config' | 'generating' | 'review'>('config')

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setCurrentStep('generating')
    
    try {
      let questions: AdaptiveQuestion[]
      
      if (studentProfile) {
        // Generate personalized questions
        questions = await enhancedAIService.generatePersonalizedQuestions(studentProfile, params)
      } else {
        // Generate adaptive questions
        questions = await enhancedAIService.generateAdaptiveQuestions(params)
      }
      
      setGeneratedQuestions(questions)
      setCurrentStep('review')
    } catch (err) {
      console.error('Generation error:', err)
      setError('Kunde inte generera frågor just nu')
      setCurrentStep('config')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptQuestions = () => {
    const questions = generatedQuestions.map(aq => aq.question)
    onQuestionsGenerated(questions)
    onClose()
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
    if (difficulty <= 6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 3) return 'Lätt'
    if (difficulty <= 6) return 'Medel'
    return 'Svår'
  }

  return (
    <Card className={`w-full max-w-4xl ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-primary-500" />
            <div>
              <CardTitle className="text-xl">
                {studentProfile ? 'Personlig frågegenerator' : 'Adaptiv frågegenerator'}
              </CardTitle>
              <Typography variant="body2" className="text-muted-foreground">
                {studentProfile 
                  ? 'Genererar frågor anpassade för elevens profil'
                  : 'Genererar frågor baserat på svårighetsgrad och prestationer'
                }
              </Typography>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {currentStep === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Basic Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="body2" className="font-semibold mb-2">
                    Ämne *
                  </Typography>
                  <Input
                    value={params.subject}
                    onChange={(e) => setParams(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="t.ex. Matematik, Svenska, Biologi"
                  />
                </div>
                <div>
                  <Typography variant="body2" className="font-semibold mb-2">
                    Årskurs *
                  </Typography>
                  <Input
                    value={params.grade}
                    onChange={(e) => setParams(prev => ({ ...prev, grade: e.target.value }))}
                    placeholder="t.ex. 6, 9, Gymnasiet"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Typography variant="body2" className="font-semibold mb-2">
                    Svårighetsgrad
                  </Typography>
                  <select
                    value={params.difficulty}
                    onChange={(e) => setParams(prev => ({ ...prev, difficulty: e.target.value as 'lätt' | 'medel' | 'svår' }))}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="lätt">Lätt</option>
                    <option value="medel">Medel</option>
                    <option value="svår">Svår</option>
                  </select>
                </div>
                <div>
                  <Typography variant="body2" className="font-semibold mb-2">
                    Antal frågor
                  </Typography>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={params.count}
                    onChange={(e) => setParams(prev => ({ ...prev, count: parseInt(e.target.value) || 5 }))}
                  />
                </div>
                <div>
                  <Typography variant="body2" className="font-semibold mb-2">
                    Frågetyp
                  </Typography>
                  <select
                    value={params.type}
                    onChange={(e) => setParams(prev => ({ ...prev, type: e.target.value as 'mixed' | 'multiple-choice' | 'free-text' }))}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="mixed">Blandad</option>
                    <option value="multiple-choice">Flerval</option>
                    <option value="free-text">Fritext</option>
                  </select>
                </div>
              </div>

              {/* Advanced Configuration */}
              <div>
                <Button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  variant="outline"
                  size="sm"
                  className="mb-4"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {showAdvanced ? 'Dölj' : 'Visa'} avancerade inställningar
                </Button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <Typography variant="body2" className="font-semibold mb-2">
                          Pedagogisk approach
                        </Typography>
                        <div className="grid grid-cols-2 gap-2">
                          {pedagogicalApproaches.map(approach => (
                            <label key={approach.value} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="pedagogicalApproach"
                                value={approach.value}
                                checked={params.pedagogicalApproach === approach.value}
                                onChange={(e) => setParams(prev => ({ ...prev, pedagogicalApproach: e.target.value as 'conceptual' | 'practical' | 'analytical' | 'creative' }))}
                                className="text-primary-600"
                              />
                              <div>
                                <Typography variant="body2" className="font-medium">
                                  {approach.label}
                                </Typography>
                                <Typography variant="caption" className="text-muted-foreground">
                                  {approach.description}
                                </Typography>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Typography variant="body2" className="font-semibold mb-2">
                          Ämnen (kommaseparerade)
                        </Typography>
                        <Input
                          value={params.topics?.join(', ') || ''}
                          onChange={(e) => setParams(prev => ({ 
                            ...prev, 
                            topics: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                          }))}
                          placeholder="t.ex. algebra, geometri, statistik"
                        />
                      </div>

                      <div>
                        <Typography variant="body2" className="font-semibold mb-2">
                          Lärandemål (kommaseparerade)
                        </Typography>
                        <Input
                          value={params.learningObjectives?.join(', ') || ''}
                          onChange={(e) => setParams(prev => ({ 
                            ...prev, 
                            learningObjectives: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                          }))}
                          placeholder="t.ex. förstå bråk, lösa ekvationer"
                        />
                      </div>

                      <div>
                        <Typography variant="body2" className="font-semibold mb-2">
                          Extra kontext
                        </Typography>
                        <textarea
                          value={params.extraContext || ''}
                          onChange={(e) => setParams(prev => ({ ...prev, extraContext: e.target.value }))}
                          placeholder="Ytterligare information som kan hjälpa AI:n generera bättre frågor..."
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 h-20 resize-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Student Profile Display */}
              {studentProfile && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Typography variant="body2" className="font-semibold mb-2 text-blue-700 dark:text-blue-400">
                    Elevprofil
                  </Typography>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Typography variant="caption" className="text-muted-foreground">Styrkor</Typography>
                      <Typography variant="body2">{studentProfile.strengths.length} identifierade</Typography>
                    </div>
                    <div>
                      <Typography variant="caption" className="text-muted-foreground">Svagheter</Typography>
                      <Typography variant="body2">{studentProfile.weaknesses.length} identifierade</Typography>
                    </div>
                    <div>
                      <Typography variant="caption" className="text-muted-foreground">Inlärningsstil</Typography>
                      <Typography variant="body2">{learningStyleLabels[studentProfile.learningStyle]}</Typography>
                    </div>
                    <div>
                      <Typography variant="caption" className="text-muted-foreground">Tidigare prestation</Typography>
                      <Typography variant="body2">{studentProfile.previousPerformance}%</Typography>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button onClick={onClose} variant="outline">
                  Avbryt
                </Button>
                <Button 
                  onClick={handleGenerate} 
                  disabled={!params.subject || !params.grade}
                  className="flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Generera frågor
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <RefreshCw className="w-16 h-16 animate-spin text-primary-500 mx-auto mb-4" />
              <Typography variant="h6" className="mb-2">
                Genererar adaptiva frågor...
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                AI:n analyserar parametrar och skapar personliga frågor
              </Typography>
            </motion.div>
          )}

          {currentStep === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <Heading level={4} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Genererade frågor ({generatedQuestions.length})
                </Heading>
                <Button onClick={() => setCurrentStep('config')} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generera nya
                </Button>
              </div>

              <div className="space-y-4">
                {generatedQuestions.map((aq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Typography variant="body1" className="font-semibold mb-2">
                          {aq.question.type === 'multiple-choice' 
                            ? (aq.question as { title: string }).title 
                            : (aq.question as { title: string }).title
                          }
                        </Typography>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(aq.difficulty)}`}>
                              {getDifficultyLabel(aq.difficulty)} ({aq.difficulty}/10)
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{aq.estimatedTime}s</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span>{aq.learningObjective}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {aq.prerequisites.length > 0 && (
                      <div className="mt-2">
                        <Typography variant="caption" className="text-muted-foreground">
                          Förkunskaper: {aq.prerequisites.join(', ')}
                        </Typography>
                      </div>
                    )}
                    
                    {aq.followUpSuggestions.length > 0 && (
                      <div className="mt-2">
                        <Typography variant="caption" className="text-primary-600">
                          Uppföljning: {aq.followUpSuggestions.join(', ')}
                        </Typography>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button onClick={() => setCurrentStep('config')} variant="outline">
                  Redigera inställningar
                </Button>
                <Button onClick={handleAcceptQuestions} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Acceptera frågor
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          >
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <Typography variant="body2" className="font-semibold">
                Ett fel uppstod
              </Typography>
            </div>
            <Typography variant="body2" className="text-red-600 dark:text-red-400 mt-1">
              {error}
            </Typography>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
