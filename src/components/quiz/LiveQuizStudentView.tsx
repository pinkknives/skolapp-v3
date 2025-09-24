'use client'

import React, { useState, useEffect } from 'react'
import { AgeBasedButton } from '@/components/ui/AgeBasedButton'
import { useAgeBasedGamification } from '@/hooks/useAgeBasedGamification'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Clock, CheckCircle, Loader2, Users } from 'lucide-react'
import { useQuizControl } from '@/hooks/useQuizControl'
import { submitAnswer, joinRoom } from '@/lib/realtime/quiz'
import { motion } from 'framer-motion'

interface Question {
  id: string
  title: string
  type: 'multiple-choice' | 'free-text'
  options?: Array<{ id: string; text: string }>
}

interface LiveQuizStudentViewProps {
  quizId: string
  questions: Question[]
  studentName: string
  className?: string
}

export function LiveQuizStudentView({ 
  quizId, 
  questions, 
  studentName,
  className = ''
}: LiveQuizStudentViewProps) {
  // Determine age group - for now default to young for demo purposes
  // In a real app, this would come from user profile or quiz settings
  const ageGroup: 'young' | 'middle' | 'old' | 'adult' = 'young'
  const { showConfetti: _showConfetti, getCelebrationMessage: _getCelebrationMessage } = useAgeBasedGamification(ageGroup)

  // Age-based styling functions
  const getAgeBasedStyles = (type: string) => {
    switch (type) {
      case 'card':
        return ageGroup === 'young' ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg' : 'bg-white shadow-sm'
      case 'text':
        return ageGroup === 'young' ? 'text-pink-800 font-semibold' : 'text-neutral-900'
      case 'mutedText':
        return ageGroup === 'young' ? 'text-pink-600' : 'text-neutral-600'
      case 'primary':
        return ageGroup === 'young' ? 'text-pink-500' : 'text-primary-500'
      case 'success':
        return ageGroup === 'young' ? 'text-green-600' : 'text-green-600'
      case 'questionTitle':
        return ageGroup === 'young' ? 'text-2xl font-bold text-pink-800' : 'text-xl font-semibold text-neutral-900'
      default:
        return ''
    }
  }

  const getAgeBasedText = (key: string, texts: Record<string, string>) => {
    return texts[ageGroup] || texts.adult || ''
  }

  const getAgeBasedAnimation = (_type: string) => {
    return {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    }
  }

  const [hasJoinedRoom, setHasJoinedRoom] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState<string>('')
  const [submittedAnswers, setSubmittedAnswers] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { state, isConnected, studentCount } = useQuizControl(quizId, 'student')

  // Auto-join room when component mounts
  useEffect(() => {
    if (!hasJoinedRoom && quizId && studentName) {
      joinRoom(quizId, 'student', studentName)
        .then(() => setHasJoinedRoom(true))
        .catch(console.error)
    }
  }, [quizId, studentName, hasJoinedRoom])

  // Reset current answer when question changes
  useEffect(() => {
    if (state.questionId) {
      setCurrentAnswer('')
    }
  }, [state.questionId])

  const currentQuestion = questions.find(q => q.id === state.questionId)
  const hasSubmittedCurrent = currentQuestion ? submittedAnswers.has(currentQuestion.id) : false

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !currentAnswer.trim() || hasSubmittedCurrent) return

    setIsSubmitting(true)
    try {
      await submitAnswer(quizId, {
        questionId: currentQuestion.id,
        answer: currentAnswer,
        timestamp: Date.now()
      })
      
      setSubmittedAnswers(prev => new Set([...prev, currentQuestion.id]))
      setCurrentAnswer('')
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOptionSelect = (optionId: string) => {
    if (!hasSubmittedCurrent) {
      setCurrentAnswer(optionId)
    }
  }

  if (!isConnected) {
    return (
      <Card className={`${className} ${getAgeBasedStyles('card')}`}>
        <CardContent className="pt-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={getAgeBasedAnimation('bounce')}
            className="text-center py-8"
          >
            <Loader2 className={`w-8 h-8 animate-spin mx-auto mb-4 ${getAgeBasedStyles('primary')}`} />
            <Typography variant="body1" className={getAgeBasedStyles('text')}>
              {getAgeBasedText('connecting', {
                young: 'Ansluter till quiz... 🔌',
                middle: 'Ansluter till quiz...',
                old: 'Ansluter till quiz...',
                adult: 'Ansluter till quiz...'
              })}
            </Typography>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={getAgeBasedAnimation('slideIn')}
      >
        <Card className={getAgeBasedStyles('card')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <Typography variant="body2" className={getAgeBasedStyles('text')}>
                  {ageGroup === 'young' ? `👋 Hej ${studentName}!` : `Ansluten som: ${studentName}`}
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${getAgeBasedStyles('mutedText')}`} />
                <Typography variant="body2" className={getAgeBasedStyles('mutedText')}>
                  {ageGroup === 'young' ? `👥 ${studentCount} elever` : `${studentCount} elever`}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quiz State */}
      {state.phase === 'idle' && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={getAgeBasedAnimation('bounce')}
        >
          <Card className={getAgeBasedStyles('card')}>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Clock className={`w-12 h-12 mx-auto mb-4 ${getAgeBasedStyles('mutedText')}`} />
                <Typography variant="body1" className={`font-medium mb-2 ${getAgeBasedStyles('text')}`}>
                  {getAgeBasedText('waiting', {
                    young: 'Väntar på att quizet ska starta ⏰',
                    middle: 'Väntar på att quizet ska starta',
                    old: 'Väntar på att quizet ska starta',
                    adult: 'Väntar på att quizet ska starta'
                  })}
                </Typography>
                <Typography variant="body2" className={getAgeBasedStyles('mutedText')}>
                  {getAgeBasedText('waitingSubtext', {
                    young: 'Läraren kommer starta quizet snart! 🚀',
                    middle: 'Läraren kommer starta quizet snart',
                    old: 'Läraren kommer starta quizet snart',
                    adult: 'Läraren kommer starta quizet snart'
                  })}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {state.phase === 'running' && currentQuestion && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={getAgeBasedAnimation('slideIn')}
        >
          <Card className={getAgeBasedStyles('card')}>
            <CardHeader>
              <CardTitle className={getAgeBasedStyles('questionTitle')}>
                {ageGroup === 'young' ? `🤔 ${currentQuestion.title} 🤔` : currentQuestion.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasSubmittedCurrent ? (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={getAgeBasedAnimation('celebration')}
                  className="text-center py-6"
                >
                  <CheckCircle className={`w-12 h-12 mx-auto mb-4 ${getAgeBasedStyles('success')}`} />
                  <Typography variant="body1" className={`font-medium ${getAgeBasedStyles('success')}`}>
                    {getAgeBasedText('submitted', {
                      young: 'Svar skickat! 🎉',
                      middle: 'Svar skickat!',
                      old: 'Svar skickat!',
                      adult: 'Svar skickat!'
                    })}
                  </Typography>
                  <Typography variant="body2" className={`mt-1 ${getAgeBasedStyles('mutedText')}`}>
                    {getAgeBasedText('waitingNext', {
                      young: 'Väntar på nästa fråga... ⏳',
                      middle: 'Väntar på nästa fråga...',
                      old: 'Väntar på nästa fråga...',
                      adult: 'Väntar på nästa fråga...'
                    })}
                  </Typography>
                </motion.div>
              ) : (
                <>
                  {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <AgeBasedButton
                          key={option.id}
                          ageGroup={ageGroup}
                          onClick={() => handleOptionSelect(option.id)}
                          variant={currentAnswer === option.id ? 'primary' : 'outline'}
                          className="w-full justify-start text-left h-auto py-3 px-4"
                          showConfetti={ageGroup === 'young' && currentAnswer === option.id}
                        >
                          {ageGroup === 'young' ? `🔤${String.fromCharCode(65 + index)}: ${option.text}` : `${String.fromCharCode(65 + index)}: ${option.text}`}
                        </AgeBasedButton>
                      ))}
                    </div>
                  )}

                {currentQuestion.type === 'free-text' && (
                  <div className="space-y-3">
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder={ageGroup === 'young' ? '✍️ Skriv ditt svar här...' : 'Skriv ditt svar här...'}
                      className={`w-full h-32 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:border-transparent ${
                        ageGroup === 'young' 
                          ? 'border-pink-300 bg-pink-50 focus:ring-pink-500 text-lg'
                          : 'border-neutral-300 focus:ring-primary-500'
                      }`}
                    />
                  </div>
                )}

                <AgeBasedButton
                  ageGroup={ageGroup}
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || isSubmitting}
                  className="w-full"
                  showConfetti={ageGroup === 'young' && !isSubmitting && !!currentAnswer.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {getAgeBasedText('submit', {
                    young: 'Skicka svar 📤',
                    middle: 'Skicka svar',
                    old: 'Skicka svar',
                    adult: 'Skicka svar'
                  })}
                </AgeBasedButton>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
      )}

      {state.phase === 'running' && !currentQuestion && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={getAgeBasedAnimation('bounce')}
        >
          <Card className={getAgeBasedStyles('card')}>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Loader2 className={`w-8 h-8 animate-spin mx-auto mb-4 ${getAgeBasedStyles('primary')}`} />
                <Typography variant="body1" className={getAgeBasedStyles('text')}>
                  {getAgeBasedText('loading', {
                    young: 'Laddar fråga... ⏳',
                    middle: 'Laddar fråga...',
                    old: 'Laddar fråga...',
                    adult: 'Laddar fråga...'
                  })}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {state.phase === 'ended' && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={getAgeBasedAnimation('celebration')}
        >
          <Card className={getAgeBasedStyles('card')}>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className={`w-12 h-12 mx-auto mb-4 ${getAgeBasedStyles('success')}`} />
                <Typography variant="body1" className={`font-medium ${getAgeBasedStyles('success')}`}>
                  {getAgeBasedText('ended', {
                    young: 'Quiz avslutat! 🎉',
                    middle: 'Quiz avslutat!',
                    old: 'Quiz avslutat!',
                    adult: 'Quiz avslutat!'
                  })}
                </Typography>
                <Typography variant="body2" className={`mt-1 ${getAgeBasedStyles('mutedText')}`}>
                  {getAgeBasedText('thanks', {
                    young: 'Tack för att du deltog! 🌟',
                    middle: 'Tack för att du deltog!',
                    old: 'Tack för att du deltog!',
                    adult: 'Tack för att du deltog!'
                  })}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}