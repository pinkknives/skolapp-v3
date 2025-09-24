'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: React.ElementType
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl', 
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full'
}

const paddingClasses = {
  none: '',
  sm: 'px-4 sm:px-6',
  md: 'px-4 sm:px-6 md:px-8',
  lg: 'px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16'
}

export function ResponsiveContainer({ 
  children, 
  size = 'xl', 
  padding = 'lg',
  className,
  as: Component = 'div'
}: ResponsiveContainerProps) {
  return (
    <Component className={cn(
      'mx-auto',
      sizeClasses[size],
      paddingClasses[padding],
      className
    )}>
      {children}
    </Component>
  )
}

// Section component for consistent vertical spacing
interface ResponsiveSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  as?: React.ElementType
}

const sectionPaddingClasses = {
  none: '',
  sm: 'py-8 sm:py-12',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-20',
  xl: 'py-16 sm:py-20 lg:py-24'
}

export function ResponsiveSection({ 
  children, 
  padding = 'lg',
  className,
  as: Component = 'section',
  ...rest
}: ResponsiveSectionProps) {
  return (
    <Component className={cn(
      sectionPaddingClasses[padding],
      className
    )} {...rest}>
      {children}
    </Component>
  )
}

// Typography component with responsive scaling
interface ResponsiveHeadingProps {
  children: React.ReactNode
  level: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  as?: React.ElementType
}

const headingSizeClasses = {
  1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
  2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  4: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
  5: 'text-base sm:text-lg md:text-xl lg:text-2xl',
  6: 'text-sm sm:text-base md:text-lg lg:text-xl'
}

export function ResponsiveHeading({ 
  children, 
  level, 
  className,
  as: Component = `h${level}` as unknown as React.ElementType
}: ResponsiveHeadingProps) {
  return (
    <Component className={cn(
      'font-bold leading-tight',
      headingSizeClasses[level],
      className
    )}>
      {children}
    </Component>
  )
}

// Grid component with responsive breakpoints
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-6 lg:gap-8',
  xl: 'gap-6 lg:gap-8 xl:gap-12'
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'lg'
}: ResponsiveGridProps) {
  const gridCols = [
    `grid-cols-${cols.default || 1}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  ].filter(Boolean).join(' ')

  return (
    <div className={cn(
      'grid',
      gridCols,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}
