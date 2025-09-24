'use client'

import { Toaster } from 'sonner'
import React from 'react'

type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

function computeAutoPosition(): ToastPosition {
  if (typeof window === 'undefined') return 'top-right'
  const isSmall = window.matchMedia('(max-width: 640px)').matches
  const isTablet = !isSmall && window.matchMedia('(max-width: 1024px)').matches
  return isSmall ? 'bottom-center' : isTablet ? 'top-center' : 'top-right'
}

function getOverridePosition(): ToastPosition | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem('sk_toast_position')
  if (!v) return null
  if (v === 'mobile') return 'bottom-center'
  if (v === 'tablet') return 'top-center'
  if (v === 'desktop') return 'top-right'
  // direct sonner positions allowed too
  return (['top-left','top-center','top-right','bottom-left','bottom-center','bottom-right'] as ToastPosition[]).includes(v as ToastPosition)
    ? (v as ToastPosition)
    : null
}

export function ToastProvider() {
  const [position, setPosition] = React.useState<ToastPosition>(computeAutoPosition())

  React.useEffect(() => {
    const update = () => {
      const override = getOverridePosition()
      setPosition(override || computeAutoPosition())
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('storage', (e) => {
      if (e.key === 'sk_toast_position') update()
    })
    return () => {
      window.removeEventListener('resize', update)
    }
  }, [])

  const isSmall = typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false

  return (
    <Toaster
      position={position}
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        duration: 4500,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))',
          margin: isSmall ? '0 12px 16px 12px' : '12px',
          maxWidth: isSmall ? '92vw' : '420px',
        },
        className: 'toast',
      }}
    />
  )
}

// Hook för att använda toast
export { toast } from 'sonner'
