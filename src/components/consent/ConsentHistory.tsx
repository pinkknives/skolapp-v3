'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { type ConsentAuditEntry } from '@/types/auth'

interface ConsentHistoryProps {
  auditLog: ConsentAuditEntry[]
}

export function ConsentHistory({ auditLog }: ConsentHistoryProps) {
  const getActionInfo = (action: ConsentAuditEntry['action']) => {
    switch (action) {
      case 'created':
        return {
          icon: '📝',
          title: 'Begäran skapad',
          color: 'info'
        }
      case 'sent':
        return {
          icon: '📧',
          title: 'Skickad',
          color: 'info'
        }
      case 'viewed':
        return {
          icon: '👁️',
          title: 'Visad',
          color: 'info'
        }
      case 'approved':
        return {
          icon: '✅',
          title: 'Godkänd',
          color: 'success'
        }
      case 'denied':
        return {
          icon: '❌',
          title: 'Nekad',
          color: 'error'
        }
      case 'expired':
        return {
          icon: '⏰',
          title: 'Upphörd',
          color: 'neutral'
        }
      case 'revoked':
        return {
          icon: '🚫',
          title: 'Återkallad',
          color: 'warning'
        }
    }
  }

  const sortedAuditLog = [...auditLog].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Samtyckes-historik</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body2" className="text-neutral-600 mb-6">
            En fullständig logg över alla åtgärder och ändringar gällande samtycket. 
            Detta säkerställer transparens och spårbarhet enligt GDPR.
          </Typography>

          <div className="space-y-4">
            {sortedAuditLog.map((entry, index) => {
              const actionInfo = getActionInfo(entry.action)
              const isLatest = index === 0

              return (
                <div 
                  key={entry.id}
                  className={`border-l-4 pl-4 py-3 ${
                    isLatest ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-xl mt-1">{actionInfo.icon}</span>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Typography 
                          variant="subtitle2" 
                          className={`${isLatest ? 'text-primary-800' : 'text-neutral-800'}`}
                        >
                          {actionInfo.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          className="text-neutral-500 text-sm"
                        >
                          {new Date(entry.timestamp).toLocaleString('sv-SE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </div>
                      
                      <Typography 
                        variant="body2" 
                        className={`${isLatest ? 'text-primary-700' : 'text-neutral-600'} mb-2`}
                      >
                        {entry.details}
                      </Typography>
                      
                      {/* Technical details (IP, User Agent) */}
                      {(entry.ipAddress || entry.userAgent) && (
                        <details className="mt-2">
                          <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-700">
                            Teknisk information
                          </summary>
                          <div className="mt-2 text-xs text-neutral-500 bg-neutral-50 p-2 rounded border">
                            {entry.ipAddress && (
                              <div>
                                <strong>IP-adress:</strong> {entry.ipAddress}
                              </div>
                            )}
                            {entry.userAgent && (
                              <div className="mt-1">
                                <strong>Enhet:</strong> {entry.userAgent}
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* GDPR Information */}
      <Card className="bg-info-50 border-info-200">
        <CardContent className="p-4">
          <Typography variant="subtitle2" className="text-info-800 mb-2">
            📋 GDPR-kompatibel loggning
          </Typography>
          <Typography variant="body2" className="text-info-700">
            Alla åtgärder loggas enligt artikel 30 i GDPR för att säkerställa transparens 
            och möjliggöra revision. IP-adresser och enhetsuppgifter sparas endast för 
            säkerhetsändamål och raderas automatiskt efter 90 dagar.
          </Typography>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exportera data</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body2" className="text-neutral-600 mb-4">
            Du har rätt att få en kopia av all data som rör ditt samtycke enligt GDPR artikel 15.
          </Typography>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                // In real implementation, trigger CSV export
                const csvContent = sortedAuditLog.map(entry => 
                  `${entry.timestamp.toISOString()},${entry.action},"${entry.details}",${entry.ipAddress || ''},${entry.userAgent || ''}`
                ).join('\n')
                
                const header = 'Tidsstämpel,Åtgärd,Detaljer,IP-adress,Enhet\n'
                const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' })
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = `samtycke-historik-${new Date().toISOString().split('T')[0]}.csv`
                link.click()
              }}
              className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-100 rounded hover:bg-primary-200 transition-colors"
            >
              📄 Ladda ner som CSV
            </button>
            
            <button 
              onClick={() => {
                // In real implementation, trigger JSON export
                const jsonContent = JSON.stringify(sortedAuditLog, null, 2)
                const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = `samtycke-historik-${new Date().toISOString().split('T')[0]}.json`
                link.click()
              }}
              className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-100 rounded hover:bg-primary-200 transition-colors"
            >
              📋 Ladda ner som JSON
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}