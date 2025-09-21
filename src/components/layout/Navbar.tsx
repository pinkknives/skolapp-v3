'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { UserMenu } from '@/components/auth/UserMenu'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/contexts/AuthContext'
import { canAccessTeacherPortal } from '@/lib/auth-utils'
import { LogoIcon } from '@/components/brand/Logo'
import { Menu, X } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon?: React.ReactNode
  requiresAuth?: boolean
  roles?: string[]
}

interface NavbarProps {
  items?: NavItem[]
  logo?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function Navbar({ 
  items, 
  logo, 
  actions, 
  className 
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'guest'>('login')
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  // Define navigation items based on authentication state
  const getNavigationItems = (): NavItem[] => {
    if (items) return items

    const defaultItems: NavItem[] = [
      { href: '/', label: 'Hem' },
      { href: '/quiz/join', label: 'Gå med i Quiz' },
    ]

    // Add teacher portal for authenticated teachers
    if (isAuthenticated && canAccessTeacherPortal(user)) {
      defaultItems.push({ href: '/teacher', label: 'Lärarportal' })
    }

    return defaultItems
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsScrolled(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleAuthClick = (mode: 'login' | 'register' | 'guest' = 'login') => {
    if (mode === 'login' || mode === 'register') {
      // Redirect to login page for Supabase magic link auth
      window.location.href = '/login'
    } else {
      // Keep guest login as modal
      setAuthMode(mode)
      setShowAuthModal(true)
    }
  }

  const MenuIcon = () => (
    <Menu
      size={20}
      strokeWidth={2}
      aria-hidden="true"
    />
  )

  const CloseIcon = () => (
    <X
      size={20}
      strokeWidth={2}
      aria-hidden="true"
    />
  )

  const navigationItems = getNavigationItems()

  return (
    <>
      <nav
        data-testid="nav-primary"
        className={cn(
          'sticky top-0 z-fixed bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all duration-200',
          isScrolled && 'shadow-md',
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={cn(
            "flex items-center justify-between transition-all duration-200",
            isScrolled ? "h-14" : "h-16"
          )}>
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
                aria-label="Go to homepage"
              >
                {logo || (
                  <div className="flex items-center space-x-2">
                    <LogoIcon size="lg" priority className="text-primary-600" />
                    <Typography variant="h6" className="font-bold text-primary-600">
                      Skolapp
                    </Typography>
                  </div>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigationItems.map((item) => {
                  const isActive = isActiveLink(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                        isActive
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.icon && (
                        <span className="flex-shrink-0" aria-hidden="true">
                          {item.icon}
                        </span>
                      )}
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {actions}
              {!isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleAuthClick('guest')}
                  >
                    Prova som gäst
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAuthClick('login')}
                  >
                    Logga in
                  </Button>
                </div>
              )}
              {isAuthenticated && (
                <UserMenu onLogin={() => handleAuthClick('login')} />
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden animate-slide-down border-t border-neutral-200 bg-white"
            id="mobile-menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigationItems.map((item) => {
                const isActive = isActiveLink(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium block transition-colors duration-200',
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
            
            {/* Mobile Auth Actions */}
            <div className="pt-4 pb-3 border-t border-neutral-200">
              <div className="px-2 space-y-2">
                {!isAuthenticated && (
                  <>
                    <Button 
                      variant="outline" 
                      fullWidth
                      onClick={() => {
                        handleAuthClick('guest')
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      Prova som gäst
                    </Button>
                    <Button 
                      fullWidth
                      onClick={() => {
                        handleAuthClick('login')
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      Logga in
                    </Button>
                  </>
                )}
                {isAuthenticated && (
                  <div className="px-2">
                    <UserMenu onLogin={() => handleAuthClick('login')} />
                  </div>
                )}
                {actions}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  )
}