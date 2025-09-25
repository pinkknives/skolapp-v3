'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { UserWithProfile } from '@/lib/auth'
import { updateProfileAction } from '@/app/actions/profile'
import { TeacherVerification } from './TeacherVerification'
import { User, Mail, GraduationCap, Settings, KeyRound } from 'lucide-react'
import { useEffect } from 'react'
import Link from 'next/link'
import { Stack } from '@/components/layout/Stack'
import { FormField } from '@/components/ui/FormField'

interface ProfileManagementProps {
  user: UserWithProfile
}

export function ProfileManagement({ user }: ProfileManagementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [displayName, setDisplayName] = useState(user.profile?.display_name || '')
  const [role, setRole] = useState(user.profile?.role || 'teacher')
  const [consent, setConsent] = useState<boolean>(false)
  const [isUpdatingConsent, setIsUpdatingConsent] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch('/api/user/settings/consent', { method: 'GET' })
        if (resp.ok) {
          const data = await resp.json()
          setConsent(!!data.consent)
        }
      } catch {}
    }
    load()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('userId', user.id)
      formData.append('displayName', displayName)
      formData.append('role', role)
      
      const result = await updateProfileAction(formData)
      if (result.success) {
        setIsEditing(false)
      } else {
        alert('Det gick inte att spara profilen: ' + (result.error || 'Okänt fel'))
      }
    } catch (_error) {
      alert('Det gick inte att spara profilen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setDisplayName(user.profile?.display_name || '')
    setRole(user.profile?.role || 'teacher')
    setIsEditing(false)
  }

  return (
    <Stack gap="lg">
      {/* Password suggestion banner */}
      <Card>
        <CardContent>
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-primary-600 mt-0.5" />
            <div className="space-y-1">
              <Typography variant="body1" className="font-medium">
                Lägg till ett lösenord
              </Typography>
              <Typography variant="body2" className="text-neutral-600">
                Om du skapade kontot via e‑postlänk eller Google rekommenderar vi att du sätter ett lösenord för enklare inloggning.
              </Typography>
              <div className="pt-1 flex items-center gap-4">
                <Link href="/auth/reset-password" className="text-primary-600 hover:underline font-medium">
                  Skicka länk för att skapa/ändra lösenord
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.removeItem('sk_onboarding_banner_dismissed')
                      localStorage.removeItem('sk_onboarding_banner_last_shown')
                    } catch {}
                    alert('Onboarding‑bannern aktiveras igen nästa gång villkoren uppfylls.')
                  }}
                  className="text-neutral-600 hover:text-neutral-800 text-sm"
                >
                  Visa onboarding‑banner igen
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <Stack align="center" gap="xs" className="text-center">
        <Typography variant="h1">Min profil</Typography>
        <Typography variant="body1" className="text-neutral-600">
          Hantera dina kontoinställningar och profilinformation
        </Typography>
      </Stack>

      {/* Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Profilinformation
          </CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Settings size={16} />
              Redigera
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Stack gap="lg">
            {/* Email (read-only) */}
          <Stack gap="xs">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-neutral-500" />
              <Typography variant="body2" className="font-medium text-neutral-700">
                E-postadress
              </Typography>
            </div>
            <div className="p-3 bg-neutral-100 rounded-md">
              <Typography variant="body2" className="text-neutral-600">
                {user.email}
              </Typography>
            </div>
            <Typography variant="caption" className="text-neutral-500 mt-1">
              E-postadressen kan inte ändras
            </Typography>
          </Stack>

          {/* Display Name */}
          <Stack gap="xs">
            {isEditing ? (
              <FormField label="Visningsnamn">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ange ditt namn"
                  disabled={isLoading}
                />
              </FormField>
            ) : (
              <>
                <Typography variant="body2" className="font-medium text-neutral-700">
                  Visningsnamn
                </Typography>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                <Typography variant="body2">
                  {user.profile?.display_name || 'Inget namn angivet'}
                </Typography>
              </div>
              </>
            )}
          </Stack>

          {/* Role */}
          <Stack gap="xs">
            {isEditing ? (
              <Stack gap="xs" className="border-0 p-0">
                <legend className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <GraduationCap size={16} className="text-neutral-500" />
                  Roll
                </legend>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={role === 'teacher'}
                    onChange={(e) => setRole(e.target.value as 'teacher' | 'student')}
                    className="text-primary-600"
                    disabled={isLoading}
                  />
                  <span>Lärare</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === 'student'}
                    onChange={(e) => setRole(e.target.value as 'teacher' | 'student')}
                    className="text-primary-600"
                    disabled={isLoading}
                  />
                  <span>Elev</span>
                </label>
              </Stack>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-neutral-500" />
                  <Typography variant="body2" className="font-medium text-neutral-700">
                    Roll
                  </Typography>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                  <Typography variant="body2">
                    {user.profile?.role === 'teacher' ? 'Lärare' : 'Elev'}
                  </Typography>
                </div>
              </>
            )}
          </Stack>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Sparar...' : 'Spara ändringar'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Avbryt
              </Button>
            </div>
          )}
          </Stack>
        </CardContent>
      </Card>

      {/* Teacher Verification */}
      {user.profile?.role === 'teacher' && (
        <TeacherVerification 
          userId={user.id}
          currentStatus={user.profile.verification_status as 'pending' | 'verified' | 'rejected'}
        />
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Kontoinformation</CardTitle>
        </CardHeader>
        <CardContent>
          <Stack gap="sm">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="body2" className="text-neutral-600">Bidra anonymt till AI‑träning</Typography>
                  <Typography variant="caption" className="text-neutral-500">Dina quiz kan användas anonymt för att förbättra frågeförslag</Typography>
                </div>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={async (e) => {
                      const next = e.target.checked
                      setIsUpdatingConsent(true)
                      try {
                        const resp = await fetch('/api/user/settings/consent', {
                          method: 'PATCH',
                          headers: { 'content-type': 'application/json' },
                          body: JSON.stringify({ consent: next })
                        })
                        if (resp.ok) setConsent(next)
                      } finally {
                        setIsUpdatingConsent(false)
                      }
                    }}
                    disabled={isUpdatingConsent}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="text-sm">{isUpdatingConsent ? 'Uppdaterar...' : (consent ? 'Aktivt' : 'Av') }</span>
                </label>
              </div>
            <div className="flex justify-between">
            <Typography variant="body2" className="text-neutral-600">
              Medlem sedan
            </Typography>
            <Typography variant="body2">
              {user.profile?.created_at 
                ? new Date(user.profile.created_at).toLocaleDateString('sv-SE')
                : 'Okänt'
              }
            </Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body2" className="text-neutral-600">
              Användar-ID
            </Typography>
            <Typography variant="body2" className="font-mono text-xs">
              {user.id}
            </Typography>
          </div>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
