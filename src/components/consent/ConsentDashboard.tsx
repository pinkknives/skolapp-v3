'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { ConsentStatusPanel } from './ConsentStatusPanel'
import { ConsentHistory } from './ConsentHistory'
import { DataOverview } from './DataOverview'
import { longTermDataService } from '@/lib/long-term-data'
import { type ConsentRecord } from '@/types/auth'

interface ConsentDashboardProps {
  token?: string
  studentId?: string
}

export function ConsentDashboard({ token, studentId }: ConsentDashboardProps) {
  const [currentConsent, setCurrentConsent] = useState<ConsentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'data'>('overview')

  useEffect(() => {
    // In real implementation, validate token and load consent data
    // For demo purposes, we'll simulate loading consent data
    const loadConsentData = async () => {
      try {
        setLoading(true)
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock consent data - in real implementation, fetch from backend using token
        const mockConsent: ConsentRecord = {
          id: 'consent_12345',
          studentId: studentId || 'student_123',
          parentEmail: 'foralder@exempel.se',
          parentName: 'Anna Andersson',
          consentType: 'data_retention',
          status: 'approved',
          requestedAt: new Date('2024-01-15'),
          respondedAt: new Date('2024-01-16'),
          expiresAt: new Date('2025-01-16'),
          consentMethod: 'email_link',
          auditLog: [
            {
              id: 'audit_1',
              timestamp: new Date('2024-01-15T10:00:00'),
              action: 'created',
              details: 'Consent request created via email_link',
            },
            {
              id: 'audit_2',
              timestamp: new Date('2024-01-16T14:30:00'),
              action: 'approved',
              details: 'Consent approved by parent via secure email link',
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
            }
          ]
        }
        
        setCurrentConsent(mockConsent)
      } catch (err) {
        setError('Kunde inte ladda samtyckesinformation. Försök igen senare.')
      } finally {
        setLoading(false)
      }
    }

    loadConsentData()
  }, [token, studentId])

  const handleConsentAction = async (action: 'approve' | 'deny' | 'revoke') => {
    if (!currentConsent) return

    try {
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update consent status
      const updatedConsent = {
        ...currentConsent,
        status: action === 'approve' ? 'approved' as const : 
               action === 'deny' ? 'denied' as const : 
               'denied' as const, // For revoke, we set to denied
        respondedAt: new Date(),
        auditLog: [
          ...currentConsent.auditLog,
          {
            id: `audit_${Date.now()}`,
            timestamp: new Date(),
            action: action === 'revoke' ? 'revoked' as const : action,
            details: `Consent ${action}d by parent via dashboard`,
            ipAddress: '192.168.1.100',
            userAgent: navigator.userAgent,
          }
        ]
      }
      
      setCurrentConsent(updatedConsent)
      
      // In real implementation, also call longTermDataService to update local storage
      if (action === 'revoke' || action === 'deny') {
        // Trigger data cleanup
        console.log('Triggering data cleanup for withdrawn consent')
      }
      
    } catch (err) {
      setError('Kunde inte uppdatera samtycke. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <Typography variant="body1" className="text-neutral-600">
            Laddar samtyckesinformation...
          </Typography>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-error-200 bg-error-50">
          <CardContent className="p-6 text-center">
            <Typography variant="h3" className="text-error-700 mb-4">
              Ett fel uppstod
            </Typography>
            <Typography variant="body1" className="text-error-600 mb-4">
              {error}
            </Typography>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Försök igen
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentConsent) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-warning-200 bg-warning-50">
          <CardContent className="p-6 text-center">
            <Typography variant="h3" className="text-warning-700 mb-4">
              Ingen samtyckesinformation hittades
            </Typography>
            <Typography variant="body1" className="text-warning-600">
              Det verkar som att länken är ogiltig eller har upphört att gälla.
            </Typography>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tabs = [
    { id: 'overview' as const, label: 'Översikt', icon: '👀' },
    { id: 'history' as const, label: 'Historik', icon: '📋' },
    { id: 'data' as const, label: 'Data', icon: '💾' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Typography variant="h1" className="mb-2">
          Samtycke för {currentConsent.studentId}
        </Typography>
        <Typography variant="body1" className="text-neutral-600">
          Hantera hur ditt barns data används och lagras i Skolapp
        </Typography>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <ConsentStatusPanel 
          consent={currentConsent}
          onConsentAction={handleConsentAction}
          loading={loading}
        />
      )}

      {activeTab === 'history' && (
        <ConsentHistory 
          auditLog={currentConsent.auditLog}
        />
      )}

      {activeTab === 'data' && (
        <DataOverview 
          studentId={currentConsent.studentId}
          consentStatus={currentConsent.status}
        />
      )}
    </div>
  )
}