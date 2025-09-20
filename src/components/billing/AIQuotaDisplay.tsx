'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AlertTriangle, Crown, Zap } from 'lucide-react'
import { getStripeConfig } from '@/lib/billing'

interface UsageData {
  used: number
  quota: number
  unlimited: boolean
  periodStart: string
  periodEnd: string
  remaining: number
}

interface AIQuotaDisplayProps {
  className?: string
}

export function AIQuotaDisplay({ className = '' }: AIQuotaDisplayProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/ai/usage')
      if (!response.ok) {
        throw new Error('Kunde inte hämta AI-användning')
      }
      const data = await response.json()
      setUsage(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      const stripeConfig = getStripeConfig()
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: stripeConfig.monthlyPriceId,
          mode: 'subscription'
        })
      })

      if (!response.ok) {
        throw new Error('Kunde inte starta checkout')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Upgrade error:', error)
      // Show error to user
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
            <div className="h-2 bg-neutral-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !usage) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <Typography variant="body2" className="text-neutral-600">
            {error || 'Kunde inte ladda AI-användning'}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const { used, quota, unlimited, remaining } = usage
  const percentage = unlimited ? 100 : Math.min((used / quota) * 100, 100)
  const isNearLimit = !unlimited && remaining <= 5
  const isOverLimit = !unlimited && remaining <= 0

  if (unlimited) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={16} className="text-primary-500" />
            <Typography variant="body2" className="font-medium">
              AI-funktioner (Obegränsat)
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-primary-500" />
            <Typography variant="caption" className="text-neutral-600">
              {used} AI-frågor denna månad
            </Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-2">
          <Typography variant="body2" className="font-medium">
            AI-användning denna månad
          </Typography>
          {isNearLimit && (
            <AlertTriangle size={16} className="text-warning-500" />
          )}
        </div>
        
        <div className="space-y-2">
          <ProgressBar 
            value={percentage} 
            className={`h-2 ${isOverLimit ? 'bg-error-100' : ''}`}
            variant={isOverLimit ? 'error' : 'primary'}
          />
          
          <div className="flex justify-between items-center">
            <Typography variant="caption" className="text-neutral-600">
              {used} av {quota} AI-frågor
            </Typography>
            <Typography 
              variant="caption" 
              className={`font-medium ${
                isOverLimit ? 'text-error-600' : 
                isNearLimit ? 'text-warning-600' : 
                'text-neutral-600'
              }`}
            >
              {remaining} kvar
            </Typography>
          </div>

          {isNearLimit && (
            <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <Typography variant="caption" className="text-warning-700 block mb-2">
                {isOverLimit 
                  ? 'Du har nått din månadsgräns för AI-frågor. Uppgradera för obegränsad åtkomst.'
                  : 'Du närmar dig din månadsgräns för AI-frågor.'
                }
              </Typography>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleUpgrade}
                className="bg-primary-500 hover:bg-primary-600 text-white border-0"
              >
                <Crown size={14} className="mr-1" />
                Uppgradera till Pro
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}