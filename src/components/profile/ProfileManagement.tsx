'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { UserWithProfile } from '@/lib/auth'
import { updateProfileAction } from '@/app/actions/profile'
import { TeacherVerification } from './TeacherVerification'
import { User, Mail, GraduationCap, Settings } from 'lucide-react'

interface ProfileManagementProps {
  user: UserWithProfile
}

export function ProfileManagement({ user }: ProfileManagementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [displayName, setDisplayName] = useState(user.profile?.display_name || '')
  const [role, setRole] = useState(user.profile?.role || 'teacher')

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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Typography variant="h1" className="mb-2">
          Min profil
        </Typography>
        <Typography variant="body1" className="text-neutral-600">
          Hantera dina kontoinställningar och profilinformation
        </Typography>
      </div>

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
        <CardContent className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
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
          </div>

          {/* Display Name */}
          <div>
            <Typography variant="body2" className="font-medium text-neutral-700 mb-2">
              Visningsnamn
            </Typography>
            {isEditing ? (
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ange ditt namn"
                disabled={isLoading}
              />
            ) : (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                <Typography variant="body2">
                  {user.profile?.display_name || 'Inget namn angivet'}
                </Typography>
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap size={16} className="text-neutral-500" />
              <Typography variant="body2" className="font-medium text-neutral-700">
                Roll
              </Typography>
            </div>
            {isEditing ? (
              <div className="space-y-2">
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
              </div>
            ) : (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                <Typography variant="body2">
                  {user.profile?.role === 'teacher' ? 'Lärare' : 'Elev'}
                </Typography>
              </div>
            )}
          </div>

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
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>
    </div>
  )
}