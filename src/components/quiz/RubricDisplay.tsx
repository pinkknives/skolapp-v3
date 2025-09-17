'use client'

import React from 'react'
import { Typography } from '@/components/ui/Typography'
import { Rubric, RubricEvaluation } from '@/types/quiz'

interface RubricDisplayProps {
  rubric: Rubric
  evaluation?: RubricEvaluation
  className?: string
}

export function RubricDisplay({ rubric, evaluation, className = '' }: RubricDisplayProps) {
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = score / maxScore
    if (percentage >= 0.8) return 'text-success-600'
    if (percentage >= 0.6) return 'text-warning-600'
    return 'text-error-600'
  }

  const getScoreIcon = (met: boolean) => {
    return met ? (
      <svg className="h-4 w-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="h-4 w-4 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }

  return (
    <div className={`bg-purple-50 border border-purple-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <Typography variant="body2" className="font-medium text-purple-800">
          Bedömningskriterier
        </Typography>
      </div>

      <div className="space-y-3">
        {rubric.criteria.map((criterion, index) => {
          const criterionResult = evaluation?.criteriaResults.find(r => r.criterionId === criterion.id)
          
          return (
            <div key={criterion.id} className="bg-white p-3 rounded border border-purple-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <Typography variant="caption" className="font-medium text-neutral-700">
                      Kriterium {index + 1} (vikt: {criterion.weight})
                    </Typography>
                    {criterionResult && (
                      <div className="ml-2 flex items-center">
                        {getScoreIcon(criterionResult.met)}
                        <span className={`ml-1 text-sm font-medium ${getScoreColor(criterionResult.score, criterion.weight)}`}>
                          {criterionResult.score}/{criterion.weight}
                        </span>
                      </div>
                    )}
                  </div>
                  <Typography variant="caption" className="text-neutral-600">
                    {criterion.text}
                  </Typography>
                  {criterion.example && (
                    <div className="mt-1">
                      <Typography variant="caption" className="text-neutral-500 italic">
                        Exempel: {criterion.example}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>

              {criterionResult && (
                <div className="mt-2 pt-2 border-t border-purple-100">
                  <Typography variant="caption" className="text-purple-700">
                    AI-bedömning: {criterionResult.explanation}
                  </Typography>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {evaluation && (
        <div className="mt-4 pt-3 border-t border-purple-200">
          <Typography variant="caption" className="text-purple-700">
            <strong>Sammanfattning:</strong> {evaluation.overallJustification}
          </Typography>
        </div>
      )}
    </div>
  )
}