'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Sparkles, Loader2 } from 'lucide-react'
import { quizAI } from '@/lib/ai/quizProvider'
import { UpgradeModal } from '@/components/billing/UpgradeModal'

interface AIHintButtonProps {
  /** Button text */
  children: string
  /** Accessible button label */
  ariaLabel: string
  /** Tooltip text shown on hover */
  tooltip?: string
  /** Whether button should be disabled */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
  /** Click handler */
  onClick: () => void
  /** Button variant */
  variant?: 'primary' | 'outline' | 'ghost'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** CSS classes */
  className?: string
}

export function AIHintButton({
  children,
  ariaLabel,
  tooltip,
  disabled = false,
  loading = false,
  onClick,
  variant = 'outline',
  size = 'sm',
  className = ''
}: AIHintButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  
  const featureStatus = quizAI.getFeatureStatus()
  const isDisabled = disabled || loading

  const tooltipText = !featureStatus.available 
    ? (featureStatus.reason || 'AI kräver uppgradering')
    : tooltip

  const handleClick = () => {
    if (!featureStatus.available) {
      setShowUpgrade(true)
      return
    }
    if (!isDisabled) {
      onClick()
    }
  }

  return (
    <div className="relative inline-block">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        aria-label={ariaLabel}
        className={`gap-x-2 ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
     >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {children}
      </Button>

      {/* Tooltip */}
      {(showTooltip && tooltipText) && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap"
          role="tooltip"
        >
          {tooltipText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-neutral-900"></div>
        </div>
      )}

      <UpgradeModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        onUpgrade={() => {
          setShowUpgrade(false)
          window.location.href = '/pricing'
        }}
      />
    </div>
  )
}

export default AIHintButton