'use client'

import React, { forwardRef, useRef } from 'react'
import { Button } from './Button'
import confetti from 'canvas-confetti'
import type { ButtonProps } from './Button'

export type AgeGroup = 'young' | 'middle' | 'old' | 'adult'

interface AgeBasedButtonProps extends Omit<ButtonProps, 'children'> {
  children: React.ReactNode
  ageGroup: AgeGroup
  showConfetti?: boolean
  onConfetti?: () => void
}

const confettiConfig = {
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
}

export const AgeBasedButton = forwardRef<HTMLButtonElement, AgeBasedButtonProps>(
  ({ children, ageGroup, showConfetti = true, onConfetti, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const handleConfetti = () => {
      if (showConfetti && (ageGroup === 'young' || ageGroup === 'middle')) {
        const rect = buttonRef.current?.getBoundingClientRect()
        if (rect) {
          confetti({
            ...confettiConfig,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight,
            },
          })
        }
        onConfetti?.()
      }
      props.onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>)
    }

    // Different styles based on age group
    const getAgeBasedStyles = () => {
      switch (ageGroup) {
        case 'young':
          return 'text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
        case 'middle':
          return 'text-xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-md hover:shadow-lg transform hover:scale-102 transition-all duration-200'
        case 'old':
          return 'text-lg font-medium bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-sm hover:shadow-md transition-all duration-200'
        case 'adult':
          return 'text-base font-normal bg-neutral-100 text-neutral-900 hover:bg-neutral-200 shadow-sm transition-all duration-200'
        default:
          return ''
      }
    }

    return (
      <Button
        ref={ref || buttonRef}
        onClick={handleConfetti}
        className={`${getAgeBasedStyles()} ${props.className || ''}`}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

AgeBasedButton.displayName = 'AgeBasedButton'

// Convenience components for each age group
export function YoungButton(props: Omit<AgeBasedButtonProps, 'ageGroup'>) {
  return <AgeBasedButton {...props} ageGroup="young" showConfetti={props.showConfetti !== false} />
}

export function MiddleButton(props: Omit<AgeBasedButtonProps, 'ageGroup'>) {
  return <AgeBasedButton {...props} ageGroup="middle" showConfetti={props.showConfetti !== false} />
}

export function OldButton(props: Omit<AgeBasedButtonProps, 'ageGroup'>) {
  return <AgeBasedButton {...props} ageGroup="old" showConfetti={props.showConfetti === true} />
}

export function AdultButton(props: Omit<AgeBasedButtonProps, 'ageGroup'>) {
  return <AgeBasedButton {...props} ageGroup="adult" showConfetti={props.showConfetti === true} />
}

// Legacy export for backward compatibility
export const ConfettiButton = YoungButton