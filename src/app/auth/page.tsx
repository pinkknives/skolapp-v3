'use client'

import React, { useEffect, useState } from 'react'
import { ImprovedAuthForm } from '@/components/auth/ImprovedAuthForm'
import { useSearchParams } from 'next/navigation'

type AuthMode = 'login' | 'register'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login'
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [suggestedOrg, setSuggestedOrg] = useState<string | null>(null)

  useEffect(() => {
    // Best-effort: look at email in URL (?email=) to suggest org by domain
    const email = searchParams.get('email')
    if (!email) return
    fetch(`/api/org/suggest?email=${encodeURIComponent(email)}`).then(async (r) => {
      const j = await r.json().catch(() => null)
      setSuggestedOrg(j?.orgId || null)
    }).catch(() => {})
  }, [searchParams])

  return (
    <ImprovedAuthForm 
      mode={mode} 
      onModeChange={setMode}
      suggestedOrgId={suggestedOrg || undefined}
    />
  )
}
