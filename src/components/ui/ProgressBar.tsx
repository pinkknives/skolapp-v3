import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  className?: string
  variant?: 'success' | 'warning' | 'error' | 'primary'
  size?: 'sm' | 'md' | 'lg'
}

export function ProgressBar({ 
  value, 
  className,
  variant = 'primary',
  size = 'md'
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2', 
    lg: 'h-3'
  }

  const variantClasses = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    primary: 'bg-primary-500'
  }

  // Auto-determine variant based on value if not specified
  const autoVariant = variant === 'primary' 
    ? value >= 80 ? 'success' : value >= 60 ? 'warning' : 'error'
    : variant

  return (
    <div className={cn(
      'w-full bg-neutral-200 rounded-full overflow-hidden',
      sizeClasses[size],
      className
    )}>
      <div
        className={cn(
          'h-full rounded-full progress-bar',
          variantClasses[autoVariant]
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${value}% färdigt`}
      />
    </div>
  )
}