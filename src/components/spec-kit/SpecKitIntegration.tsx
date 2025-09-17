// Spec Kit Integration Component - Real API Implementation
'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { useSpecKitConnection } from '@/lib/spec-kit/hooks'

interface SpecKitProps {
  type: 'plan' | 'tasks'
  className?: string
}

export function SpecKitIntegration({ type, className }: SpecKitProps) {
  const { isConnected, status, version, error, checkConnection } = useSpecKitConnection()

  const handleSpecKitAction = () => {
    if (!isConnected) {
      checkConnection()
    } else {
      console.log(`Spec Kit ${type} integration active - API v${version}`)
    }
  }

  const getConnectionStatus = () => {
    if (error) return 'error'
    if (isConnected) return 'connected'
    return 'connecting'
  }

  const connectionStatus = getConnectionStatus()

  return (
    <div className={className}>
      <Card variant="outlined">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <svg 
              className={`h-5 w-5 ${
                connectionStatus === 'connected' 
                  ? 'text-success-600' 
                  : connectionStatus === 'error' 
                  ? 'text-error-600' 
                  : 'text-warning-600'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {connectionStatus === 'connected' ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              ) : connectionStatus === 'error' ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                />
              )}
            </svg>
            <span>Spec Kit Integration - {type}</span>
            {version && (
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                v{version}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {type === 'plan' 
              ? 'Educational curriculum planning powered by Spec Kit specifications and standards alignment'
              : 'Assignment and task management with Spec Kit integration for progress tracking'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' 
                  ? 'bg-success-500' 
                  : connectionStatus === 'error' 
                  ? 'bg-error-500' 
                  : 'bg-warning-500'
              }`} />
              <Typography variant="caption" className={
                connectionStatus === 'connected' 
                  ? 'text-success-700' 
                  : connectionStatus === 'error' 
                  ? 'text-error-700' 
                  : 'text-warning-700'
              }>
                {connectionStatus === 'connected' && 'Connected to Spec Kit API'}
                {connectionStatus === 'error' && `Connection error: ${error?.message || 'Unknown error'}`}
                {connectionStatus === 'connecting' && 'Checking connection...'}
              </Typography>
            </div>

            <Typography variant="body2" className="text-neutral-600">
              Spec Kit integration provides:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-sm text-neutral-600">
              {type === 'plan' ? (
                <>
                  <li>Standards-aligned curriculum planning and development</li>
                  <li>Learning objective tracking with measurable outcomes</li>
                  <li>Progress monitoring and analytics dashboard</li>
                  <li>Educational standards compliance verification</li>
                  <li>Collaborative planning tools for educators</li>
                </>
              ) : (
                <>
                  <li>Assignment creation with standards alignment</li>
                  <li>Automated due date management and reminders</li>
                  <li>Real-time progress tracking and analytics</li>
                  <li>Student collaboration and submission tools</li>
                  <li>Rubric-based assessment and grading</li>
                </>
              )}
            </ul>
            <div className="pt-4 flex gap-2">
              <Button 
                onClick={handleSpecKitAction} 
                variant={isConnected ? "primary" : "outline"}
                disabled={connectionStatus === 'connecting'}
              >
                {connectionStatus === 'connected' && `${type === 'plan' ? 'Manage Plans' : 'Manage Tasks'}`}
                {connectionStatus === 'error' && 'Retry Connection'}
                {connectionStatus === 'connecting' && 'Connecting...'}
              </Button>
              {isConnected && (
                <Button variant="ghost" size="sm">
                  View API Status
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}