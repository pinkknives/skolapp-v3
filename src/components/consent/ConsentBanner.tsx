'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { AlertTriangle, Mail, X } from 'lucide-react'
import { ConsentRequestDialog } from './ConsentRequestDialog'

interface Student {
  id: string
  name: string
  email?: string
}

interface ConsentBannerProps {
  studentsNeedingConsent: Student[]
  orgId: string
  onConsentRequested?: () => void
  className?: string
}

export function ConsentBanner({ 
  studentsNeedingConsent, 
  orgId, 
  onConsentRequested,
  className = '' 
}: ConsentBannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed || studentsNeedingConsent.length === 0) {
    return null
  }

  const studentCount = studentsNeedingConsent.length
  const hasMultipleStudents = studentCount > 1

  return (
    <>
      <Card className={`border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800 ${className}`}>
        <CardContent className="flex items-start gap-x-4 p-4">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1 min-w-0">
            <Typography variant="small" className="font-medium text-orange-900 dark:text-orange-200 mb-1">
              Samtycke krävs för långtidslagring
            </Typography>
            <Typography variant="caption" className="text-orange-700 dark:text-orange-300">
              {hasMultipleStudents 
                ? `${studentCount} elever behöver vårdnadshavaresamtycke för att kunna använda Långtidsläge.`
                : `${studentsNeedingConsent[0].name} behöver vårdnadshavaresamtycke för att kunna använda Långtidsläge.`
              }
            </Typography>
          </div>

          <div className="flex items-center gap-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-x-1.5"
            >
              <Mail className="w-4 h-4" />
              Be om samtycke
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConsentRequestDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        students={studentsNeedingConsent}
        orgId={orgId}
        onSuccess={() => {
          setIsDialogOpen(false)
          setIsDismissed(true)
          onConsentRequested?.()
        }}
      />
    </>
  )
}