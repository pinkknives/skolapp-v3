'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { useAuth } from '@/contexts/AuthContext'
import { type RegisterData } from '@/types/auth'
import { 
  validatePassword, 
  isValidEmail, 
  calculateAge, 
  needsParentalConsent,
  getPasswordRequirements
} from '@/lib/auth-utils'

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { register, isLoading, error } = useAuth()
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'lärare',
    dateOfBirth: '',
    hasParentalConsent: false,
    acceptsTerms: false,
    acceptsPrivacyPolicy: false,
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  // Remove unused state since password toggle is handled by Input component

  const handleInputChange = (field: keyof RegisterData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Email validation
    if (!formData.email) {
      errors.email = 'E-postadress är obligatorisk'
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Ange en giltig e-postadress'
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Lösenord är obligatoriskt'
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0]
      }
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Lösenorden stämmer inte överens'
    }

    // Name fields
    if (!formData.firstName.trim()) {
      errors.firstName = 'Förnamn är obligatoriskt'
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Efternamn är obligatoriskt'
    }

    // Date of birth (for minors)
    if (formData.dateOfBirth && formData.role === 'elev') {
      const age = calculateAge(formData.dateOfBirth)
      if (age < 5 || age > 25) {
        errors.dateOfBirth = 'Ange en giltig födelsedatum för en elev'
      }
      
      if (needsParentalConsent(formData.dateOfBirth) && !formData.hasParentalConsent) {
        errors.hasParentalConsent = 'Föräldrasamtycke krävs för användare under 13 år'
      }
    }

    // Terms and privacy
    if (!formData.acceptsTerms) {
      errors.acceptsTerms = 'Du måste acceptera användarvillkoren'
    }
    if (!formData.acceptsPrivacyPolicy) {
      errors.acceptsPrivacyPolicy = 'Du måste acceptera integritetspolicyn'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const result = await register(formData)
    
    if (result.success) {
      onSuccess?.()
    }
  }

  const passwordRequirements = getPasswordRequirements()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Skapa konto som {formData.role === 'lärare' ? 'Lärare' : 'Elev'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Typography variant="body2" className="font-medium">
              Jag är:
            </Typography>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="lärare"
                  checked={formData.role === 'lärare'}
                  onChange={(e) => handleInputChange('role', e.target.value as 'lärare')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <Typography variant="body2">Lärare</Typography>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="elev"
                  checked={formData.role === 'elev'}
                  onChange={(e) => handleInputChange('role', e.target.value as 'elev')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <Typography variant="body2">Elev</Typography>
              </label>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Förnamn"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              errorMessage={validationErrors.firstName}
              required
            />
            <Input
              label="Efternamn"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              errorMessage={validationErrors.lastName}
              required
            />
          </div>

          {/* Email */}
          <Input
            label="E-postadress"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            errorMessage={validationErrors.email}
            required
          />

          {/* Date of Birth for Students */}
          {formData.role === 'elev' && (
            <Input
              label="Födelsedatum"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              errorMessage={validationErrors.dateOfBirth}
              helperText="Behövs för åldersverifiering och GDPR-efterlevnad"
              required
            />
          )}

          {/* Password */}
          <Input
            label="Lösenord"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            errorMessage={validationErrors.password}
            showPasswordToggle
            required
          />

          {/* Password Requirements */}
          {formData.password && (
            <div className="text-xs text-neutral-600 space-y-1">
              <Typography variant="caption">Lösenordskrav:</Typography>
              <ul className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confirm Password */}
          <Input
            label="Bekräfta lösenord"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            errorMessage={validationErrors.confirmPassword}
            required
          />

          {/* Parental Consent for minors */}
          {formData.dateOfBirth && needsParentalConsent(formData.dateOfBirth) && (
            <div className="space-y-2">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasParentalConsent}
                  onChange={(e) => handleInputChange('hasParentalConsent', e.target.checked)}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <Typography variant="body2" className="text-sm">
                  Jag bekräftar att förälder/vårdnadshavare har gett samtycke för detta konto
                </Typography>
              </label>
              {validationErrors.hasParentalConsent && (
                <Typography variant="caption" className="text-error-600">
                  {validationErrors.hasParentalConsent}
                </Typography>
              )}
            </div>
          )}

          {/* Terms and Privacy */}
          <div className="space-y-3">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptsTerms}
                onChange={(e) => handleInputChange('acceptsTerms', e.target.checked)}
                className="mt-1 text-primary-600 focus:ring-primary-500"
              />
              <Typography variant="body2" className="text-sm">
                Jag accepterar{' '}
                <a href="/terms" className="text-primary-600 hover:underline">
                  användarvillkoren
                </a>
              </Typography>
            </label>
            {validationErrors.acceptsTerms && (
              <Typography variant="caption" className="text-error-600">
                {validationErrors.acceptsTerms}
              </Typography>
            )}

            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptsPrivacyPolicy}
                onChange={(e) => handleInputChange('acceptsPrivacyPolicy', e.target.checked)}
                className="mt-1 text-primary-600 focus:ring-primary-500"
              />
              <Typography variant="body2" className="text-sm">
                Jag accepterar{' '}
                <a href="/privacy" className="text-primary-600 hover:underline">
                  integritetspolicyn
                </a>
              </Typography>
            </label>
            {validationErrors.acceptsPrivacyPolicy && (
              <Typography variant="caption" className="text-error-600">
                {validationErrors.acceptsPrivacyPolicy}
              </Typography>
            )}
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
          >
            Skapa konto
          </Button>

          {/* Switch to Login */}
          <div className="text-center">
            <Typography variant="body2" className="text-neutral-600">
              Har du redan ett konto?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary-600 hover:underline font-medium"
              >
                Logga in här
              </button>
            </Typography>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}