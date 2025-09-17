'use client'

import React, { useState, useEffect } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { GuestLogin } from './GuestLogin'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'login' | 'register' | 'guest'
}

type AuthMode = 'login' | 'register' | 'guest'

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode)

  useEffect(() => {
    setMode(defaultMode)
  }, [defaultMode])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSuccess = () => {
    onClose()
    // Optional: show success message or redirect
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-neutral-300 transition-colors z-10"
          aria-label="Stäng"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Form Content */}
        {mode === 'login' && (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setMode('register')}
            onGuestAccess={() => setMode('guest')}
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        )}

        {mode === 'guest' && (
          <GuestLogin
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setMode('register')}
          />
        )}
      </div>
    </div>
  )
}