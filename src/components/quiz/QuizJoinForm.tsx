'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { cn } from '@/lib/utils'
import { QrCode } from 'lucide-react'

interface QuizJoinFormProps {
  onJoinQuiz: (code: string, alias: string) => Promise<void>
  isLoading?: boolean
  error?: string
  prefilledCode?: string
  className?: string
}

export function QuizJoinForm({ onJoinQuiz, isLoading = false, error, prefilledCode = '', className }: QuizJoinFormProps) {
  const [code, setCode] = useState(prefilledCode)
  const [alias, setAlias] = useState('')
  const [step, setStep] = useState<'code' | 'alias'>(prefilledCode ? 'alias' : 'code')
  const [validatedCode, setValidatedCode] = useState(prefilledCode)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const validateCode = useCallback((inputCode: string): boolean => {
    // Simple validation: 4 characters, alphanumeric
    return /^[A-Z0-9]{4}$/.test(inputCode.toUpperCase())
  }, [])

  // Handle prefilled code from QR scan
  useEffect(() => {
    if (prefilledCode && validateCode(prefilledCode)) {
      setCode(prefilledCode)
      setValidatedCode(prefilledCode)
      setStep('alias')
    }
  }, [prefilledCode, validateCode])

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedCode = code.trim().toUpperCase()
    
    if (!validateCode(trimmedCode)) {
      return
    }

    setValidatedCode(trimmedCode)
    setStep('alias')
  }

  const handleAliasSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedAlias = alias.trim()
    
    if (!trimmedAlias || trimmedAlias.length < 2) {
      return
    }

    await onJoinQuiz(validatedCode, trimmedAlias)
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 4)
    setCode(value)
  }

  const startQRScanner = async () => {
    setShowQRScanner(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      console.error('Failed to start camera:', err)
      setShowQRScanner(false)
    }
  }

  const stopQRScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setShowQRScanner(false)
  }

  const resetForm = () => {
    setCode('')
    setAlias('')
    setStep('code')
    setValidatedCode('')
    stopQRScanner()
  }

  if (step === 'alias') {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader className="text-center">
          <CardTitle>Välj ditt namn</CardTitle>
          <Typography variant="body2" className="text-neutral-600">
            Kod: <span className="font-mono font-bold text-primary-600">{validatedCode}</span>
          </Typography>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAliasSubmit} className="space-y-4">
            <Input
              label="Namn eller alias"
              placeholder="Skriv ditt namn..."
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              helperText="Detta namn kommer att visas för läraren under quizet"
              maxLength={50}
              autoFocus
              required
              minLength={2}
            />
            
            {error && (
              <div className="p-3 bg-error-50 border border-error-200 rounded-md">
                <Typography variant="caption" className="text-error-700">
                  {error}
                </Typography>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
                fullWidth
              >
                Tillbaka
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                disabled={alias.trim().length < 2}
                fullWidth
              >
                Gå med i quiz
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center">
        <CardTitle>Gå med i Quiz</CardTitle>
        <Typography variant="body2" className="text-neutral-600">
          Ange fyrteckenskoden eller skanna QR-kod
        </Typography>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showQRScanner ? (
          <>
            {/* Code Input Form */}
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <Input
                label="Quiz-kod"
                placeholder="ABCD"
                value={code}
                onChange={handleCodeChange}
                helperText="Ange den fyrteckenkod som läraren delar"
                className="text-center text-lg font-mono uppercase tracking-wider"
                maxLength={4}
                autoFocus
                autoComplete="off"
                autoCapitalize="characters"
              />
              
              <Button
                type="submit"
                disabled={!validateCode(code)}
                fullWidth
                size="lg"
              >
                Fortsätt
              </Button>
            </form>

            {/* QR Scanner Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-neutral-500">eller</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={startQRScanner}
              fullWidth
              size="lg"
              leftIcon={
                <QrCode size={20} strokeWidth={2} />
              }
            >
              Skanna QR-kod
            </Button>
          </>
        ) : (
          <>
            {/* QR Scanner */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  aria-label="Kameravy för QR-kod skanning"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                {/* QR scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <div className="w-48 h-48 border-2 border-primary-500 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />
                  </div>
                </div>
              </div>
              
              <Typography variant="caption" className="text-center text-neutral-600 block">
                Placera QR-koden inom ramen för att skanna
              </Typography>
              
              <Button
                type="button"
                variant="outline"
                onClick={stopQRScanner}
                fullWidth
              >
                Avbryt
              </Button>
            </div>
          </>
        )}

        {error && !showQRScanner && (
          <div className="p-3 bg-error-50 border border-error-200 rounded-md">
            <Typography variant="caption" className="text-error-700">
              {error}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  )
}