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
import { User, ChevronDown, GraduationCap, CreditCard, LogOut } from 'lucide-react'

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
          className="gap-x-2"
        >
          <User size={16} strokeWidth={2} />
          {guestSession.nickname || 'Gäst'}
        </Button>

        {isOpen && (
          <Card className="absolute right-0 top-full mt-2 w-64 z-50 shadow-lg" padding="sm">
            <CardContent>
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
          className="gap-x-2"
          data-testid="user-profile"
        >
          <User size={16} strokeWidth={2} />
          {user.firstName}
          <ChevronDown size={16} strokeWidth={2} />
        </Button>

        {isOpen && (
          <Card className="absolute right-0 top-full mt-2 w-72 z-50 shadow-lg" padding="sm">
            <CardContent>
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
                    className="gap-x-2"
                  >
                    <Link href="/teacher">
                      <GraduationCap size={16} strokeWidth={2} />
                      Lärarportal
                    </Link>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  asChild
                  onClick={() => setIsOpen(false)}
                  className="gap-x-2"
                >
                  <Link href="/profile">
                    <User size={16} strokeWidth={2} />
                    Min profil
                  </Link>
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
                    className="gap-x-2"
                  >
                    <CreditCard size={16} strokeWidth={2} />
                    Prenumeration
                  </Button>
                )}

                <hr className="my-2" />

                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={handleLogout}
                  className="gap-x-2"
                >
                  <LogOut size={16} strokeWidth={2} />
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