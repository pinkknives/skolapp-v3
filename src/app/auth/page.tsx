'use client'

import React, { useState } from 'react'
import { ImprovedAuthForm } from '@/components/auth/ImprovedAuthForm'
import { useSearchParams } from 'next/navigation'

type AuthMode = 'login' | 'register'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login'
  const [mode, setMode] = useState<AuthMode>(initialMode)

  return (
    <ImprovedAuthForm 
      mode={mode} 
      onModeChange={setMode}
    />
  )
}
