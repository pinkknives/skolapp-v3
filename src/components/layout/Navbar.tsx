'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { UserMenu } from '@/components/auth/UserMenu'
import { useAuth } from '@/contexts/AuthContext'
import { canAccessTeacherPortal } from '@/lib/auth-utils'
import { ResponsiveLogo } from '@/components/brand/Logo'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useSearchParams } from 'next/navigation'

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
  className?: string
}

export function Navbar({ 
  items, 
  logo, 
  className 
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false)
  const [bannerReason, setBannerReason] = useState<'onboarding' | 'quiz' | 'class' | null>(null)
  const QUIZ_INACTIVITY_DAYS = Number(process.env.NEXT_PUBLIC_ONBOARDING_INACTIVITY_DAYS || 7)
  const CLASS_INACTIVITY_DAYS = Number(process.env.NEXT_PUBLIC_ONBOARDING_CLASS_INACTIVITY_DAYS || QUIZ_INACTIVITY_DAYS)
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    const param = searchParams.get('onboarding') === 'true'
    const dismissed = typeof window !== 'undefined' && localStorage.getItem('sk_onboarding_banner_dismissed') === '1'
    // Base condition: onboarding query param
    let shouldShow = param && !dismissed
    let reason: 'onboarding' | 'quiz' | 'class' | null = param ? 'onboarding' : null

    try {
      const lastQuizTs = localStorage.getItem('sk_last_quiz_created_at')
      const lastClassTs = localStorage.getItem('sk_last_class_created_at')
      const lastSeen = localStorage.getItem('sk_onboarding_banner_last_shown')
      const now = Date.now()
      const msQuiz = QUIZ_INACTIVITY_DAYS * 24 * 60 * 60 * 1000
      const msClass = CLASS_INACTIVITY_DAYS * 24 * 60 * 60 * 1000
      const quizInactive = !lastQuizTs || now - parseInt(lastQuizTs, 10) > msQuiz
      const classInactive = !lastClassTs || now - parseInt(lastClassTs, 10) > msClass
      const bannerCooldownOk = !lastSeen || now - parseInt(lastSeen, 10) > Math.min(msQuiz, msClass)
      if (!shouldShow && (quizInactive || classInactive) && bannerCooldownOk && !dismissed) {
        shouldShow = true
        // Prefer quiz call-to-action if both are inactive
        reason = quizInactive ? 'quiz' : 'class'
      }
      if (shouldShow) {
        localStorage.setItem('sk_onboarding_banner_last_shown', String(now))
      }
    } catch {}

    setShowOnboardingBanner(shouldShow)
    setBannerReason(reason)
  }, [searchParams, QUIZ_INACTIVITY_DAYS, CLASS_INACTIVITY_DAYS])

  const dismissOnboarding = () => {
    try { localStorage.setItem('sk_onboarding_banner_dismissed', '1') } catch {}
    setShowOnboardingBanner(false)
  }

  // Define navigation items based on authentication state
  const getNavigationItems = (): NavItem[] => {
    if (items) return items

    const defaultItems: NavItem[] = [
      { href: '/', label: 'Hem' },
      { href: '/#unique-selling-points', label: 'Lösning' },
      { href: '/#how-it-works', label: 'Så funkar det' },
      { href: '/#social-proof', label: 'Referenser' },
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
        className={cn(
          'sticky top-0 z-40 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800',
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {showOnboardingBanner && (
          <div className="w-full bg-primary-50 text-primary-800 text-sm py-2 border-b border-primary-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <span>
                {bannerReason === 'class'
                  ? 'Välkommen! Lägg till din första klass för att komma igång.'
                  : 'Välkommen! Skapa ditt första quiz på under 2 minuter.'}
              </span>
              <div className="flex items-center gap-4">
                <Link
                  href={bannerReason === 'class' ? '/teacher/classes' : '/teacher/quiz/create'}
                  onClick={dismissOnboarding}
                  className="text-primary-700 hover:underline font-medium"
                >
                  {bannerReason === 'class' ? 'Skapa första klassen →' : 'Skapa första quizet →'}
                </Link>
                <button
                  type="button"
                  onClick={dismissOnboarding}
                  className="text-primary-700/70 hover:text-primary-800"
                  aria-label="Stäng onboarding-banner"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={cn(
            "flex items-center justify-between transition-all duration-200",
            isScrolled ? "h-14" : "h-16"
          )}>
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-50 dark:focus:ring-offset-neutral-900 rounded-md"
                aria-label="Go to homepage"
              >
                {logo || (
                  <ResponsiveLogo 
                    mobileVariant="icon"
                    desktopVariant="icon"
                    size="lg" 
                    priority 
                    showText
                  />
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
                          ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/30 dark:text-primary-200'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50'
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
              <ThemeToggle />
              {!isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/live/join">Elev: gå med</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login">Logga in lärare</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">Skapa konto</Link>
                  </Button>
                </div>
              )}
              {isAuthenticated && (
                <UserMenu onLogin={() => (window.location.href = '/login')} />
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
            className="md:hidden animate-slide-down border-t border-neutral-200 bg-white dark:bg-neutral-950 dark:border-neutral-800"
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
                        ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/30 dark:text-primary-200'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50'
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
            <div className="pt-4 pb-3 border-t border-neutral-200 dark:border-neutral-800">
              <div className="px-2 space-y-2">
                <ThemeToggle className="w-full justify-center" />
                {!isAuthenticated && (
                  <>
                    <Button variant="ghost" fullWidth asChild>
                      <Link href="/live/join" onClick={() => setIsMobileMenuOpen(false)}>
                        Elev: gå med
                      </Link>
                    </Button>
                    <Button variant="outline" fullWidth asChild>
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        Logga in lärare
                      </Link>
                    </Button>
                    <Button fullWidth asChild>
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        Skapa konto
                      </Link>
                    </Button>
                  </>
                )}
                {isAuthenticated && (
                  <div className="px-2">
                    <UserMenu onLogin={() => (window.location.href = '/login')} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

    </>
  )
}
