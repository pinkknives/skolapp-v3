'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface LogoProps {
  variant?: 'icon' | 'wordmark' | 'stacked' | 'color' | 'gradient' | 'monochrome' | 'white' | 'dark'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  className?: string
  priority?: boolean
  showText?: boolean
  textClassName?: string
  ariaLabel?: string
  tagline?: string
  taglineClassName?: string
}

const sizeMap = {
  xs: { width: 16, height: 16 },
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
  '2xl': { width: 80, height: 80 },
  '3xl': { width: 96, height: 96 },
}

const logoVariants = {
  icon: '/brand/Skolapp-icon.png',
  wordmark: '/brand/skolapp_logo_teal_v1.png',
  stacked: '/brand/Skolapp-symbol.png',
  color: '/brand/Skolapp-color.png',
  gradient: '/brand/Skolapp-color-gradiant.png',
  monochrome: '/brand/Skolapp-monochrome.png',
  white: '/brand/Skolapp-white.png',
  dark: '/brand/Skolapp-dark.png',
}

export function Logo({ 
  variant = 'wordmark', 
  size = 'md', 
  className,
  priority = false,
  showText = false,
  textClassName,
  ariaLabel,
  tagline,
  taglineClassName,
  ...props 
}: LogoProps) {
  const { width, height } = sizeMap[size]
  const src = logoVariants[variant]

  const isWordmark = variant === 'wordmark'

  // For wordmark, always render text. For other variants, only if explicitly requested.
  const shouldShowText = isWordmark || !!showText

  return (
    <div 
      className={cn(
        'flex items-center justify-center',
        shouldShowText && 'space-x-2',
        className
      )}
      {...props}
    >
      {/* Render image; for wordmark use teal in light and filter to white in dark */}
      {(
        <Image
          src={src}
          alt="Skolapp"
          width={width}
          height={height}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className={cn(
            'object-contain',
            // Apply filters for special variants
            variant === 'monochrome' && 'brightness-0 contrast-100',
            variant === 'white' && 'brightness-0 invert',
            variant === 'dark' && 'brightness-0',
            (variant === 'wordmark' || variant === 'icon') && 'dark:brightness-0 dark:invert'
          )}
          aria-hidden={ariaLabel ? undefined : true}
        />
      )}
      {(shouldShowText && !isWordmark) || ariaLabel ? (
        <span
          className={cn(
          'font-bold text-primary-600 dark:text-white',
          size === 'xs' && 'text-xs',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg',
          size === 'xl' && 'text-xl',
          size === '2xl' && 'text-2xl',
          size === '3xl' && 'text-3xl',
          textClassName
        )}
          aria-label={ariaLabel}
        >
          Skolapp
        </span>
      ) : null}
      {tagline && (
        <span
          className={cn(
            'ml-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400',
            taglineClassName
          )}
        >
          {tagline}
        </span>
      )}
    </div>
  )
}

// Convenience components for common use cases
export function LogoIcon(props: Omit<LogoProps, 'variant'>) {
  return <Logo variant="icon" {...props} />
}

export function LogoWordmark(props: Omit<LogoProps, 'variant'>) {
  return <Logo variant="wordmark" {...props} />
}

export function LogoStacked(props: Omit<LogoProps, 'variant'>) {
  return <Logo variant="stacked" {...props} />
}

export function LogoColor(props: Omit<LogoProps, 'variant'>) {
  return <Logo variant="color" {...props} />
}

export function LogoGradient(props: Omit<LogoProps, 'variant'>) {
  return <Logo variant="gradient" {...props} />
}

export function LogoMonochrome(props: Omit<LogoProps, 'variant'>) {
  return <Logo variant="monochrome" {...props} />
}

export function LogoWhite(props: Omit<LogoProps, 'variant'>) {
  return <Logo variant="white" {...props} />
}

export function LogoDark(props: Omit<LogoProps, 'variant'>) {
  return <Logo variant="dark" {...props} />
}

// Responsive logo component that adapts to screen size
export function ResponsiveLogo({ 
  mobileVariant = 'icon',
  desktopVariant = 'wordmark',
  className,
  ...props 
}: Omit<LogoProps, 'variant'> & {
  mobileVariant?: LogoProps['variant']
  desktopVariant?: LogoProps['variant']
}) {
  return (
    <>
      {/* Mobile logo */}
      <div className={cn('block md:hidden', className)}>
        <Logo variant={mobileVariant} {...props} />
      </div>
      
      {/* Desktop logo */}
      <div className={cn('hidden md:block', className)}>
        <Logo variant={desktopVariant} {...props} />
      </div>
    </>
  )
}
