'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface LogoProps {
  variant?: 'icon' | 'wordmark' | 'stacked' | 'color' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  priority?: boolean
}

const sizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
}

const logoVariants = {
  icon: '/brand/Skolapp-icon.png',
  wordmark: '/brand/Skolapp.png',
  stacked: '/brand/Skolapp-symbol.png',
  color: '/brand/Skolapp-color.png',
  gradient: '/brand/Skolapp-color-gradiant.png',
}

export function Logo({ 
  variant = 'wordmark', 
  size = 'md', 
  className,
  priority = false,
  ...props 
}: LogoProps) {
  const { width, height } = sizeMap[size]
  const src = logoVariants[variant]

  return (
    <div 
      className={cn(
        'flex items-center justify-center',
        className
      )}
      {...props}
    >
      <Image
        src={src}
        alt="Skolapp"
        width={width}
        height={height}
        priority={priority}
        className="object-contain"
      />
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