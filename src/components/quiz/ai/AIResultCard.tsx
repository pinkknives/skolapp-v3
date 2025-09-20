'use client'

import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Question } from '@/types/quiz'

interface AIResultCardProps {
  question: Question
  isSelected: boolean
  onToggleSelect: () => void
  onEdit: () => void
  onRemove: () => void
}

export function AIResultCard({ 
  question, 
  isSelected, 
  onToggleSelect, 
  onEdit, 
  onRemove 
}: AIResultCardProps) {
  const getQuestionTypeLabel = (type: Question['type']) => {
    switch (type) {
      case 'multiple-choice':
        return 'Flerval'
      case 'free-text':
        return 'Fritext'
      case 'image':
        return 'Bild'
      default:
        return type
    }
  }

  const getQuestionTypeIcon = (type: Question['type']) => {
    switch (type) {
      case 'multiple-choice':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'free-text':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      case 'image':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 112.828 2.828L16 9.172a2 2 0 012.828 0L20 10m-6 6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
    }
  }

  return (
    <Card className={`transition-all duration-200 ${
      isSelected 
        ? 'border-primary-500 bg-primary-50 shadow-md' 
        : 'border-neutral-200 hover:border-neutral-300'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="w-4 h-4 text-primary-600 bg-white border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
                aria-describedby={`question-${question.id}-content`}
              />
              <div className="flex items-center gap-2 text-neutral-600 text-sm min-w-0">
                {getQuestionTypeIcon(question.type)}
                <span className="truncate">{getQuestionTypeLabel(question.type)}</span>
                <span className="text-neutral-400">•</span>
                <span className="whitespace-nowrap">{question.points} poäng</span>
              </div>
            </label>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="text-neutral-600 border-neutral-300 hover:bg-neutral-50"
              aria-label={`Redigera fråga: ${question.title}`}
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Redigera
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-error-600 border-error-300 hover:bg-error-50"
              aria-label={`Ta bort fråga: ${question.title}`}
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Kasta
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" id={`question-${question.id}-content`}>
        <Typography variant="body2" className="font-medium mb-3 text-neutral-900">
          {question.title}
        </Typography>
        
        {question.type === 'multiple-choice' && 'options' in question && question.options && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div
                key={option.id}
                className={`flex items-center gap-2 p-2 rounded text-sm ${
                  option.isCorrect 
                    ? 'bg-success-50 text-success-800 border border-success-200' 
                    : 'bg-neutral-50 text-neutral-700'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-xs font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option.text}</span>
                {option.isCorrect && (
                  <svg className="h-4 w-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
        
        {question.type === 'free-text' && 'expectedAnswer' in question && question.expectedAnswer && (
          <div className="bg-neutral-50 p-3 rounded border">
            <Typography variant="caption" className="text-neutral-600 mb-1 block">
              Förväntat svar:
            </Typography>
            <Typography variant="body2" className="text-neutral-800">
              {question.expectedAnswer}
            </Typography>
          </div>
        )}
        
        {question.rationale && (
          <div className="mt-3 p-3 bg-info-50 border border-info-200 rounded">
            <Typography variant="caption" className="text-info-800 mb-1 block font-medium">
              AI-förklaring:
            </Typography>
            <Typography variant="body2" className="text-info-700">
              {question.rationale}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  )
}