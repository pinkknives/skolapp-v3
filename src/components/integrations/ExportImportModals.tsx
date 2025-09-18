'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Typography } from '@/components/ui/Typography'
import { type Integration, type ExportOperation } from '@/types/integrations'
import { type Quiz } from '@/types/quiz'
import { IntegrationService, LMSService } from '@/lib/integrations'

interface QuizExportModalProps {
  isOpen: boolean
  onClose: () => void
  quiz: Quiz
  availableIntegrations: Integration[]
}

export function QuizExportModal({ 
  isOpen, 
  onClose, 
  quiz, 
  availableIntegrations 
}: QuizExportModalProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('')
  const [exportFormat, setExportFormat] = useState<'native' | 'csv' | 'xlsx' | 'pdf'>('native')
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!isOpen) return null

  const lmsIntegrations = availableIntegrations.filter(
    integration => integration.type === 'lms' && integration.isEnabled
  )

  const handleExport = async () => {
    if (!selectedIntegration) return

    setIsExporting(true)
    setExportResult(null)

    try {
      const integration = lmsIntegrations.find(i => i.id === selectedIntegration)
      if (!integration) {
        throw new Error('Integration not found')
      }

      // Start export operation
      const exportOp = await IntegrationService.exportResults(
        integration.id,
        [quiz.id],
        exportFormat
      )

      // For demo, simulate the export based on provider
      let result
      const provider = 'provider' in integration.settings ? integration.settings.provider : null
      if (provider === 'google_classroom') {
        result = await LMSService.exportToGoogleClassroom(integration, {
          quiz,
          format: exportFormat
        })
      } else if (provider === 'microsoft_teams') {
        result = await LMSService.exportToMicrosoftTeams(integration, {
          quiz,
          format: exportFormat
        })
      } else {
        result = {
          success: true,
          message: `Quiz exporterat till ${integration.name}`
        }
      }

      setExportResult(result)
    } catch (error) {
      setExportResult({
        success: false,
        message: 'Export misslyckades. Försök igen senare.'
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Exportera Quiz</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="p-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Typography variant="body2" className="mb-3 text-neutral-700">
              Quiz: <strong>{quiz.title}</strong>
            </Typography>
            
            <Typography variant="body2" className="mb-4 text-neutral-600">
              Resultat från detta quiz kommer att exporteras till det valda systemet.
            </Typography>
          </div>

          {lmsIntegrations.length === 0 ? (
            <div className="text-center py-8">
              <svg className="h-12 w-12 mx-auto text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <Typography variant="h6" className="mb-2">
                Inga LMS-integrationer
              </Typography>
              <Typography variant="body2" className="text-neutral-600 mb-4">
                Du behöver konfigurera en integration för att kunna exportera quiz-resultat.
              </Typography>
              <Button variant="outline" size="sm" onClick={onClose}>
                Stäng
              </Button>
            </div>
          ) : (
            <>
              <Select
                label="Välj system att exportera till"
                value={selectedIntegration}
                onChange={(e) => setSelectedIntegration(e.target.value)}
                options={lmsIntegrations.map(integration => ({
                  value: integration.id,
                  label: integration.name
                }))}
                placeholder="Välj integration..."
              />

              <Select
                label="Exportformat"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                options={[
                  { value: 'native', label: 'Systemets eget format' },
                  { value: 'csv', label: 'CSV (kommaseparerad)' },
                  { value: 'xlsx', label: 'Excel (XLSX)' },
                  { value: 'pdf', label: 'PDF-rapport' }
                ]}
              />

              {exportResult && (
                <div className={`p-3 rounded-md ${
                  exportResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <Typography 
                    variant="body2" 
                    className={exportResult.success ? 'text-green-800' : 'text-red-800'}
                  >
                    {exportResult.message}
                  </Typography>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isExporting}
                >
                  Avbryt
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={!selectedIntegration || isExporting}
                >
                  {isExporting ? 'Exporterar...' : 'Exportera'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface ClassImportModalProps {
  isOpen: boolean
  onClose: () => void
  availableIntegrations: Integration[]
  onImportCompleted: (importResult: any) => void
}

export function ClassImportModal({ 
  isOpen, 
  onClose, 
  availableIntegrations,
  onImportCompleted 
}: ClassImportModalProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('')
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!isOpen) return null

  const sisIntegrations = availableIntegrations.filter(
    integration => integration.type === 'sis' && integration.isEnabled
  )

  const handleImport = async () => {
    if (!selectedIntegration) return

    setIsImporting(true)
    setImportResult(null)

    try {
      const integration = sisIntegrations.find(i => i.id === selectedIntegration)
      if (!integration) {
        throw new Error('Integration not found')
      }

      const importOp = await IntegrationService.syncClassLists(integration.id)
      
      // Simulate successful import
      setImportResult({
        success: true,
        message: `Klasslistor importerade från ${integration.name}`
      })

      onImportCompleted(importOp)
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Import misslyckades. Kontrollera integrationsinställningarna.'
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Importera Klasslistor</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="p-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Typography variant="body2" className="text-neutral-700">
            Importera elevlistor från din skolas elevregister för att snabbt 
            organisera klasser och hålla koll på elevers resultat.
          </Typography>

          {sisIntegrations.length === 0 ? (
            <div className="text-center py-8">
              <svg className="h-12 w-12 mx-auto text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <Typography variant="h6" className="mb-2">
                Inga elevregister-integrationer
              </Typography>
              <Typography variant="body2" className="text-neutral-600 mb-4">
                Du behöver konfigurera en integration till skolans elevregister 
                för att kunna importera klasslistor.
              </Typography>
              <Button variant="outline" size="sm" onClick={onClose}>
                Stäng
              </Button>
            </div>
          ) : (
            <>
              <Select
                label="Välj elevregister"
                value={selectedIntegration}
                onChange={(e) => setSelectedIntegration(e.target.value)}
                options={sisIntegrations.map(integration => ({
                  value: integration.id,
                  label: integration.name
                }))}
                placeholder="Välj integration..."
              />

              {importResult && (
                <div className={`p-3 rounded-md ${
                  importResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <Typography 
                    variant="body2" 
                    className={importResult.success ? 'text-green-800' : 'text-red-800'}
                  >
                    {importResult.message}
                  </Typography>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <Typography variant="body2" className="text-amber-800">
                  <strong>GDPR-säkert:</strong> Endast nödvändig elevdata importeras 
                  och hanteras enligt skolans dataskyddspolicy.
                </Typography>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isImporting}
                >
                  Avbryt
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!selectedIntegration || isImporting}
                >
                  {isImporting ? 'Importerar...' : 'Importera klasslistor'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}