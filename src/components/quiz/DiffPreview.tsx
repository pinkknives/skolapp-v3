'use client'

import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { CheckCircle, XCircle, AlertCircle, Plus, Replace } from 'lucide-react'
import { aiAssistant } from '@/locales/sv/quiz'

interface DiffPreviewProps {
  /** Original text */
  before: string
  /** Modified text */
  after: string
  /** List of improvements made */
  improvements?: string[]
  /** Title for the diff */
  title: string
  /** Description of what changed */
  description?: string
  /** Callback when user chooses to insert */
  onInsert: () => void
  /** Callback when user chooses to replace */
  onReplace: () => void
  /** Callback when user cancels */
  onCancel: () => void
  /** Loading state */
  loading?: boolean
  /** ARIA live region for screen readers */
  'aria-live'?: 'polite' | 'assertive'
}

export function DiffPreview({
  before,
  after,
  improvements = [],
  title,
  description,
  onInsert,
  onReplace,
  onCancel,
  loading = false,
  'aria-live': ariaLive = 'polite'
}: DiffPreviewProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  
  // Focus management - move focus to the diff when it appears
  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [])

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diff-title"
      aria-describedby="diff-description"
    >
      <Card 
        ref={dialogRef}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        tabIndex={-1}
      >
        <CardHeader>
          <CardTitle id="diff-title" className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary-600" />
            {title}
          </CardTitle>
          {description && (
            <Typography variant="body2" id="diff-description" className="text-neutral-600">
              {description}
            </Typography>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* AI Disclaimer */}
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div>
                <Typography variant="body2" className="font-medium text-warning-800">
                  {aiAssistant.disclaimer.title}
                </Typography>
                <Typography variant="caption" className="text-warning-700">
                  {aiAssistant.disclaimer.description}
                </Typography>
              </div>
            </div>
          </div>

          {/* Before/After Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Before */}
            <div>
              <Typography variant="body2" className="font-medium text-neutral-700 mb-3">
                {aiAssistant.hints.diff.beforeLabel}
              </Typography>
              <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                <Typography variant="body2" className="text-neutral-800 whitespace-pre-wrap">
                  {before}
                </Typography>
              </div>
            </div>

            {/* After */}
            <div>
              <Typography variant="body2" className="font-medium text-neutral-700 mb-3">
                {aiAssistant.hints.diff.afterLabel}
              </Typography>
              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                <Typography variant="body2" className="text-neutral-800 whitespace-pre-wrap">
                  {after}
                </Typography>
              </div>
            </div>
          </div>

          {/* Improvements List */}
          {improvements.length > 0 && (
            <div>
              <Typography variant="body2" className="font-medium text-neutral-700 mb-3">
                {aiAssistant.hints.diff.improvementsLabel}
              </Typography>
              <ul className="bg-info-50 border border-info-200 rounded-lg p-4 space-y-2">
                {improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-info-600 flex-shrink-0 mt-0.5" />
                    <Typography variant="caption" className="text-info-800">
                      {improvement}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <Typography variant="body2" className="font-medium text-neutral-700 mb-4">
              {aiAssistant.hints.diff.actionsTitle}
            </Typography>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onInsert}
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 text-white gap-x-2"
                aria-label={aiAssistant.hints.diff.insertTooltip}
              >
                <Plus className="h-4 w-4" />
                {aiAssistant.hints.diff.insertButton}
              </Button>
              
              <Button
                onClick={onReplace}
                disabled={loading}
                variant="outline"
                className="border-success-300 text-success-700 hover:bg-success-50 gap-x-2"
                aria-label={aiAssistant.hints.diff.replaceTooltip}
              >
                <Replace className="h-4 w-4" />
                {aiAssistant.hints.diff.replaceButton}
              </Button>
              
              <Button
                onClick={onCancel}
                disabled={loading}
                variant="outline"
                className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 gap-x-2"
                aria-label={aiAssistant.hints.diff.cancelTooltip}
              >
                <XCircle className="h-4 w-4" />
                {aiAssistant.hints.diff.cancelButton}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live region for screen readers */}
      <div 
        aria-live={ariaLive}
        aria-atomic="true"
        className="sr-only"
      >
        {loading ? 'AI förslag laddas...' : 'AI förslag visat'}
      </div>
    </div>
  )
}

export default DiffPreview