'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Typography, Heading } from '@/components/ui/Typography'
import { 
  QrCode, 
  Key, 
  Users, 
  Wifi, 
  CheckCircle, 
  XCircle,
  Sparkles,
  Zap,
  Camera,
  Smartphone
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface ImprovedStudentJoinProps {
  onJoinSuccess: (data: { pin: string; name: string }) => void
  onQrCodeScan: () => void
  isLoading?: boolean
  error?: string
  className?: string
}

const stepVariants = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 }
}

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7]
  }
}

export function ImprovedStudentJoin({
  onJoinSuccess,
  onQrCodeScan,
  isLoading: _isLoading = false,
  error,
  className = ''
}: ImprovedStudentJoinProps) {
  const [step, setStep] = useState<'method' | 'pin' | 'name' | 'success'>('method')
  const [pin, setPin] = useState('')
  const [name, setName] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [pinError, setPinError] = useState('')
  const [nameError, setNameError] = useState('')

  // Auto-focus PIN input when step changes
  useEffect(() => {
    if (step === 'pin') {
      const input = document.getElementById('pin-input')
      if (input) {
        (input as HTMLInputElement).focus()
      }
    }
  }, [step])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!pin.trim()) {
      setPinError('Ange en PIN-kod')
      return
    }

    if (pin.length !== 6) {
      setPinError('PIN-kod måste vara 6 tecken')
      return
    }

    setPinError('')
    setStep('name')
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setNameError('Ange ditt namn')
      return
    }

    if (name.length < 2) {
      setNameError('Namnet måste vara minst 2 tecken')
      return
    }

    setNameError('')
    setIsConnecting(true)
    
    // Simulate connection
    setTimeout(() => {
      setIsConnecting(false)
      setStep('success')
      onJoinSuccess({ pin, name })
      toast.success(`Välkommen ${name}!`)
    }, 1500)
  }

  const handlePinChange = (value: string) => {
    // Only allow numbers and limit to 6 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setPin(numericValue)
    setPinError('')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    setNameError('')
  }

  const resetForm = () => {
    setStep('method')
    setPin('')
    setName('')
    setPinError('')
    setNameError('')
    setIsConnecting(false)
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <AnimatePresence mode="wait">
        {/* Method Selection */}
        {step === 'method' && (
          <motion.div
            key="method"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                variants={pulseVariants}
                animate="pulse"
                className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles className="w-8 h-8 text-primary-600" />
              </motion.div>
              <Heading level={2} className="text-foreground mb-2">
                Gå med i quiz
              </Heading>
              <Typography variant="body1" className="text-muted-foreground">
                Välj hur du vill ansluta
              </Typography>
            </div>

            <div className="space-y-4">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary-300"
                onClick={() => setStep('pin')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Key className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <Typography variant="h6" className="text-foreground mb-1">
                        Ange PIN-kod
                      </Typography>
                      <Typography variant="body2" className="text-muted-foreground">
                        Skriv in 6-siffriga koden från läraren
                      </Typography>
                    </div>
                    <Zap className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary-300"
                onClick={onQrCodeScan}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <Typography variant="h6" className="text-foreground mb-1">
                        Skanna QR-kod
                      </Typography>
                      <Typography variant="body2" className="text-muted-foreground">
                        Använd kameran för att skanna QR-koden
                      </Typography>
                    </div>
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Typography variant="caption" className="text-muted-foreground">
                <Smartphone className="w-4 h-4 inline mr-1" />
                Fungerar på alla enheter
              </Typography>
            </div>
          </motion.div>
        )}

        {/* PIN Entry */}
        {step === 'pin' && (
          <motion.div
            key="pin"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-blue-600" />
              </div>
              <Heading level={2} className="text-foreground mb-2">
                Ange PIN-kod
              </Heading>
              <Typography variant="body1" className="text-muted-foreground">
                Skriv in 6-siffriga koden från läraren
              </Typography>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div>
                <Input
                  id="pin-input"
                  type="text"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="123456"
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  errorMessage={pinError}
                />
                <Typography variant="caption" className="text-muted-foreground mt-2 block text-center">
                  {pin.length}/6 tecken
                </Typography>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Tillbaka
                </Button>
                <Button
                  type="submit"
                  disabled={pin.length !== 6}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Fortsätt
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Name Entry */}
        {step === 'name' && (
          <motion.div
            key="name"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <Heading level={2} className="text-foreground mb-2">
                Ditt namn
              </Heading>
              <Typography variant="body1" className="text-muted-foreground">
                Hur ska vi kalla dig i quizet?
              </Typography>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ditt namn"
                  className="text-center text-lg"
                  errorMessage={nameError}
                />
                <Typography variant="caption" className="text-muted-foreground mt-2 block text-center">
                  Detta visas för läraren
                </Typography>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('pin')}
                  className="flex-1"
                >
                  Tillbaka
                </Button>
                <Button
                  type="submit"
                  disabled={name.length < 2}
                  className="flex-1"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Gå med
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Success State */}
        {step === 'success' && (
          <motion.div
            key="success"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2 
                }}
                className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>
              <Heading level={2} className="text-foreground mb-2">
                Välkommen {name}!
              </Heading>
              <Typography variant="body1" className="text-muted-foreground">
                Du är nu ansluten till quizet
              </Typography>
            </div>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wifi className="w-5 h-5 text-green-600" />
                  <Typography variant="h6" className="text-green-800 dark:text-green-200">
                    Ansluten
                  </Typography>
                </div>
                <Typography variant="body2" className="text-green-700 dark:text-green-300">
                  Väntar på att läraren startar quizet...
                </Typography>
              </CardContent>
            </Card>

            <Button
              onClick={resetForm}
              variant="outline"
              className="w-full"
            >
              Gå med i annat quiz
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <Typography variant="body2" className="text-red-800 dark:text-red-200">
                  {error}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {isConnecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <Card className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"
              />
              <Typography variant="h6" className="text-foreground mb-2">
                Ansluter...
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                Ett ögonblick, vi kopplar dig till quizet
              </Typography>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
