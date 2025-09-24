'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { FormField } from '@/components/ui/FormField'
import { useAuth } from '@/contexts/AuthContext'
import { type LoginCredentials } from '@/types/auth'
import { isValidEmail } from '@/lib/auth-utils'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
  onGuestAccess?: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister, onGuestAccess }: LoginFormProps) {
  const { login, isLoading, error } = useAuth()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  // Remove unused state since password toggle is handled by Input component

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!credentials.email) {
      errors.email = 'E-postadress är obligatorisk'
    } else if (!isValidEmail(credentials.email)) {
      errors.email = 'Ange en giltig e-postadress'
    }

    if (!credentials.password) {
      errors.password = 'Lösenord är obligatoriskt'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const result = await login(credentials)
    
    if (result.success) {
      onSuccess?.()
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Logga in</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="E-postadress" errorMessage={validationErrors.email}>
            <Input
              type="email"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="din@email.se"
              required
              data-testid="login-email"
            />
          </FormField>

          <FormField label="Lösenord" errorMessage={validationErrors.password}>
            <Input
              type="password"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              showPasswordToggle
              required
              data-testid="login-password"
            />
          </FormField>

          {/* Demo Credentials Helper */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
            <Typography variant="caption" className="text-neutral-600 block mb-2">
              För demo, använd:
            </Typography>
            <div className="space-y-1 text-xs">
              <div>
                <strong>Lärare:</strong> larare@skolapp.se / password
              </div>
              <div>
                <strong>Elev:</strong> elev@skolapp.se / password
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-error-50 border border-error-200 rounded-md">
              <Typography variant="body2" className="text-error-700">
                {error}
              </Typography>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            data-testid="login-submit"
          >
            Logga in
          </Button>

          {/* Forgot Password */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary-600 hover:underline"
              onClick={() => {
                // TODO: Implement forgot password
                alert('Glömt lösenord-funktion kommer snart!')
              }}
            >
              Glömt lösenordet?
            </button>
          </div>

          {/* Guest Access */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">eller</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onGuestAccess}
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Fortsätt som gäst
          </Button>

          {/* Switch to Register */}
          <div className="text-center">
            <Typography variant="body2" className="text-neutral-600">
              Inget konto än?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-primary-600 hover:underline font-medium"
              >
                Skapa konto här
              </button>
            </Typography>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
