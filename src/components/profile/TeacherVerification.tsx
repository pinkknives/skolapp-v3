'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { submitTeacherVerificationAction } from '@/app/actions/teacher-verification'
import { CheckCircle, AlertCircle, Upload, GraduationCap } from 'lucide-react'

interface TeacherVerificationProps {
  userId: string
  currentStatus?: 'pending' | 'verified' | 'rejected'
}

export function TeacherVerification({ userId, currentStatus }: TeacherVerificationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolEmail: '',
    workEmail: '',
    teachingSubject: '',
    yearsTeaching: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = new FormData()
      data.append('userId', userId)
      data.append('schoolName', formData.schoolName)
      data.append('schoolEmail', formData.schoolEmail)
      data.append('workEmail', formData.workEmail)
      data.append('teachingSubject', formData.teachingSubject)
      data.append('yearsTeaching', formData.yearsTeaching)

      const result = await submitTeacherVerificationAction(data)
      
      if (result.success) {
        alert('Din ansökan om lärarverifiering har skickats in!')
      } else {
        alert('Det gick inte att skicka ansökan: ' + (result.error || 'Okänt fel'))
      }
    } catch (error) {
      alert('Det gick inte att skicka ansökan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (currentStatus === 'verified') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success-700">
            <CheckCircle size={20} />
            Verifierad lärare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body2" className="text-success-600">
            Ditt lärarkonto är verifierat. Du har tillgång till alla lärfunktioner.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  if (currentStatus === 'pending') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning-700">
            <AlertCircle size={20} />
            Verifiering pågår
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body2" className="text-warning-600">
            Din ansökan om lärarverifiering granskas. Du kommer att få ett e-postmeddelande när granskningen är klar.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  if (currentStatus === 'rejected') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-error-700">
            <AlertCircle size={20} />
            Verifiering avslogs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Typography variant="body2" className="text-error-600">
            Din ansökan om lärarverifiering kunde inte godkännas. Du kan skicka en ny ansökan nedan.
          </Typography>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Skicka ny ansökan
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap size={20} />
          Lärarverifiering
        </CardTitle>
        <Typography variant="body2" className="text-neutral-600">
          Verifiera ditt lärarkonto för att få tillgång till alla funktioner
        </Typography>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Skolans namn"
              value={formData.schoolName}
              onChange={(e) => handleInputChange('schoolName', e.target.value)}
              placeholder="Exempel: Stockholms Tekniska Gymnasium"
              required
              disabled={isSubmitting}
            />
            <Input
              label="Skolans e-postadress"
              type="email"
              value={formData.schoolEmail}
              onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
              placeholder="info@skolan.se"
              required
              disabled={isSubmitting}
            />
          </div>

          <Input
            label="Din e-postadress på skolan"
            type="email"
            value={formData.workEmail}
            onChange={(e) => handleInputChange('workEmail', e.target.value)}
            placeholder="ditt.namn@skolan.se"
            required
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Huvudämne"
              value={formData.teachingSubject}
              onChange={(e) => handleInputChange('teachingSubject', e.target.value)}
              placeholder="t.ex. Matematik, Svenska, Historia"
              required
              disabled={isSubmitting}
            />
            <Input
              label="År som lärare"
              type="number"
              min="0"
              max="50"
              value={formData.yearsTeaching}
              onChange={(e) => handleInputChange('yearsTeaching', e.target.value)}
              placeholder="5"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="p-4 bg-info-50 border border-info-200 rounded-md">
            <Typography variant="body2" className="text-info-800 font-medium mb-2">
              Vad händer efter ansökan?
            </Typography>
            <ul className="text-sm text-info-700 space-y-1">
              <li>• Vi kontrollerar din ansökan inom 2-3 arbetsdagar</li>
              <li>• Du får ett e-postmeddelande när granskningen är klar</li>
              <li>• Verifierade lärare får tillgång till avancerade funktioner</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !formData.schoolName || !formData.workEmail}
          >
            {isSubmitting ? 'Skickar ansökan...' : 'Skicka ansökan om verifiering'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}