'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { 
  QrCode, 
  Copy, 
  Check, 
  Wifi, 
  WifiOff, 
  Clock,
  Zap,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface ImprovedLiveConnectionProps {
  sessionId: string
  pin: string
  qrCodeUrl?: string
  joinUrl: string
  participantCount: number
  isConnected: boolean
  onCopyPin?: () => void
  onCopyUrl?: () => void
  className?: string
}

const connectionVariants = {
  connected: {
    scale: 1,
    opacity: 1
  },
  disconnected: {
    scale: 0.95,
    opacity: 0.7
  }
}

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7]
  }
}

export function ImprovedLiveConnection({
  sessionId: _sessionId,
  pin,
  qrCodeUrl,
  joinUrl,
  participantCount,
  isConnected,
  onCopyPin,
  onCopyUrl,
  className = ''
}: ImprovedLiveConnectionProps) {
  const [showPin, setShowPin] = useState(true)
  const [showQrCode, setShowQrCode] = useState(true)
  const [copySuccess, setCopySuccess] = useState<'pin' | 'url' | null>(null)
  const [connectionPulse, setConnectionPulse] = useState(false)

  // Pulse animation for connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionPulse(true)
      const timer = setTimeout(() => setConnectionPulse(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isConnected])

  const handleCopyPin = async () => {
    try {
      await navigator.clipboard.writeText(pin)
      setCopySuccess('pin')
      toast.success('PIN-kod kopierad!')
      onCopyPin?.()
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (_error) {
      toast.error('Kunde inte kopiera PIN-kod')
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl)
      setCopySuccess('url')
      toast.success('Länk kopierad!')
      onCopyUrl?.()
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (_error) {
      toast.error('Kunde inte kopiera länk')
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <motion.div
        variants={connectionVariants}
        animate={isConnected ? 'connected' : 'disconnected'}
        className="relative"
      >
        <Card className={`transition-all duration-300 ${
          isConnected 
            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
            : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  variants={pulseVariants}
                  animate={connectionPulse ? 'pulse' : ''}
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                />
                <div>
                  <Typography variant="h6" className="text-foreground">
                    {isConnected ? 'Live-session aktiv' : 'Ansluter...'}
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground">
                    {participantCount} deltagare anslutna
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="w-5 h-5 text-green-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-orange-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* PIN Code Section */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-lg">PIN-kod</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPin(!showPin)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-6 inline-block">
                <Typography variant="caption" className="text-muted-foreground block mb-2">
                  Ange denna kod för att gå med
                </Typography>
                <div className={`font-mono tracking-widest transition-all duration-300 text-4xl font-bold ${
                  showPin ? 'text-foreground' : 'text-transparent select-none blur-sm'
                }`}>
                  {pin}
                </div>
              </div>
              {!showPin && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </motion.div>

            <Button
              onClick={handleCopyPin}
              variant="outline"
              size="lg"
              className="w-full"
              disabled={copySuccess === 'pin'}
            >
              {copySuccess === 'pin' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Kopierad!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Kopiera PIN-kod
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      {qrCodeUrl && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary-600" />
                <CardTitle className="text-lg">QR-kod</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQrCode(!showQrCode)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showQrCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="relative inline-block"
              >
                <div className={`transition-all duration-300 ${
                  showQrCode ? 'opacity-100' : 'opacity-0'
                }`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl}
                    alt="QR kod för att gå med i sessionen"
                    className="mx-auto rounded-xl border-2 border-neutral-200 dark:border-neutral-700"
                    width={200}
                    height={200}
                  />
                </div>
                {!showQrCode && (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                    <Eye className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </motion.div>

              <Typography variant="body2" className="text-muted-foreground">
                Skanna med kameran för att gå med direkt
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Join URL Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-600" />
            <CardTitle className="text-lg">Direktlänk</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
              <Typography 
                variant="body2" 
                className="font-mono text-sm break-all text-foreground"
              >
                {joinUrl}
              </Typography>
            </div>
            
            <Button
              onClick={handleCopyUrl}
              variant="outline"
              size="lg"
              className="w-full"
              disabled={copySuccess === 'url'}
            >
              {copySuccess === 'url' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Länk kopierad!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Kopiera länk
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fun Visual Elements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <Typography variant="caption">
            Elever kan ansluta med vilken enhet som helst
          </Typography>
          <Sparkles className="w-4 h-4" />
        </div>
      </motion.div>
    </div>
  )
}
