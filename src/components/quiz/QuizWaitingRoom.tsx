'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Quiz, QuizSession, Student } from '@/types/quiz'
import { formatExecutionMode } from '@/lib/quiz-utils'
import { motion } from 'framer-motion'

interface QuizWaitingRoomProps {
  quiz: Quiz
  session: QuizSession
  student: Student
  onLeaveQuiz: () => void
}

export function QuizWaitingRoom({ quiz, session, student, onLeaveQuiz }: QuizWaitingRoomProps) {
  const router = useRouter()
  const executionModeText = formatExecutionMode(quiz.settings.executionMode)
  const handleStartQuiz = () => {
    // Store quiz data in session storage for the quiz taking page
    sessionStorage.setItem('current_quiz', JSON.stringify(quiz))
    sessionStorage.setItem('current_session', JSON.stringify(session))
    sessionStorage.setItem('current_student', JSON.stringify(student))
    
    // Navigate to quiz taking page
    router.push('/quiz/take')
  }
  
  const getWaitingMessage = () => {
    switch (quiz.settings.executionMode) {
      case 'self-paced':
        return 'Du kan starta quizet när du vill.'
      case 'teacher-controlled':
        return 'Vänta på att läraren startar quizet.'
      case 'teacher-review':
        return 'Läraren kommer att granska dina svar innan du ser resultat.'
      default:
        return 'Vänta på instruktioner från läraren.'
    }
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <motion.div
            className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4"
            variants={pulseVariants}
            animate="pulse"
          >
            <svg className="h-8 w-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          
          <CardTitle className="text-xl">Ansluten till Quiz!</CardTitle>
          
          <div className="space-y-2 mt-4">
            <Typography variant="body2" className="text-neutral-600">
              <strong>{quiz.title}</strong>
            </Typography>
            <Typography variant="caption" className="text-neutral-500 block">
              {quiz.description}
            </Typography>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Student Info */}
          <div className="text-center p-3 bg-neutral-50 rounded-lg">
            <Typography variant="caption" className="text-neutral-500 block mb-1">
              Ditt namn
            </Typography>
            <Typography variant="body2" className="font-medium">
              {student.alias}
            </Typography>
          </div>

          {/* Quiz Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-neutral-100">
              <Typography variant="caption" className="text-neutral-600">
                Frågor
              </Typography>
              <Typography variant="caption" className="font-medium">
                {quiz.questions.length}
              </Typography>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-neutral-100">
              <Typography variant="caption" className="text-neutral-600">
                Typ
              </Typography>
              <Typography variant="caption" className="font-medium">
                {executionModeText}
              </Typography>
            </div>
            
            {quiz.settings.timeLimit && (
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <Typography variant="caption" className="text-neutral-600">
                  Tidsgräns
                </Typography>
                <Typography variant="caption" className="font-medium">
                  {quiz.settings.timeLimit} min
                </Typography>
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <Typography variant="body2" className="text-primary-800 mb-2">
              {getWaitingMessage()}
            </Typography>
            
            {quiz.settings.executionMode === 'teacher-controlled' && (
              <div className="flex items-center justify-center space-x-2 mt-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <Typography variant="caption" className="text-primary-600">
                  Väntar på läraren...
                </Typography>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {quiz.settings.executionMode === 'self-paced' && (
              <Button
                size="lg"
                fullWidth
                onClick={handleStartQuiz}
              >
                Starta Quiz
              </Button>
            )}
            
            <Button
              variant="outline"
              fullWidth
              onClick={onLeaveQuiz}
            >
              Lämna Quiz
            </Button>
          </div>

          {/* Helper Text */}
          <div className="text-center">
            <Typography variant="caption" className="text-neutral-500">
              Håll den här sidan öppen. Du kommer att få en notis när quizet startar.
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}