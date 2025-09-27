'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { AgeBasedButton } from '@/components/ui/AgeBasedButton'
import { useAgeBasedGamification } from '@/hooks/useAgeBasedGamification'
import { 
  Quiz, 
  QuizSession, 
  Student, 
  MultipleChoiceQuestion, 
  ImageQuestion,
  QuizTakingState,
  StudentAnswer
} from '@/types/quiz'
import { motion, AnimatePresence } from 'framer-motion'
import { logTelemetryEvent } from '@/lib/telemetry'

interface QuizTakingProps {
  quiz: Quiz
  session: QuizSession
  student: Student
  onComplete: (result: { answers: StudentAnswer[], timeSpent: number }) => void
  onExit: () => void
}

export function QuizTaking({ quiz, session, student, onComplete, onExit }: QuizTakingProps) {
  // Determine age group based on quiz grade level
  const getAgeGroup = (gradeLevel?: string): 'young' | 'middle' | 'old' | 'adult' => {
    if (!gradeLevel) return 'adult'
    const grade = parseInt(gradeLevel.replace(/\D/g, ''))
    if (grade <= 3) return 'young'
    if (grade <= 6) return 'middle'
    if (grade <= 9) return 'old'
    return 'adult'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ageGroup = getAgeGroup((quiz as any).gradeLevel || '6')
  const { showConfetti: _showConfetti, getCelebrationMessage: _getCelebrationMessage } = useAgeBasedGamification(ageGroup)

  // Age-based styling functions
  const getAgeBasedStyles = (type: string) => {
    switch (type) {
      case 'background':
        return ageGroup === 'adult' ? 'bg-gradient-to-br from-primary-50 to-neutral-50' : 'bg-gradient-to-br from-pink-50 to-purple-50'
      case 'card':
        return ageGroup === 'adult' ? 'bg-white shadow-sm' : 'bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg'
      case 'text':
        return ageGroup === 'adult' ? 'text-neutral-900' : 'text-pink-800 font-semibold'
      case 'mutedText':
        return ageGroup === 'adult' ? 'text-neutral-600' : 'text-pink-600'
      case 'title':
        return ageGroup === 'adult' ? 'text-2xl font-semibold text-neutral-900' : 'text-3xl font-bold text-pink-800'
      case 'questionTitle':
        return ageGroup === 'adult' ? 'text-xl font-semibold text-neutral-900' : 'text-2xl font-bold text-pink-800'
      case 'iconContainer':
        return ageGroup === 'adult' ? 'bg-success-100' : 'bg-pink-100'
      case 'progressBarBackground':
        return ageGroup === 'adult' ? 'bg-neutral-200' : 'bg-pink-200'
      case 'progressBarFill':
        return ageGroup === 'adult' ? 'bg-primary-500' : 'bg-pink-500'
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

  const [quizState, setQuizState] = useState<QuizTakingState>(() => ({
    quiz,
    session,
    student,
    progress: {
      currentQuestionIndex: 0,
      totalQuestions: quiz.questions.length,
      answers: [],
      startedAt: new Date(),
      timeElapsed: 0
    },
    status: 'starting'
  }))

  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('')
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [showFeedback, setShowFeedback] = useState(false)
  const [preferredLang, setPreferredLang] = useState<'sv'|'en'|'ar'|'uk'>('sv')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechRate, setSpeechRate] = useState(1)

  useEffect(() => {
    const loadLang = async () => {
      try {
        const resp = await fetch('/api/user/settings/lang')
        if (resp.ok) {
          const data = await resp.json()
          const lang = (data?.preferred_language || 'sv') as 'sv'|'en'|'ar'|'uk'
          setPreferredLang(lang)
        }
      } catch {}
    }
    loadLang()
  }, [])

  // Define current question before TTS hooks to avoid temporal ordering issues
  const currentQuestionIndex = quizState.progress.currentQuestionIndex
  const currentQuestion = quiz.questions[currentQuestionIndex]

  // Telemetry: detect long dwell on a question (e.g., >90s)
  const longDwellLoggedRef = React.useRef<Record<string, boolean>>({})
  useEffect(() => {
    const thresholdSeconds = 90
    const qid = currentQuestion.id
    if (longDwellLoggedRef.current[qid]) return
    const timer = setTimeout(() => {
      longDwellLoggedRef.current[qid] = true
      logTelemetryEvent('quiz_question_long_dwell', { questionId: qid, thresholdSeconds })
    }, thresholdSeconds * 1000)
    return () => clearTimeout(timer)
  }, [currentQuestion.id])

  const speakQuestion = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      const synth = window.speechSynthesis
      synth.cancel()
      const parts: string[] = []
      parts.push(currentQuestion.title)
      if (currentQuestion.type === 'multiple-choice') {
        const mc = currentQuestion as MultipleChoiceQuestion
        mc.options.forEach((opt, idx) => parts.push(`${String.fromCharCode(65+idx)}. ${opt.text}`))
      }
      if (currentQuestion.explanation) parts.push(currentQuestion.explanation)
      const utter = new SpeechSynthesisUtterance(parts.join('. '))
      const voices = synth.getVoices()
      const langPref = preferredLang === 'sv' ? ['sv-SE','sv']
        : preferredLang === 'en' ? ['en-GB','en-US','en']
        : preferredLang === 'ar' ? ['ar','ar-SA','ar-EG']
        : ['uk-UA','uk']
      utter.lang = langPref[0]
      const voice = voices.find(v => langPref.includes(v.lang)) || voices.find(v => v.lang.startsWith(langPref[0].split('-')[0])) || voices[0]
      if (voice) utter.voice = voice
      utter.rate = speechRate
      utter.onend = () => setIsSpeaking(false)
      utter.onerror = () => setIsSpeaking(false)
      synth.speak(utter)
      setIsSpeaking(true)
      logTelemetryEvent('tts_play', { lang: preferredLang, questionId: currentQuestion.id })
    } catch {}
  }, [currentQuestion, preferredLang, speechRate])

  const pauseTTS = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      window.speechSynthesis.pause()
      setIsSpeaking(false)
      logTelemetryEvent('tts_pause', { questionId: currentQuestion.id })
    } catch {}
  }, [currentQuestion.id])

  const resumeTTS = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      window.speechSynthesis.resume()
      setIsSpeaking(true)
      logTelemetryEvent('tts_resume', { questionId: currentQuestion.id })
    } catch {}
  }, [currentQuestion.id])

  const stopTTS = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      logTelemetryEvent('tts_stop', { questionId: currentQuestion.id })
    } catch {}
  }, [currentQuestion.id])

  // Handle different execution modes
  const isTeacherControlled = quiz.settings.executionMode === 'teacher-controlled'

  // For now, all modes use self-paced progression
  // TODO: Add teacher-controlled progression in future update
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

  // Timer for tracking time spent
  useEffect(() => {
    if (quiz.settings.gameMode === 'study') return
    const interval = setInterval(() => {
      setQuizState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          timeElapsed: prev.progress.timeElapsed + 1
        }
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [quiz.settings.gameMode])

  // Start the quiz
  useEffect(() => {
    if (quizState.status === 'starting') {
      setQuizState(prev => ({ ...prev, status: 'in-progress' }))
      setQuestionStartTime(Date.now())
    }
  }, [quizState.status])

  // Handle answer submission
  const proceedToNextQuestion = useCallback((updatedAnswers: StudentAnswer[], questionTimeSpent: number) => {
    if (isLastQuestion) {
      // Quiz completed
      setQuizState(prev => ({ 
        ...prev, 
        status: 'completed' 
      }))
      // Use callback to get current state instead of stale closure
      setQuizState(prev => {
        onComplete({
          answers: updatedAnswers,
          timeSpent: prev.progress.timeElapsed + questionTimeSpent
        })
        return prev
      })
    } else if (!isTeacherControlled) {
      // Move to next question (only in self-paced mode)
      setQuizState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          currentQuestionIndex: prev.progress.currentQuestionIndex + 1
        }
      }))
      setSelectedAnswer('')
      setQuestionStartTime(Date.now())
    } else {
      // In teacher-controlled mode, just wait for teacher to advance
      setSelectedAnswer('')
      setQuestionStartTime(Date.now())
    }
  }, [isLastQuestion, isTeacherControlled, onComplete])

  const handleAnswerSubmit = useCallback(() => {
    const questionTimeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    
    const answer: StudentAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      timeSpent: questionTimeSpent,
      answeredAt: new Date()
    }

    // Use state updater to get current answers
    setQuizState(prev => {
      const updatedAnswers = [...prev.progress.answers, answer]
      
      // Show immediate feedback if configured
      if (quiz.settings.showCorrectAnswers && currentQuestion.type === 'multiple-choice') {
        setShowFeedback(true)
        
        // Hide feedback after 2 seconds
        setTimeout(() => {
          setShowFeedback(false)
          proceedToNextQuestion(updatedAnswers, questionTimeSpent)
        }, 2000)
      } else {
        proceedToNextQuestion(updatedAnswers, questionTimeSpent)
      }

      return {
        ...prev,
        progress: {
          ...prev.progress,
          answers: updatedAnswers
        }
      }
    })
  }, [currentQuestion.id, selectedAnswer, questionStartTime, quiz.settings.showCorrectAnswers, currentQuestion.type, proceedToNextQuestion])

  // Handle multiple choice selection
  const handleMultipleChoiceSelect = (optionId: string) => {
    setSelectedAnswer(optionId)
  }

  // Handle free text input
  const handleFreeTextChange = (value: string) => {
    setSelectedAnswer(value)
  }

  // Check if answer is valid
  const isAnswerValid = () => {
    if (currentQuestion.type === 'free-text') {
      return typeof selectedAnswer === 'string' && selectedAnswer.trim().length > 0
    }
    return selectedAnswer !== '' && selectedAnswer !== undefined
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Render question based on type
  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
      case 'image':
        return <MultipleChoiceQuestionView 
          question={currentQuestion as MultipleChoiceQuestion | ImageQuestion}
          selectedAnswer={selectedAnswer as string}
          onAnswerSelect={handleMultipleChoiceSelect}
          showFeedback={showFeedback}
        />
      
      case 'free-text':
        return <FreeTextQuestionView 
          answer={selectedAnswer as string}
          onAnswerChange={handleFreeTextChange}
        />
      
      default:
        return null
    }
  }

  if (quizState.status === 'completed') {
    const completionText = getAgeBasedText('completion', {
      young: '🎉 Fantastiskt jobbat! Du klarade quizet! 🎉',
      middle: 'Bra jobbat! Du slutförde quizet framgångsrikt!',
      old: 'Utmärkt! Du har slutfört quizet.',
      adult: 'Quiz slutfört. Tack för ditt deltagande.'
    })

    return (
      <div className={`min-h-screen p-4 flex items-center justify-center ${getAgeBasedStyles('background')}`}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={getAgeBasedAnimation('celebration')}
          className="w-full max-w-md mx-auto"
        >
          <Card className={`${getAgeBasedStyles('card')} relative overflow-hidden`}>
            <CardHeader className="text-center">
              <motion.div
                variants={getAgeBasedAnimation('bounce')}
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getAgeBasedStyles('iconContainer')}`}
              >
                {ageGroup === 'adult' ? '✓' : ageGroup === 'middle' ? '⭐' : '🎉'}
              </motion.div>
              <CardTitle className={`${getAgeBasedStyles('title')} ${getAgeBasedStyles('text')}`}>
                {completionText}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Typography variant="body1" className={`${getAgeBasedStyles('text')} mb-4`}>
                {getAgeBasedText('completionSubtext', {
                  young: 'Du är så duktig! 🌟',
                  middle: 'Imponerande prestation!',
                  old: 'Bra genomfört.',
                  adult: 'Tack för ditt deltagande.'
                })}
              </Typography>
              <Typography variant="caption" className={`${getAgeBasedStyles('mutedText')} block mb-6`}>
                Tid: {formatTime(quizState.progress.timeElapsed)}
              </Typography>
              <AgeBasedButton
                ageGroup={ageGroup}
                variant="primary"
                onClick={onExit}
                showConfetti={ageGroup === 'adult' ? false : true}
              >
                {getAgeBasedText('action', {
                  young: 'Tillbaka 🏠',
                  middle: 'Tillbaka',
                  old: 'Tillbaka',
                  adult: 'Tillbaka'
                })}
              </AgeBasedButton>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-4 ${getAgeBasedStyles('background')}`}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={getAgeBasedAnimation('slideIn')}
          className={`flex items-center justify-between rounded-lg p-4 ${getAgeBasedStyles('card')}`}
        >
          <div>
            <Typography variant={ageGroup === 'adult' ? 'h6' : 'h5'} className={getAgeBasedStyles('title')}>
              {ageGroup === 'adult' ? quiz.title : `🌟 ${quiz.title} 🌟`}
            </Typography>
            <Typography variant="caption" className={getAgeBasedStyles('mutedText')}>
              {ageGroup === 'adult' ? student.alias : `👋 Hej ${student.alias}!`}
            </Typography>
          </div>
          <div className="text-right">
            <Typography variant="body2" className={getAgeBasedStyles('text')}>
              {getAgeBasedText('progress', {
                young: `Fråga ${currentQuestionIndex + 1} av ${quizState.progress.totalQuestions} 📝`,
                middle: `Fråga ${currentQuestionIndex + 1} av ${quizState.progress.totalQuestions}`,
                old: `Fråga ${currentQuestionIndex + 1} av ${quizState.progress.totalQuestions}`,
                adult: `Fråga ${currentQuestionIndex + 1} av ${quizState.progress.totalQuestions}`
              })}
            </Typography>
            <Typography variant="caption" className={getAgeBasedStyles('mutedText')}>
              {ageGroup === 'adult' ? `Tid: ${formatTime(quizState.progress.timeElapsed)}` : `⏰ ${formatTime(quizState.progress.timeElapsed)}`}
            </Typography>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={getAgeBasedAnimation('slideIn')}
          className={`rounded-lg p-4 ${getAgeBasedStyles('card')}`}
        >
          <div className="flex items-center justify-between mb-2">
            <Typography variant="caption" className={getAgeBasedStyles('text')}>
              {getAgeBasedText('progressLabel', {
                young: 'Framsteg 🚀',
                middle: 'Framsteg',
                old: 'Framsteg',
                adult: 'Framsteg'
              })}
            </Typography>
            <Typography variant="caption" className={getAgeBasedStyles('text')}>
              {Math.round((quizState.progress.currentQuestionIndex / quizState.progress.totalQuestions) * 100)}%
            </Typography>
          </div>
          <div className={`w-full rounded-full ${getAgeBasedStyles('progressBarBackground')}`}>
            <motion.div 
              className={`h-2 rounded-full ${getAgeBasedStyles('progressBarFill')}`}
              initial={{ width: 0 }}
              animate={{ 
                width: `${(currentQuestionIndex / quizState.progress.totalQuestions) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={getAgeBasedAnimation('questionTransition')}
          >
            <Card className={`${getAgeBasedStyles('card')} relative overflow-hidden`}>
              <CardHeader>
                <CardTitle className={`text-center mb-4 ${getAgeBasedStyles('questionTitle')}`}>
                  {ageGroup === 'adult' ? currentQuestion.title : `🤔 ${currentQuestion.title} 🤔`}
                </CardTitle>
                <div className="flex items-center justify-center gap-3 mt-2" aria-label="Uppläsning">
                  <button type="button" onClick={isSpeaking ? stopTTS : speakQuestion} className="px-3 py-1 rounded border text-sm">
                    {isSpeaking ? 'Stoppa uppläsning' : 'Läs upp frågan'}
                  </button>
                  <button type="button" onClick={resumeTTS} className="px-3 py-1 rounded border text-sm" disabled={isSpeaking}>Fortsätt</button>
                  <button type="button" onClick={pauseTTS} className="px-3 py-1 rounded border text-sm">Pausa</button>
                  <label className="flex items-center gap-2 text-sm">
                    Hastighet
                    <input type="range" min={0.6} max={1.4} step={0.1} value={speechRate} onChange={(e) => setSpeechRate(Number(e.target.value))} aria-label="Läshastighet" />
                  </label>
                </div>
                <div className={`flex justify-center space-x-4 text-sm ${getAgeBasedStyles('mutedText')}`}>
                  <span>
                    {ageGroup === 'adult' ? `${currentQuestion.points} poäng` : `⭐ ${currentQuestion.points} poäng`}
                  </span>
                  {currentQuestion.timeLimit && (
                    <span>
                      {ageGroup === 'adult' ? `${currentQuestion.timeLimit}s tidsgräns` : `⏰ ${currentQuestion.timeLimit}s`}
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {renderQuestion()}
                
                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
                  <AgeBasedButton
                    ageGroup={ageGroup}
                    variant="outline"
                    onClick={onExit}
                  >
                    {getAgeBasedText('exit', {
                      young: 'Avsluta Quiz 🚪',
                      middle: 'Avsluta Quiz',
                      old: 'Avsluta Quiz',
                      adult: 'Avsluta Quiz'
                    })}
                  </AgeBasedButton>
                  
                  <AgeBasedButton
                    ageGroup={ageGroup}
                    variant="primary"
                    onClick={handleAnswerSubmit}
                    disabled={!isAnswerValid()}
                    size="lg"
                    showConfetti={ageGroup === 'adult' ? false : isAnswerValid()}
                  >
                    {quiz.settings.gameMode === 'accuracy' ? (
                      'Spara svar'
                    ) : getAgeBasedText('submit', {
                      young: isTeacherControlled 
                        ? 'Skicka svar 📤' 
                        : isLastQuestion 
                          ? 'Slutför Quiz 🎉' 
                          : 'Nästa Fråga ➡️',
                      middle: isTeacherControlled 
                        ? 'Skicka svar' 
                        : isLastQuestion 
                          ? 'Slutför Quiz' 
                          : 'Nästa Fråga',
                      old: isTeacherControlled 
                        ? 'Skicka svar' 
                        : isLastQuestion 
                          ? 'Slutför Quiz' 
                          : 'Nästa Fråga',
                      adult: isTeacherControlled 
                        ? 'Skicka svar' 
                        : isLastQuestion 
                          ? 'Slutför Quiz' 
                          : 'Nästa Fråga'
                    })}
                  </AgeBasedButton>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Multiple Choice Question Component
function MultipleChoiceQuestionView({ 
  question, 
  selectedAnswer, 
  onAnswerSelect,
  showFeedback = false
}: {
  question: MultipleChoiceQuestion | ImageQuestion
  selectedAnswer: string
  onAnswerSelect: (optionId: string) => void
  showFeedback?: boolean
}) {
  // Get age group from parent component context or default to adult
  const ageGroup = 'adult' // This should be passed down from parent
  
  return (
    <div className="space-y-6">
      {/* Image for image questions */}
      {question.type === 'image' && (question as ImageQuestion).imageUrl && (
        <div className="flex justify-center">
          <Image
            src={(question as ImageQuestion).imageUrl!}
            alt={(question as ImageQuestion).imageAlt || 'Frågans bild'}
            width={800}
            height={400}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 800px"
            className="max-w-full max-h-96 rounded-lg shadow-md object-contain"
            priority={false}
          />
        </div>
      )}
      
      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(question.options || []).map((option, index) => (
          <motion.div
            key={option.id}
            whileHover={{ scale: (ageGroup as string) === 'young' ? 1.05 : 1.02 }}
            whileTap={{ scale: (ageGroup as string) === 'young' ? 0.95 : 0.98 }}
          >
            <button
              onClick={() => onAnswerSelect(option.id)}
              disabled={showFeedback}
              className={`w-full p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                showFeedback && option.isCorrect
                  ? 'border-success-500 bg-success-50 text-success-800'
                  : showFeedback && selectedAnswer === option.id && !option.isCorrect
                  ? 'border-error-500 bg-error-50 text-error-800'
                  : selectedAnswer === option.id
                  ? 'border-primary-500 bg-primary-50 text-primary-800'
                  : 'border-neutral-300 bg-white hover:border-primary-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  showFeedback && option.isCorrect
                    ? 'bg-success-500'
                    : showFeedback && selectedAnswer === option.id && !option.isCorrect
                    ? 'bg-error-500'
                    : selectedAnswer === option.id 
                    ? 'bg-primary-500' 
                    : 'bg-neutral-400'
                }`}>
                  {showFeedback && option.isCorrect && (
                    <span className="text-lg">
                      {ageGroup === 'adult' ? '✓' : '✅'}
                    </span>
                  )}
                  {showFeedback && selectedAnswer === option.id && !option.isCorrect && (
                    <span className="text-lg">
                      {ageGroup === 'adult' ? '✗' : '❌'}
                    </span>
                  )}
                  {!showFeedback && (
                    <span className={ageGroup === 'adult' ? '' : 'text-lg'}>
                      {ageGroup === 'adult' ? String.fromCharCode(65 + index) : `🔤${String.fromCharCode(65 + index)}`}
                    </span>
                  )}
                </div>
                <Typography variant={ageGroup === 'adult' ? 'h6' : 'h5'} className="flex-1">
                  {ageGroup === 'adult' ? option.text : `🎯 ${option.text}`}
                </Typography>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Free Text Question Component
function FreeTextQuestionView({ 
  answer, 
  onAnswerChange 
}: {
  answer: string
  onAnswerChange: (value: string) => void
}) {
  // Get age group from parent component context or default to adult
  const ageGroup = 'adult' // This should be passed down from parent
  
  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg ${ageGroup === 'adult' ? 'bg-neutral-50' : 'bg-pink-50 border-2 border-pink-200'}`}>
        <Typography variant="body2" className={ageGroup === 'adult' ? 'text-neutral-600' : 'text-pink-700'}>
          {ageGroup === 'adult' 
            ? 'Skriv ditt svar i textfältet nedan. Var så detaljerad som möjligt.'
            : '✏️ Skriv ditt svar i textfältet nedan. Berätta så mycket du kan! 🌟'
          }
        </Typography>
      </div>
      
      <textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder={ageGroup === 'adult' ? 'Skriv ditt svar här...' : '✍️ Skriv ditt svar här...'}
        rows={ageGroup === 'adult' ? 6 : 8}
        className={`flex w-full rounded-md border px-3 py-2 text-sm transition-all duration-200 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
          ageGroup === 'adult' 
            ? 'border-neutral-300 bg-white hover:border-neutral-400 focus:border-primary-500 focus-visible:ring-primary-500'
            : 'border-pink-300 bg-pink-50 hover:border-pink-400 focus:border-pink-500 focus-visible:ring-pink-500 text-lg'
        }`}
      />
    </div>
  )
}