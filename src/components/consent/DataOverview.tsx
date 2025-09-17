'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { type ConsentStatus } from '@/types/auth'

interface DataOverviewProps {
  studentId: string
  consentStatus: ConsentStatus
}

interface StoredData {
  category: string
  items: {
    name: string
    count: number
    size: string
    lastUpdated: Date
  }[]
}

export function DataOverview({ studentId, consentStatus }: DataOverviewProps) {
  const [storedData, setStoredData] = useState<StoredData[]>([])
  const [loading, setLoading] = useState(true)
  const [showExportDialog, setShowExportDialog] = useState(false)

  useEffect(() => {
    const loadStoredData = async () => {
      setLoading(true)
      
      // Simulate loading stored data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - in real implementation, fetch from backend
      const mockData: StoredData[] = [
        {
          category: 'Quiz-resultat',
          items: [
            {
              name: 'Matematik - Grundläggande algebra',
              count: 15,
              size: '2.3 KB',
              lastUpdated: new Date('2024-01-20')
            },
            {
              name: 'Svenska - Läsförståelse',
              count: 8,
              size: '1.8 KB',
              lastUpdated: new Date('2024-01-18')
            },
            {
              name: 'Naturkunskap - Kemi',
              count: 12,
              size: '3.1 KB',
              lastUpdated: new Date('2024-01-15')
            }
          ]
        },
        {
          category: 'Framstegsdata',
          items: [
            {
              name: 'Inlärningsprofil',
              count: 1,
              size: '0.8 KB',
              lastUpdated: new Date('2024-01-20')
            },
            {
              name: 'Styrkeområden',
              count: 5,
              size: '0.5 KB',
              lastUpdated: new Date('2024-01-19')
            },
            {
              name: 'Utvecklingsområden',
              count: 3,
              size: '0.4 KB',
              lastUpdated: new Date('2024-01-17')
            }
          ]
        },
        {
          category: 'Användardata',
          items: [
            {
              name: 'Profilinställningar',
              count: 1,
              size: '0.2 KB',
              lastUpdated: new Date('2024-01-10')
            },
            {
              name: 'Aktivitetslogg',
              count: 45,
              size: '5.2 KB',
              lastUpdated: new Date('2024-01-20')
            }
          ]
        }
      ]
      
      setStoredData(mockData)
      setLoading(false)
    }

    loadStoredData()
  }, [studentId])

  const totalItems = storedData.reduce((sum, category) => 
    sum + category.items.reduce((catSum, item) => catSum + item.count, 0), 0
  )

  const handleExportData = async () => {
    setLoading(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In real implementation, trigger backend export
    const exportData = {
      studentId,
      exportDate: new Date().toISOString(),
      consentStatus,
      data: storedData
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `skolapp-data-export-${studentId}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    setLoading(false)
    setShowExportDialog(false)
  }

  const handleDeleteData = async () => {
    if (!confirm('Är du säker på att du vill radera all data? Detta kan inte ångras.')) {
      return
    }
    
    setLoading(true)
    
    // Simulate deletion process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // In real implementation, trigger backend deletion
    setStoredData([])
    setLoading(false)
    
    alert('All data har raderats framgångsrikt.')
  }

  if (loading && storedData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <Typography variant="body1" className="text-neutral-600">
          Laddar dataöversikt...
        </Typography>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Dataöversikt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary-50 p-4 rounded-lg text-center">
              <Typography variant="h3" className="text-primary-700">
                {totalItems}
              </Typography>
              <Typography variant="body2" className="text-primary-600">
                Totalt antal poster
              </Typography>
            </div>
            
            <div className="bg-info-50 p-4 rounded-lg text-center">
              <Typography variant="h3" className="text-info-700">
                {storedData.length}
              </Typography>
              <Typography variant="body2" className="text-info-600">
                Datakategorier
              </Typography>
            </div>
            
            <div className="bg-success-50 p-4 rounded-lg text-center">
              <Typography variant="h3" className="text-success-700">
                {consentStatus === 'approved' ? 'Aktiv' : 'Inaktiv'}
              </Typography>
              <Typography variant="body2" className="text-success-600">
                Datalagringssstatus
              </Typography>
            </div>
          </div>

          {consentStatus !== 'approved' && (
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
              <Typography variant="subtitle2" className="text-warning-800 mb-2">
                ⚠️ Datalagring inaktiv
              </Typography>
              <Typography variant="body2" className="text-warning-700">
                Eftersom samtycke inte är godkänt används endast korttidslagring. 
                Data raderas automatiskt efter varje session.
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Data Categories */}
      {storedData.map((category, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <div className="flex-1">
                    <Typography variant="subtitle2" className="text-neutral-800 mb-1">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" className="text-neutral-600 text-sm">
                      {item.count} poster • {item.size} • 
                      Uppdaterad {item.lastUpdated.toLocaleDateString('sv-SE')}
                    </Typography>
                  </div>
                  
                  <div className="text-right">
                    <Typography variant="body2" className="text-neutral-500 text-sm">
                      {item.lastUpdated.toLocaleDateString('sv-SE')}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* GDPR Actions */}
      <Card>
        <CardHeader>
          <CardTitle>GDPR-rättigheter</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body2" className="text-neutral-600 mb-6">
            Enligt GDPR har du rätt att få tillgång till, korrigera eller radera ditt barns data.
          </Typography>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Typography variant="subtitle2" className="text-neutral-800">
                📄 Dataportabilitet (Art. 20)
              </Typography>
              <Typography variant="body2" className="text-neutral-600 text-sm mb-3">
                Exportera all data i ett maskinläsbart format.
              </Typography>
              <Button 
                onClick={() => setShowExportDialog(true)}
                variant="outline"
                disabled={loading}
                fullWidth
              >
                Exportera data
              </Button>
            </div>

            <div className="space-y-3">
              <Typography variant="subtitle2" className="text-neutral-800">
                🗑️ Rätt till radering (Art. 17)
              </Typography>
              <Typography variant="body2" className="text-neutral-600 text-sm mb-3">
                Radera all sparad data permanent.
              </Typography>
              <Button 
                onClick={handleDeleteData}
                variant="outline"
                disabled={loading || storedData.length === 0}
                fullWidth
                className="text-error-600 border-error-200 hover:bg-error-50"
              >
                Radera all data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Exportera data</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="body1" className="mb-6">
                All data kommer att exporteras som en JSON-fil som du kan ladda ner. 
                Filen innehåller all lagrad information för ditt barn.
              </Typography>
              
              <div className="bg-info-50 border border-info-200 rounded-lg p-3 mb-6">
                <Typography variant="body2" className="text-info-700 text-sm">
                  <strong>Vad inkluderas:</strong><br />
                  • Quiz-resultat och poäng<br />
                  • Framstegsdata och analys<br />
                  • Användarinställningar<br />
                  • Aktivitetslogg
                </Typography>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Avbryt
                </Button>
                
                <Button
                  onClick={handleExportData}
                  disabled={loading}
                  loading={loading}
                  className="flex-1"
                >
                  Exportera
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}