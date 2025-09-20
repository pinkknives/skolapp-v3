'use client'

import React from 'react'
import { Typography } from '@/components/ui/Typography'
import { Question } from '@/types/quiz'
import { AIResultCard } from './AIResultCard'

interface AIResultListProps {
  questions: Question[]
  selectedQuestions: Set<string>
  onToggleSelect: (questionId: string) => void
  onEditQuestion: (question: Question) => void
  onRemoveQuestion: (questionId: string) => void
}

export function AIResultList({ 
  questions, 
  selectedQuestions, 
  onToggleSelect, 
  onEditQuestion, 
  onRemoveQuestion 
}: AIResultListProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <Typography variant="body1" className="text-neutral-600 mb-2">
          Inga frågor genererade ännu
        </Typography>
        <Typography variant="body2" className="text-neutral-500">
          Använd formuläret ovan för att generera AI-frågor
        </Typography>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="body1" className="font-medium text-neutral-900">
          {questions.length} genererade frågor
        </Typography>
        <Typography variant="body2" className="text-neutral-600">
          {selectedQuestions.size} valda
        </Typography>
      </div>
      
      <div className="space-y-3" role="list" aria-label="Genererade AI-frågor">
        {questions.map((question) => (
          <div key={question.id} role="listitem">
            <AIResultCard
              question={question}
              isSelected={selectedQuestions.has(question.id)}
              onToggleSelect={() => onToggleSelect(question.id)}
              onEdit={() => onEditQuestion(question)}
              onRemove={() => onRemoveQuestion(question.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}