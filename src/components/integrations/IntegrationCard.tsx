import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { type Integration } from '@/types/integrations'
import { getIntegrationStatusText, getIntegrationTypeText } from '@/lib/integrations'

interface IntegrationCardProps {
  integration: Integration
  onDelete: () => void
  onEdit: () => void
  onTest: () => void
}

export function IntegrationCard({ integration, onDelete, onEdit, onTest }: IntegrationCardProps) {
  const statusColor = getStatusColor(integration.status)
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{integration.name}</CardTitle>
            <Typography variant="body2" className="text-neutral-600 mt-1">
              {getIntegrationTypeText(integration.type)}
            </Typography>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {getIntegrationStatusText(integration.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Typography variant="body2" className="mb-4 text-neutral-700">
          {integration.description}
        </Typography>

        {integration.lastSyncAt && (
          <div className="mb-4">
            <Typography variant="body2" className="text-neutral-600">
              Senast synkroniserad: {formatDateTime(integration.lastSyncAt)}
            </Typography>
          </div>
        )}

        {integration.errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <Typography variant="body2" className="text-red-800">
              {integration.errorMessage}
            </Typography>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={onTest}
            className="justify-center"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Testa anslutning
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1 justify-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Redigera
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="flex-1 justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Ta bort
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}