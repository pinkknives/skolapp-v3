'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Typography } from '@/components/ui/Typography'
import { useAuth } from '@/contexts/AuthContext'
import { 
  type IntegrationTemplate, 
  type Integration,
  type SSOIntegration,
  type LMSIntegration,
  type CalendarIntegration
} from '@/types/integrations'
import { validateIntegrationConfig, IntegrationService } from '@/lib/integrations'

interface IntegrationSetupModalProps {
  template: IntegrationTemplate
  onClose: () => void
  onIntegrationCreated: (integration: Integration) => void
}

export function IntegrationSetupModal({ 
  template, 
  onClose, 
  onIntegrationCreated 
}: IntegrationSetupModalProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<string[]>([])

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    // Clear errors when user makes changes
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.schoolAccountId) {
      setErrors(['Inget skolkonto kopplat till användaren'])
      return
    }

    setIsLoading(true)
    setErrors([])

    try {
      // Validate configuration
      const validation = validateIntegrationConfig(template.type, template.provider, settings)
      if (!validation.isValid) {
        setErrors(validation.errors)
        return
      }

      // Create integration
      const integrationData = {
        type: template.type,
        name: template.name,
        description: template.description,
        isEnabled: true,
        schoolAccountId: user.schoolAccountId,
        configuredBy: user.id,
        settings: {
          ...settings
        }
      }

      const newIntegration = await IntegrationService.createIntegration(integrationData)
      onIntegrationCreated(newIntegration)
    } catch (error) {
      setErrors(['Ett fel uppstod vid skapande av integrationen'])
      console.error('Integration creation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Konfigurera {template.name}</CardTitle>
              <Typography variant="body2" className="text-neutral-600 mt-1">
                {template.description}
              </Typography>
            </div>
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

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error display */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <Typography variant="body2" className="text-red-800 font-medium mb-2">
                  Följande fel måste åtgärdas:
                </Typography>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Type-specific configuration forms */}
            {template.type === 'sso' && renderSSOConfig(template, settings, handleSettingChange)}
            {template.type === 'lms' && renderLMSConfig(template, settings, handleSettingChange)}
            {template.type === 'calendar' && renderCalendarConfig(template, settings, handleSettingChange)}

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Skapar...' : 'Skapa integration'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function renderSSOConfig(
  template: IntegrationTemplate, 
  settings: Record<string, any>, 
  onChange: (key: string, value: any) => void
) {
  return (
    <div className="space-y-4">
      <Typography variant="h6">SSO-konfiguration</Typography>
      
      <Input
        label="Entity ID"
        type="text"
        value={settings.entityId || ''}
        onChange={(e) => onChange('entityId', e.target.value)}
        placeholder="https://din-skola.se/saml"
        required
        helperText="Unik identifierare för din organisation"
      />

      <Input
        label="SSO URL"
        type="url"
        value={settings.ssoUrl || ''}
        onChange={(e) => onChange('ssoUrl', e.target.value)}
        placeholder="https://login.skolfederation.se/sso"
        required
        helperText="URL till inloggningsportalen"
      />

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          X.509 Certifikat
        </label>
        <textarea
          className="w-full min-h-32 p-3 border border-neutral-300 rounded-md text-sm font-mono"
          value={settings.x509Certificate || ''}
          onChange={(e) => onChange('x509Certificate', e.target.value)}
          placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
          required
        />
        <Typography variant="body2" className="text-neutral-600 mt-1">
          Klistra in det publika certifikatet från din identitetsleverantör
        </Typography>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Tillåtna domäner (en per rad)
        </label>
        <textarea
          className="w-full min-h-24 p-3 border border-neutral-300 rounded-md text-sm"
          value={settings.allowedDomains?.join('\n') || ''}
          onChange={(e) => onChange('allowedDomains', e.target.value.split('\n').filter(Boolean))}
          placeholder="skola.se&#10;elev.skola.se"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoCreateUsers"
          checked={settings.autoCreateUsers || false}
          onChange={(e) => onChange('autoCreateUsers', e.target.checked)}
          className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="autoCreateUsers" className="text-sm text-neutral-700">
          Skapa användare automatiskt vid första inloggning
        </label>
      </div>
    </div>
  )
}

function renderLMSConfig(
  template: IntegrationTemplate, 
  settings: Record<string, any>, 
  onChange: (key: string, value: any) => void
) {
  return (
    <div className="space-y-4">
      <Typography variant="h6">LMS-konfiguration</Typography>
      
      <Input
        label="Client ID"
        type="text"
        value={settings.clientId || ''}
        onChange={(e) => onChange('clientId', e.target.value)}
        placeholder="your-app-client-id"
        required
        helperText="Erhålls från din LMS-leverantör"
      />

      <Input
        label="Client Secret"
        type="password"
        value={settings.clientSecret || ''}
        onChange={(e) => onChange('clientSecret', e.target.value)}
        placeholder="your-app-client-secret"
        required
        helperText="Hemlig nyckel - håll denna säker"
      />

      {template.provider === 'microsoft_teams' && (
        <Input
          label="Tenant ID"
          type="text"
          value={settings.tenantId || ''}
          onChange={(e) => onChange('tenantId', e.target.value)}
          placeholder="your-microsoft-tenant-id"
          required
          helperText="Din organisations Microsoft Tenant ID"
        />
      )}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoSync"
          checked={settings.autoSync || false}
          onChange={(e) => onChange('autoSync', e.target.checked)}
          className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="autoSync" className="text-sm text-neutral-700">
          Synkronisera automatiskt vid nya quiz-resultat
        </label>
      </div>

      {settings.autoSync && (
        <Select
          label="Synkroniseringsfrekvens"
          value={settings.syncFrequency || 'hourly'}
          onChange={(e) => onChange('syncFrequency', e.target.value)}
          options={[
            { value: 'realtime', label: 'Realtid' },
            { value: 'hourly', label: 'Varje timme' },
            { value: 'daily', label: 'Dagligen' }
          ]}
        />
      )}
    </div>
  )
}

function renderCalendarConfig(
  template: IntegrationTemplate, 
  settings: Record<string, any>, 
  onChange: (key: string, value: any) => void
) {
  return (
    <div className="space-y-4">
      <Typography variant="h6">Schemakonfiguration</Typography>
      
      <Input
        label="Server URL"
        type="url"
        value={settings.serverUrl || ''}
        onChange={(e) => onChange('serverUrl', e.target.value)}
        placeholder="https://schema.skola24.se"
        required
        helperText="URL till schemasystemet"
      />

      <Input
        label="Skolkod"
        type="text"
        value={settings.schoolCode || ''}
        onChange={(e) => onChange('schoolCode', e.target.value)}
        placeholder="12345"
        helperText="Din skolas unika kod i schemasystemet"
      />

      <Input
        label="Användarnamn"
        type="text"
        value={settings.username || ''}
        onChange={(e) => onChange('username', e.target.value)}
        placeholder="api-anvandare"
        helperText="API-användarnamn för åtkomst"
      />

      <Input
        label="Lösenord"
        type="password"
        value={settings.password || ''}
        onChange={(e) => onChange('password', e.target.value)}
        placeholder="api-losenord"
        helperText="API-lösenord för åtkomst"
      />

      <Select
        label="Synkroniseringsriktning"
        value={settings.syncDirection || 'import'}
        onChange={(e) => onChange('syncDirection', e.target.value)}
        options={[
          { value: 'import', label: 'Importera endast (hämta schema)' },
          { value: 'export', label: 'Exportera endast (skicka händelser)' },
          { value: 'bidirectional', label: 'Bidirektionell (både importera och exportera)' }
        ]}
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoCreateEvents"
          checked={settings.autoCreateEvents || false}
          onChange={(e) => onChange('autoCreateEvents', e.target.checked)}
          className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="autoCreateEvents" className="text-sm text-neutral-700">
          Skapa schemahändelser automatiskt för nya quiz
        </label>
      </div>
    </div>
  )
}