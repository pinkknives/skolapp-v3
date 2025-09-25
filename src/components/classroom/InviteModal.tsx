'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { ClassWithMembers } from '@/types/quiz'
import { X, Copy, RefreshCw } from 'lucide-react'
import QRCodeGenerator from 'qrcode'
import Image from 'next/image'

interface InviteModalProps {
  classItem: ClassWithMembers
  onClose: () => void
}

export function InviteModal({ classItem, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isGeneratingQR, setIsGeneratingQR] = useState(true)

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsGeneratingQR(true)
        const joinUrl = `${window.location.origin}/join/class?code=${classItem.inviteCode}`
        const qrUrl = await QRCodeGenerator.toDataURL(joinUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#1f2937', // neutral-800
            light: '#ffffff'
          }
        })
        setQrCodeUrl(qrUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      } finally {
        setIsGeneratingQR(false)
      }
    }

    generateQR()
  }, [classItem.inviteCode])

  const joinUrl = `${window.location.origin}/join/class?code=${classItem.inviteCode}`

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(classItem.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bjud in elever</CardTitle>
              <Typography variant="body2" className="text-neutral-600 mt-1">
                {classItem.name}
              </Typography>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Join Code */}
          <div>
            <Typography variant="h6" className="mb-3">
              Klasskod
            </Typography>
            <div className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-lg p-4 text-center">
              <Typography variant="h4" className="font-mono font-bold text-primary-600 mb-2">
                {classItem.inviteCode}
              </Typography>
              <Typography variant="body2" className="text-neutral-600 mb-3">
                Eleverna anger denna kod på skolapp.se
              </Typography>
              <Button
                variant="outline"
                size="sm"
                onClick={copyCode}
                className="gap-2"
              >
                <Copy size={16} />
                {copied ? 'Kopierad!' : 'Kopiera kod'}
              </Button>
            </div>
          </div>

          {/* Direct Link */}
          <div>
            <Typography variant="h6" className="mb-3">
              Direktlänk
            </Typography>
            <div className="bg-neutral-50 rounded-lg p-3">
              <Typography variant="body2" className="text-neutral-600 break-all mb-3">
                {joinUrl}
              </Typography>
              <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="gap-2 w-full"
              >
                <Copy size={16} />
                {copied ? 'Kopierad!' : 'Kopiera länk'}
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div>
            <Typography variant="h6" className="mb-3">
              QR-kod
            </Typography>
            <div className="bg-white border rounded-lg p-4 text-center">
              {isGeneratingQR ? (
                <div className="w-48 h-48 mx-auto flex items-center justify-center">
                  <div className="animate-spin">
                    <RefreshCw size={32} className="text-neutral-400" />
                  </div>
                </div>
              ) : qrCodeUrl ? (
                <div>
                  <Image 
                    src={qrCodeUrl} 
                    alt={`QR-kod för ${classItem.name}`}
                    className="mx-auto mb-3"
                    width={200}
                    height={200}
                    sizes="200px"
                  />
                  <Typography variant="body2" className="text-neutral-600">
                    Eleverna skannar med sin telefon
                  </Typography>
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto flex items-center justify-center">
                  <Typography variant="body2" className="text-neutral-500">
                    Kunde inte generera QR-kod
                  </Typography>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-info-50 border border-info-200 rounded-lg p-4">
            <Typography variant="h6" className="text-info-800 mb-2">
              Instruktioner för elever
            </Typography>
            <ol className="text-sm text-info-700 space-y-1">
              <li>1. Gå till <strong>skolapp.se</strong></li>
              <li>2. Klicka på &quot;Gå med i klass&quot;</li>
              <li>3. Ange klasskoden: <strong>{classItem.inviteCode}</strong></li>
              <li>4. Välj ett namn eller alias</li>
            </ol>
          </div>

          {/* Close button */}
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Stäng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}