'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react'

interface Student {
  id: string
  name: string
  email?: string
}

interface ConsentRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  students: Student[]
  orgId: string
  onSuccess?: () => void
}

export function ConsentRequestDialog({ 
  isOpen, 
  onClose, 
  students, 
  orgId, 
  onSuccess 
}: ConsentRequestDialogProps) {
  const [guardianEmails, setGuardianEmails] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({})

  if (!isOpen) return null

  const handleEmailChange = (studentId: string, email: string) => {
    setGuardianEmails(prev => ({
      ...prev,
      [studentId]: email
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setResults({})

    const requests = students.map(async (student) => {
      const guardianEmail = guardianEmails[student.id]
      
      if (!guardianEmail || !guardianEmail.includes('@')) {
        return {
          studentId: student.id,
          success: false,
          message: 'Ogiltig e-postadress'
        }
      }

      try {
        const response = await fetch('/api/consents/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orgId,
            studentId: student.id,
            guardianEmail
          }),
        })

        const data = await response.json()

        return {
          studentId: student.id,
          success: response.ok,
          message: data.message || data.error || 'Okänt svar'
        }
      } catch (_error) {
        return {
          studentId: student.id,
          success: false,
          message: 'Nätverksfel'
        }
      }
    })

    const allResults = await Promise.all(requests)
    const resultMap = allResults.reduce((acc, result) => ({
      ...acc,
      [result.studentId]: { success: result.success, message: result.message }
    }), {})

    setResults(resultMap)
    setIsSubmitting(false)

    // Check if all were successful
    const allSuccessful = allResults.every(r => r.success)
    if (allSuccessful) {
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    }
  }

  const canSubmit = students.every(student => {
    const email = guardianEmails[student.id]
    return email && email.includes('@')
  })

  const hasResults = Object.keys(results).length > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Be om vårdnadshavaresamtycke</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!hasResults ? (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <Typography variant="small" className="text-blue-900 dark:text-blue-200">
                  <strong>Vad händer nu:</strong> Vi skickar e-post till vårdnadshavarna med en säker länk 
                  där de kan ge eller neka samtycke för långtidslagring av elevens data.
                </Typography>
              </div>

              <div className="space-y-4">
                <Typography variant="h3">Elever som behöver samtycke</Typography>
                
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-x-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex-1">
                      <Typography variant="small" className="font-medium">
                        {student.name}
                      </Typography>
                      {student.email && (
                        <Typography variant="caption" className="text-neutral-600 dark:text-neutral-400">
                          {student.email}
                        </Typography>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="vårdnadshavare@exempel.se"
                        value={guardianEmails[student.id] || ''}
                        onChange={(e) => handleEmailChange(student.id, e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-x-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Avbryt
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="flex items-center gap-x-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Skickar...' : 'Skicka inbjudningar'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <Typography variant="h3">Resultat</Typography>
                
                {students.map((student) => {
                  const result = results[student.id]
                  return (
                    <div key={student.id} className="flex items-center gap-x-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex-1">
                        <Typography variant="small" className="font-medium">
                          {student.name}
                        </Typography>
                        <Typography variant="caption" className="text-neutral-600 dark:text-neutral-400">
                          {guardianEmails[student.id]}
                        </Typography>
                      </div>
                      
                      <div className="flex items-center gap-x-2">
                        {result?.success ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <Typography variant="caption" className="text-green-700 dark:text-green-300">
                              Skickat
                            </Typography>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <Typography variant="caption" className="text-red-700 dark:text-red-300">
                              {result?.message || 'Fel'}
                            </Typography>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <Typography variant="small" className="text-green-900 dark:text-green-200">
                  Vårdnadshavarna kommer att få ett e-mail med en säker länk. De har 14 dagar på sig att svara.
                </Typography>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button variant="primary" onClick={onClose}>
                  Stäng
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}