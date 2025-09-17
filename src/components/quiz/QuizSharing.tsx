'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import QRCode from 'qrcode'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Quiz } from '@/types/quiz'

interface QuizSharingProps {
  quiz: Quiz
  onClose?: () => void
  className?: string
}

export function QuizSharing({ quiz, onClose, className }: QuizSharingProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)

  // In a real app, this would be the actual quiz join URL
  const joinUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/quiz/join/${quiz.shareCode}`

  useEffect(() => {
    if (quiz.shareCode) {
      QRCode.toDataURL(joinUrl, {
        width: 256,
        margin: 1,
        color: {
          dark: '#0369a1', // primary-700
          light: '#ffffff',
        },
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generating QR code:', err))
    }
  }, [quiz.shareCode, joinUrl])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(quiz.shareCode || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.download = `quiz-${quiz.shareCode}-qr.png`
      link.href = qrCodeUrl
      link.click()
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Dela quiz</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Share Code */}
        <div className="text-center">
          <Typography variant="body2" className="mb-2 text-neutral-600">
            Delningskod
          </Typography>
          <div className="bg-primary-50 rounded-lg p-6 mb-4">
            <Typography variant="h2" className="font-mono text-primary-800 mb-2 tracking-wider">
              {quiz.shareCode}
            </Typography>
            <Typography variant="caption" className="text-primary-600">
              Eleverna anger denna kod på Skolapp för att gå med i quizet
            </Typography>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="mb-4"
          >
            {copied ? (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Kopierad!
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Kopiera kod
              </>
            )}
          </Button>
        </div>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="text-center">
            <Typography variant="body2" className="mb-4 text-neutral-600">
              QR-kod
            </Typography>
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <Image
                  src={qrCodeUrl}
                  alt={`QR-kod för quiz ${quiz.title}`}
                  width={192}
                  height={192}
                  className="w-48 h-48"
                  priority={false}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQRCode}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ladda ner QR
              </Button>
            </div>
            <Typography variant="caption" className="text-neutral-500 mt-2 block">
              Eleverna kan skanna QR-koden med sin telefon för att gå med direkt
            </Typography>
          </div>
        )}

        {/* Share URL */}
        <div>
          <Typography variant="body2" className="mb-2 text-neutral-600">
            Direktlänk
          </Typography>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-neutral-50 rounded-md p-3 font-mono text-sm text-neutral-700 overflow-hidden">
              <div className="truncate">{joinUrl}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyUrlToClipboard}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <Typography variant="body2" className="font-medium mb-2 text-neutral-700">
            Så här använder eleverna quizet:
          </Typography>
          <ol className="list-decimal list-inside space-y-1 text-sm text-neutral-600">
            <li>Gå till Skolapp ({typeof window !== 'undefined' ? window.location.origin : 'skolapp.se'})</li>
            <li>Klicka på &quot;Gå med i Quiz&quot;</li>
            <li>Ange koden <strong>{quiz.shareCode}</strong> eller skanna QR-koden</li>
            <li>Börja quizet när du säger till!</li>
          </ol>
        </div>

        {/* Quiz Info */}
        <div className="border-t pt-4">
          <Typography variant="caption" className="text-neutral-500">
            Quiz: {quiz.title} • {quiz.questions.length} frågor • {quiz.settings.executionMode === 'self-paced' ? 'Självtempo' : quiz.settings.executionMode === 'teacher-controlled' ? 'Lärarstyrt' : 'Lärargranskningsläge'}
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}