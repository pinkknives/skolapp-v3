'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface QuizJoinCodePageProps {
  params: Promise<{
    code: string
  }>
}

export default function QuizJoinCodePage({ params }: QuizJoinCodePageProps) {
  const router = useRouter()

  useEffect(() => {
    // Handle async params in Next.js 15
    params.then(({ code }) => {
      // Redirect to the main join page with the code as a parameter
      // This allows the main page to handle both direct access and QR code links
      const upperCode = code?.toUpperCase()
      if (upperCode && /^[A-Z0-9]{6}$/.test(upperCode)) {
        // Store the code temporarily and redirect to the main join page
        sessionStorage.setItem('quiz_join_code', upperCode)
        router.replace('/quiz/join')
      } else {
        // Invalid code format, redirect to main join page
        router.replace('/quiz/join')
      }
    })
  }, [params, router])

  // This component will redirect immediately, so we just show a loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-neutral-600">Laddar quiz...</p>
      </div>
    </div>
  )
}