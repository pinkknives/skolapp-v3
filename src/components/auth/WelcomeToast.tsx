'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from '@/components/ui/Toast'

export function WelcomeToast() {
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === 'true'
  const isLogin = searchParams.get('login') === 'true'

  useEffect(() => {
    if (isWelcome) {
      toast.success('Välkommen till Skolapp! 🎉', {
        description: 'Ditt lärarkonto har skapats. Du kan nu börja skapa quiz och hantera klasser.',
        duration: 8000
      })
    } else if (isLogin) {
      toast.success('Inloggning lyckades! 👋', {
        description: 'Välkommen tillbaka till Skolapp.',
        duration: 5000
      })
    }
  }, [isWelcome, isLogin])

  return null
}
