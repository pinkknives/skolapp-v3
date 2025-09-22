import React from 'react'
import { cn } from '@/lib/utils'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

interface LayoutProps {
  children: React.ReactNode
  showNavbar?: boolean
  showFooter?: boolean
  className?: string
  navbarProps?: React.ComponentProps<typeof Navbar>
  footerProps?: React.ComponentProps<typeof Footer>
}

export function Layout({ 
  children, 
  showNavbar = true, 
  showFooter = true, 
  className,
  navbarProps,
  footerProps 
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="skip-to-content"
      >
        Hoppa till huvudinnehåll
      </a>

      {/* Navigation */}
      {showNavbar && <Navbar {...navbarProps} />}

      {/* Main content */}
      <main
        id="main-content"
        className={cn('flex-1', className)}
        tabIndex={-1}
      >
        {children}
      </main>

      {/* Footer */}
      {showFooter && <Footer {...footerProps} />}
    </div>
  )
}

// Container component for consistent content width and spacing
interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  as?: React.ElementType
}

export function Container({ 
  children, 
  size = 'xl', 
  className,
  as: Component = 'div'
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }

  return (
    <Component className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      sizeClasses[size],
      className
    )}>
      {children}
    </Component>
  )
}

// Section component for consistent vertical spacing
interface SectionProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Section({ 
  children, 
  className, 
  as: Component = 'section',
  spacing = 'lg'
}: SectionProps) {
  const spacingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24'
  }

  return (
    <Component className={cn(spacingClasses[spacing], className)}>
      {children}
    </Component>
  )
}