'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import { Layout } from '@/components/layout/Layout'

export default function TestLoginPage() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <LoginForm
          onSuccess={() => {
            // Redirect to teacher page after successful login
            window.location.href = '/teacher'
          }}
        />
      </div>
    </Layout>
  )
}