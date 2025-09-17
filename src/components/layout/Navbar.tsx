import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'

interface NavItem {
  href: string
  label: string
  icon?: React.ReactNode
}

interface NavbarProps {
  items?: NavItem[]
  logo?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

const defaultItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/plan', label: 'Plan' },
  { href: '/tasks', label: 'Tasks' },
]

export function Navbar({ 
  items = defaultItems, 
  logo, 
  actions, 
  className 
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

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
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  )

  const CloseIcon = () => (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )

  return (
    <nav
      className={cn(
        'sticky top-0 z-fixed bg-white/95 backdrop-blur-md border-b border-neutral-200',
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
              aria-label="Go to homepage"
            >
              {logo || (
                <>
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                  </svg>
                  <Typography variant="h6" className="font-bold">
                    Skolapp
                  </Typography>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {items.map((item) => {
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
            {items.map((item) => {
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
          {actions && (
            <div className="pt-4 pb-3 border-t border-neutral-200">
              <div className="px-2 space-y-2">
                {actions}
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}