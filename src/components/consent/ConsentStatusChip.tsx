'use client'

import { CheckCircle, XCircle, Clock, AlertTriangle, HelpCircle } from 'lucide-react'
import { Typography } from '@/components/ui/Typography'

type ConsentStatus = 'missing' | 'pending' | 'granted' | 'revoked' | 'expired'

interface ConsentStatusChipProps {
  status: ConsentStatus
  expiresAt?: string
  className?: string
  showLabel?: boolean
}

export function ConsentStatusChip({ 
  status, 
  expiresAt, 
  className = '', 
  showLabel = true 
}: ConsentStatusChipProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'granted':
        const isExpiring = expiresAt && new Date(expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        return {
          icon: CheckCircle,
          label: isExpiring ? 'Går snart ut' : 'Godkänt',
          bgColor: isExpiring ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-green-100 dark:bg-green-900/20',
          textColor: isExpiring ? 'text-orange-800 dark:text-orange-200' : 'text-green-800 dark:text-green-200',
          iconColor: isExpiring ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400',
        }
      case 'pending':
        return {
          icon: Clock,
          label: 'Väntar',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          textColor: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-600 dark:text-blue-400',
        }
      case 'revoked':
        return {
          icon: XCircle,
          label: 'Återkallat',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-600 dark:text-red-400',
        }
      case 'expired':
        return {
          icon: AlertTriangle,
          label: 'Utgånget',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
          textColor: 'text-orange-800 dark:text-orange-200',
          iconColor: 'text-orange-600 dark:text-orange-400',
        }
      case 'missing':
      default:
        return {
          icon: HelpCircle,
          label: 'Ej begärt',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          textColor: 'text-gray-800 dark:text-gray-200',
          iconColor: 'text-gray-600 dark:text-gray-400',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
      {showLabel && (
        <Typography variant="caption" className="font-medium">
          {config.label}
        </Typography>
      )}
    </div>
  )
}

interface ConsentStatusIndicatorProps {
  status: ConsentStatus
  expiresAt?: string
  requiresConsent: boolean
  className?: string
}

export function ConsentStatusIndicator({ 
  status, 
  expiresAt, 
  requiresConsent, 
  className = '' 
}: ConsentStatusIndicatorProps) {
  if (!requiresConsent) {
    return (
      <div className={`text-gray-500 dark:text-gray-400 ${className}`}>
        <Typography variant="caption">
          Samtycke ej krävt
        </Typography>
      </div>
    )
  }

  return (
    <ConsentStatusChip 
      status={status} 
      expiresAt={expiresAt} 
      className={className}
    />
  )
}