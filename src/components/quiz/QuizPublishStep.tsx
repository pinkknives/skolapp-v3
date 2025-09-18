'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Quiz, QuizStatus } from '@/types/quiz'
import { calculateTotalPoints, estimateCompletionTime, formatExecutionMode, generateShareCode } from '@/lib/quiz-utils'
import QRCode from 'qrcode'

interface QuizPublishStepProps {
  quiz: Partial<Quiz>
  onChange: (updates: Partial<Quiz>) => void
  onValidationChange: (isValid: boolean) => void
}

export function QuizPublishStep({ quiz, onChange, onValidationChange }: QuizPublishStepProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [isValidated, setIsValidated] = useState(false)
  const [shareCode, setShareCode] = useState<string>('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showSharingPanel, setShowSharingPanel] = useState(false)
  const [status, setStatus] = useState<QuizStatus>(quiz.status || 'draft')

  // Validate on mount and changes
  useEffect(() => {
    const isValid = !!(
      quiz.title &&
      quiz.title.trim().length > 0 &&
      quiz.questions &&
      quiz.questions.length > 0
    )
    setIsValidated(isValid)
    onValidationChange(isValid)
  }, [quiz.title, quiz.questions, onValidationChange])

  // Generate share code and QR code when quiz is ready
  useEffect(() => {
    if (isValidated && !shareCode) {
      const newShareCode = quiz.shareCode || generateShareCode()
      setShareCode(newShareCode)
      
      // Update quiz with share code if it doesn't have one
      if (!quiz.shareCode) {
        onChange({ shareCode: newShareCode })
      }
    }
  }, [isValidated, shareCode, quiz.shareCode, onChange])

  // Generate QR code when share code is available
  useEffect(() => {
    if (shareCode && typeof window !== 'undefined') {
      const joinUrl = `${window.location.origin}/quiz/join/${shareCode}`
      QRCode.toDataURL(joinUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e40af', // primary-800
          light: '#ffffff'
        }
      }).then(setQrCodeUrl).catch(console.error)
    }
  }, [shareCode])

  const handlePublish = () => {
    setStatus('published')
    onChange({ 
      status: 'published',
      shareCode,
      updatedAt: new Date()
    })
    setShowSharingPanel(true)
  }

  const handleUnpublish = () => {
    setStatus('draft')
    onChange({ 
      status: 'draft',
      updatedAt: new Date()
    })
    setShowSharingPanel(false)
  }

  const totalPoints = quiz.questions ? calculateTotalPoints(quiz.questions) : 0
  const estimatedTime = quiz.questions ? estimateCompletionTime(quiz.questions) : 0

  const previewData = {
    title: quiz.title || 'Untitled Quiz',
    description: quiz.description || 'Ingen beskrivning',
    questionCount: quiz.questions?.length || 0,
    totalPoints,
    estimatedTime,
    executionMode: quiz.settings?.executionMode || 'self-paced',
    tags: quiz.tags || [],
    timeLimit: quiz.settings?.timeLimit
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-success-50 border-success-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <Typography variant="h5" className="text-success-900 font-semibold mb-2">
                Granska och publicera
              </Typography>
              <Typography variant="body2" className="text-success-700">
                Kontrollera att allt ser bra ut innan du publicerar quizet för dina elever.
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview toggles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Förhandsgranskning</CardTitle>
            <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  previewMode === 'desktop'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Klassvy
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  previewMode === 'mobile'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                </svg>
                Mobilvy
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`mx-auto transition-all duration-300 ${
            previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
          }`}>
            {/* Preview Card */}
            <div className={`bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200 overflow-hidden ${
              previewMode === 'mobile' ? 'p-4' : 'p-6'
            }`}>
              {/* Quiz Header */}
              <div className="text-center mb-6">
                <Typography 
                  variant={previewMode === 'mobile' ? 'h6' : 'h4'} 
                  className="text-primary-900 font-bold mb-2"
                >
                  {previewData.title}
                </Typography>
                <Typography 
                  variant={previewMode === 'mobile' ? 'caption' : 'body2'} 
                  className="text-primary-700"
                >
                  {previewData.description}
                </Typography>
              </div>

              {/* Stats */}
              <div className={`grid ${previewMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'} gap-4 mb-6`}>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-primary-800">
                    {previewData.questionCount}
                  </div>
                  <div className="text-xs text-primary-600">
                    {previewData.questionCount === 1 ? 'fråga' : 'frågor'}
                  </div>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-primary-800">
                    {previewData.totalPoints}
                  </div>
                  <div className="text-xs text-primary-600">poäng</div>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-primary-800">
                    {previewData.estimatedTime}
                  </div>
                  <div className="text-xs text-primary-600">min</div>
                </div>
                {previewMode === 'desktop' && (
                  <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                    <div className="text-sm font-medium text-primary-800">
                      {formatExecutionMode(previewData.executionMode)}
                    </div>
                    <div className="text-xs text-primary-600">läge</div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {previewData.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {previewData.tags.slice(0, previewMode === 'mobile' ? 3 : 6).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-200 text-primary-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {previewData.tags.length > (previewMode === 'mobile' ? 3 : 6) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-200 text-neutral-600">
                        +{previewData.tags.length - (previewMode === 'mobile' ? 3 : 6)} till
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Start button preview */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center gap-2 bg-primary-600 text-white rounded-lg font-medium transition-colors ${
                  previewMode === 'mobile' ? 'px-6 py-3 text-sm' : 'px-8 py-4'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Starta quiz
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary and checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Slutkontroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Validation checklist */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  quiz.title ? 'bg-success-100 text-success-600' : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {quiz.title ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 bg-neutral-400 rounded-full" />
                  )}
                </div>
                <Typography variant="body2" className={quiz.title ? 'text-neutral-900' : 'text-neutral-500'}>
                  Quiz har en titel
                </Typography>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  (quiz.questions && quiz.questions.length > 0) ? 'bg-success-100 text-success-600' : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {(quiz.questions && quiz.questions.length > 0) ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 bg-neutral-400 rounded-full" />
                  )}
                </div>
                <Typography variant="body2" className={(quiz.questions && quiz.questions.length > 0) ? 'text-neutral-900' : 'text-neutral-500'}>
                  Minst en fråga har lagts till
                </Typography>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-success-100 text-success-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <Typography variant="body2" className="text-neutral-900">
                  Genomförandeläge är valt
                </Typography>
              </div>
            </div>

            {/* Quick stats summary */}
            <div className="bg-neutral-50 rounded-lg p-4 mt-6">
              <Typography variant="body2" className="font-medium mb-2">
                Sammanfattning
              </Typography>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Frågor:</span>
                  <span className="ml-2 font-medium">{previewData.questionCount}</span>
                </div>
                <div>
                  <span className="text-neutral-600">Poäng:</span>
                  <span className="ml-2 font-medium">{previewData.totalPoints}</span>
                </div>
                <div>
                  <span className="text-neutral-600">Tid:</span>
                  <span className="ml-2 font-medium">
                    {previewData.timeLimit ? `${previewData.timeLimit} min` : `~${previewData.estimatedTime} min`}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-600">Läge:</span>
                  <span className="ml-2 font-medium">{formatExecutionMode(previewData.executionMode)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final validation message */}
      {isValidated ? (
        <Card className="bg-success-50 border-success-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <Typography variant="body2" className="font-medium text-success-800">
                  Allt ser bra ut! Klart att publicera
                </Typography>
                <Typography variant="caption" className="text-success-700">
                  Ditt quiz är redo att delas med eleverna
                </Typography>
              </div>
              <div className="flex gap-2">
                {status === 'draft' ? (
                  <Button
                    onClick={handlePublish}
                    className="bg-success-600 hover:bg-success-700 text-white"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Publicera quiz
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowSharingPanel(!showSharingPanel)}
                      className="border-success-300 text-success-700 hover:bg-success-50"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      {showSharingPanel ? 'Dölj delning' : 'Dela quiz'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleUnpublish}
                      className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      Avpublicera
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-warning-50 border-warning-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <Typography variant="body2" className="font-medium text-warning-800">
                  Några saker behöver fixas först
                </Typography>
                <Typography variant="caption" className="text-warning-700">
                  Gå tillbaka till tidigare steg för att komplettera informationen
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sharing Panel */}
      {status === 'published' && showSharingPanel && shareCode && (
        <Card className="bg-primary-50 border-primary-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Dela ditt quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Quiz Code */}
              <div className="text-center">
                <Typography variant="body2" className="font-medium mb-2">
                  Quiz-kod
                </Typography>
                <div className="inline-flex items-center bg-white rounded-lg px-6 py-4 shadow-sm border border-primary-200">
                  <span className="text-2xl font-bold text-primary-900 tracking-wider">
                    {shareCode}
                  </span>
                </div>
                <Typography variant="caption" className="text-primary-700 mt-2 block">
                  Eleverna kan gå med genom att ange denna kod på quiz/join
                </Typography>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="text-center">
                  <Typography variant="body2" className="font-medium mb-4">
                    QR-kod
                  </Typography>
                  <div className="inline-block bg-white p-4 rounded-lg shadow-sm border border-primary-200">
                    <img 
                      src={qrCodeUrl} 
                      alt={`QR kod för quiz: ${shareCode}`}
                      className="mx-auto"
                      width={200}
                      height={200}
                    />
                  </div>
                  <Typography variant="caption" className="text-primary-700 mt-2 block">
                    Scanna med mobilen för direkt åtkomst
                  </Typography>
                </div>
              )}

              {/* Sharing Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const joinUrl = `${window.location.origin}/quiz/join/${shareCode}`
                      navigator.clipboard.writeText(joinUrl)
                    }
                  }}
                  className="border-primary-300 text-primary-700 hover:bg-primary-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Kopiera länk
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(shareCode)
                  }}
                  className="border-primary-300 text-primary-700 hover:bg-primary-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  Kopiera kod
                </Button>

                {qrCodeUrl && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.download = `quiz-${shareCode}-qr.png`
                      link.href = qrCodeUrl
                      link.click()
                    }}
                    className="border-primary-300 text-primary-700 hover:bg-primary-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Ladda ner QR
                  </Button>
                )}
              </div>

              {/* Status indicator */}
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-primary-200">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <Typography variant="caption" className="text-success-700 font-medium">
                  Quiz är publikt och kan nås av elever
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}