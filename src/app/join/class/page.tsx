'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { joinClassAction } from '@/app/actions/classes'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import { Users, CheckCircle } from 'lucide-react'

type JoinState = 'code' | 'alias' | 'success'

function JoinClassForm() {
  const [code, setCode] = useState('')
  const [alias, setAlias] = useState('')
  const [state, setState] = useState<JoinState>('code')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [joinedClass, setJoinedClass] = useState<string | null>(null)
  
  const { user } = useAuth()
  const searchParams = useSearchParams()

  // Pre-fill code from URL if provided
  useEffect(() => {
    const codeParam = searchParams.get('code')
    if (codeParam && codeParam.length === 6) {
      setCode(codeParam.toUpperCase())
      setState('alias')
    }
  }, [searchParams])

  const validateCode = (inputCode: string): boolean => {
    return /^[A-Z0-9]{6}$/.test(inputCode.toUpperCase())
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCode(code)) {
      setError('Ange en giltig 6-teckens klasskod')
      return
    }

    setState('alias')
    setError(null)
  }

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!alias.trim()) {
      setError('Ange ditt namn eller alias')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append('inviteCode', code.toUpperCase())
    formData.append('alias', alias.trim())
    if (user?.id) {
      formData.append('userId', user.id)
    }

    try {
      const result = await joinClassAction(formData)
      
      if (result.success && result.class) {
        setJoinedClass(result.class.name)
        setState('success')
      } else {
        setError(result.error || 'Det gick inte att gå med i klassen')
      }
    } catch (_err) {
      setError('Ett oväntat fel inträffade')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCode('')
    setAlias('')
    setState('code')
    setError(null)
    setJoinedClass(null)
  }

  if (state === 'success') {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <CardTitle>Välkommen till klassen!</CardTitle>
          <Typography variant="body1" className="text-neutral-600">
            Du har gått med i <strong>{joinedClass}</strong>
          </Typography>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Typography variant="body2" className="text-neutral-600">
            Din lärare kan nu bjuda in dig till quiz och du kommer att få notiser när nya aktiviteter är tillgängliga.
          </Typography>
          
          <div className="space-y-2">
            <Button 
              onClick={resetForm}
              variant="outline"
              className="w-full"
            >
              Gå med i en annan klass
            </Button>
            
            <Button 
              onClick={() => window.close()}
              className="w-full"
            >
              Stäng
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-primary-600" />
        </div>
        <CardTitle>
          {state === 'code' ? 'Gå med i klass' : 'Ange ditt namn'}
        </CardTitle>
        <Typography variant="body2" className="text-neutral-600">
          {state === 'code' 
            ? 'Ange klasskoden du fick från din lärare' 
            : `Kod: ${code} - Välj ett namn som läraren ska se`
          }
        </Typography>
      </CardHeader>
      
      <CardContent>
        {/* Code Entry Step */}
        {state === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <Input
              label="Klasskod"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              required
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              helperText="6 tecken, bokstäver och siffror"
            />
            
            <Button
              type="submit"
              disabled={!validateCode(code)}
              fullWidth
              size="lg"
            >
              Fortsätt
            </Button>
          </form>
        )}

        {/* Alias Entry Step */}
        {state === 'alias' && (
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4">
              <Typography variant="body2" className="text-primary-700">
                <strong>Klasskod:</strong> {code}
              </Typography>
            </div>

            <Input
              label="Ditt namn eller alias"
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Skriv ditt namn..."
              maxLength={50}
              required
              autoFocus
              helperText="Detta namn kommer att visas för läraren"
            />
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setState('code')}
                disabled={isSubmitting}
                className="flex-1"
              >
                Tillbaka
              </Button>
              <Button
                type="submit"
                disabled={!alias.trim() || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Går med...' : 'Gå med i klass'}
              </Button>
            </div>
          </form>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-error-50 border border-error-200">
            <Typography variant="body2" className="text-error-700">
              {error}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function JoinClassPage() {
  return (
    <Layout>
      <Section spacing="xl" className="min-h-screen flex items-center">
        <Container>
          <div className="max-w-md mx-auto">
            <Suspense fallback={
              <Card>
                <CardContent className="text-center py-8">
                  <Typography variant="body1">Laddar...</Typography>
                </CardContent>
              </Card>
            }>
              <JoinClassForm />
            </Suspense>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}