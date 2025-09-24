'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { dataRetentionService } from '@/lib/data-retention'
import { useAuth } from '@/contexts/AuthContext'
import { getDataRetentionDisplayName, getDataRetentionDescription } from '@/lib/auth-utils'

interface DataRetentionStatusProps {
  className?: string
}

export function DataRetentionStatus({ className }: DataRetentionStatusProps) {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeSessions: 0,
    pendingCleanups: 0,
    shortTermSessions: 0,
    longTermSessions: 0
  })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refreshStats = () => {
    const newStats = dataRetentionService.getRetentionStats()
    setStats(newStats)
    setLastUpdated(new Date())
  }

  useEffect(() => {
    refreshStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(refreshStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (!user) {
    return null
  }

  const currentMode = user.dataRetentionMode
  const hasConsent = user.hasParentalConsent
  const isMinor = user.isMinor

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>
            <Typography variant="h6">Datalagring & GDPR-status</Typography>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Current retention mode */}
          <div className="space-y-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <Typography variant="subtitle2" className="mb-2">
                Ditt dataläge
              </Typography>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body1" className="font-medium">
                    {getDataRetentionDisplayName(currentMode)}
                  </Typography>
                  <Typography variant="caption" className="text-neutral-600">
                    {getDataRetentionDescription(currentMode)}
                  </Typography>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentMode === 'korttid' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {currentMode === 'korttid' ? 'Korttid' : 'Långtid'}
                </div>
              </div>
            </div>

            {/* Consent status for minors */}
            {isMinor && currentMode === 'långtid' && (
              <div className={`rounded-lg p-4 ${
                hasConsent 
                  ? 'bg-success-50 border border-success-200' 
                  : 'bg-warning-50 border border-warning-200'
              }`}>
                <Typography variant="subtitle2" className={`mb-2 ${
                  hasConsent ? 'text-success-800' : 'text-warning-800'
                }`}>
                  Föräldrasamtycke
                </Typography>
                <div className="flex items-center justify-between">
                  <Typography variant="body2" className={
                    hasConsent ? 'text-success-700' : 'text-warning-700'
                  }>
                    {hasConsent 
                      ? 'Samtycke erhållet - långtidslagring aktiverad'
                      : 'Väntar på föräldrasamtycke - använder korttidsläge'
                    }
                  </Typography>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    hasConsent 
                      ? 'bg-success-600 text-white' 
                      : 'bg-warning-600 text-white'
                  }`}>
                    {hasConsent ? 'Godkänt' : 'Väntande'}
                  </span>
                </div>
              </div>
            )}

            {/* Session statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <Typography variant="h4" className="text-primary-600">
                  {stats.activeSessions}
                </Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Aktiva sessioner
                </Typography>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <Typography variant="h4" className="text-warning-600">
                  {stats.pendingCleanups}
                </Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Väntande cleanup
                </Typography>
              </div>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-2">
              <Typography variant="subtitle2" className="text-neutral-800">
                Sessionsfördelning
              </Typography>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Korttidssessioner:</span>
                <span className="font-medium">{stats.shortTermSessions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Långtidssessioner:</span>
                <span className="font-medium">{stats.longTermSessions}</span>
              </div>
            </div>

            {/* Last updated */}
            <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
              <Typography variant="caption" className="text-neutral-500">
                Senast uppdaterad: {lastUpdated?.toLocaleTimeString('sv-SE') || 'Aldrig'}
              </Typography>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshStats}
              >
                Uppdatera
              </Button>
            </div>

            {/* GDPR info */}
            <div className="bg-info-50 border border-info-200 rounded-lg p-3">
              <Typography variant="caption" className="text-info-800 font-medium block mb-1">
                GDPR-information
              </Typography>
              <Typography variant="caption" className="text-info-700">
                Data rensas automatiskt enligt vald lagringsmodell. För långtidslagring krävs 
                giltigt föräldrasamtycke för minderåriga. Du kan alltid begära dataexport eller 
                radering via kontoinställningar.
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}