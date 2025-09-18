'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Quiz } from '@/types/quiz'
import { QuizMobilePreview } from './QuizMobilePreview'
import { QuizClassroomPreview } from './QuizClassroomPreview'
import { trapFocus, prefersReducedMotion } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface QuizPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  quiz: Partial<Quiz>
}

type PreviewMode = 'mobile' | 'classroom'

export function QuizPreviewModal({ isOpen, onClose, quiz }: QuizPreviewModalProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('mobile')
  const modalRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      
      // Focus trap
      const cleanup = modalRef.current ? trapFocus(modalRef.current) : undefined
      
      // Focus the close button initially
      setTimeout(() => closeBtnRef.current?.focus(), 100)
      
      return () => {
        cleanup?.()
        document.body.style.overflow = 'unset'
      }
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const reducedMotion = prefersReducedMotion()

  return (
    <div 
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
      aria-labelledby="preview-title"
      aria-describedby="preview-description"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
      />
      
      {/* Modal Content */}
      <motion.div 
        ref={modalRef}
        className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.95, y: reducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.95, y: reducedMotion ? 0 : 20 }}
        transition={{ 
          duration: reducedMotion ? 0.01 : 0.3,
          ease: [0.16, 1, 0.3, 1] // Custom ease for smooth feel
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <Typography 
              variant="h5" 
              className="font-semibold mb-1"
              id="preview-title"
            >
              Förhandsgranskning
            </Typography>
            <Typography 
              variant="body2" 
              className="text-neutral-600"
              id="preview-description"
            >
              Se hur ditt quiz kommer att se ut för eleverna
            </Typography>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`px-3 py-2 rounded text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  previewMode === 'mobile'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                aria-pressed={previewMode === 'mobile'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                </svg>
                Mobilvy
              </button>
              <button
                onClick={() => setPreviewMode('classroom')}
                className={`px-3 py-2 rounded text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  previewMode === 'classroom'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                aria-pressed={previewMode === 'classroom'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Klassrumsvy
              </button>
            </div>

            {/* Close button */}
            <Button
              ref={closeBtnRef}
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Stäng förhandsgranskning"
              className="text-neutral-500 hover:text-neutral-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={previewMode}
              initial={{ opacity: 0, x: reducedMotion ? 0 : (previewMode === 'mobile' ? -20 : 20) }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reducedMotion ? 0 : (previewMode === 'mobile' ? 20 : -20) }}
              transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
            >
              {previewMode === 'mobile' ? (
                <QuizMobilePreview quiz={quiz} />
              ) : (
                <QuizClassroomPreview quiz={quiz} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}