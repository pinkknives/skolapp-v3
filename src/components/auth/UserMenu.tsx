'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { useAuth } from '@/contexts/AuthContext'
import { 
  getUserDisplayName, 
  getRoleDisplayName, 
  getSubscriptionDisplayName,
  canAccessTeacherPortal 
} from '@/lib/auth-utils'
import Link from 'next/link'

interface UserMenuProps {
  onLogin?: () => void
}

export function UserMenu({ onLogin }: UserMenuProps) {
  const { user, logout, isAuthenticated, getCurrentGuestSession } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const guestSession = getCurrentGuestSession()

  if (!isAuthenticated && !guestSession) {
    return (
      <Button onClick={onLogin} size="sm">
        Logga in
      </Button>
    )
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    // Clear guest session as well
    localStorage.removeItem('skolapp_guest')
  }

  if (guestSession && !isAuthenticated) {
    return (
      <div className="relative">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {guestSession.nickname || 'Gäst'}
        </Button>

        {isOpen && (
          <Card className="absolute right-0 top-full mt-2 w-64 z-50 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <Typography variant="body2" className="font-medium">
                  {guestSession.nickname || 'Gäst'}
                </Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Gästsession
                </Typography>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={onLogin}
                >
                  Skapa konto
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={handleLogout}
                >
                  Avsluta session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (user) {
    return (
      <div className="relative">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {user.firstName}
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>

        {isOpen && (
          <Card className="absolute right-0 top-full mt-2 w-72 z-50 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <Typography variant="body1" className="font-medium">
                  {getUserDisplayName(user)}
                </Typography>
                <Typography variant="caption" className="text-neutral-600">
                  {getRoleDisplayName(user.role)} • {getSubscriptionDisplayName(user.subscriptionPlan)}
                </Typography>
              </div>

              <div className="space-y-2">
                {canAccessTeacherPortal(user) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/teacher">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2m-6 0h2v4H9v-4z" />
                      </svg>
                      Lärarportal
                    </Link>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setIsOpen(false)
                    // TODO: Implement profile page
                    alert('Profilsida kommer snart!')
                  }}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Min profil
                </Button>

                {user.role === 'lärare' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setIsOpen(false)
                      // TODO: Implement subscription management
                      alert('Prenumerationshantering kommer snart!')
                    }}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Prenumeration
                  </Button>
                )}

                <hr className="my-2" />

                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={handleLogout}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logga ut
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return null
}