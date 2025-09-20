'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { Shield, Save, AlertTriangle } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'

interface ConsentSettingsProps {
  orgId: string
  canManage: boolean
  className?: string
}

interface ConsentSettings {
  require_guardian_consent: boolean
  consent_valid_months: number
  retention_korttid_days: number
}

export function ConsentSettings({ orgId, canManage, className = '' }: ConsentSettingsProps) {
  const [settings, setSettings] = useState<ConsentSettings>({
    require_guardian_consent: false,
    consent_valid_months: 12,
    retention_korttid_days: 30
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = supabaseBrowser()
      const { data, error } = await supabase
        .from('org_settings')
        .select('require_guardian_consent, consent_valid_months, retention_korttid_days')
        .eq('org_id', orgId)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('Error loading consent settings:', error)
        setError('Kunde inte ladda samtyckeinställningar')
        return
      }

      if (data) {
        setSettings({
          require_guardian_consent: data.require_guardian_consent || false,
          consent_valid_months: data.consent_valid_months || 12,
          retention_korttid_days: data.retention_korttid_days || 30
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = async () => {
    if (!canManage) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      const supabase = supabaseBrowser()
      
      // Upsert settings
      const { error } = await supabase
        .from('org_settings')
        .upsert({
          org_id: orgId,
          ...settings
        })

      if (error) {
        console.error('Error saving consent settings:', error)
        setError('Kunde inte spara inställningar: ' + error.message)
        return
      }

      setSuccessMessage('Inställningar sparade')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: keyof ConsentSettings, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <Typography variant="muted">Laddar samtyckeinställningar...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-x-3">
          <Shield className="w-5 h-5 text-primary-600" />
          <div>
            <CardTitle>Dataskydd & Samtycke</CardTitle>
            <CardDescription>
              Konfigurera hur vårdnadshavaresamtycke hanteras för elevdata
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex gap-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <Typography variant="small" className="text-red-800 dark:text-red-200">
                {error}
              </Typography>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <Typography variant="small" className="text-green-800 dark:text-green-200">
              {successMessage}
            </Typography>
          </div>
        )}

        <div className="space-y-6">
          {/* Require consent toggle */}
          <div className="space-y-3">
            <div className="flex items-center gap-x-3">
              <input
                type="checkbox"
                id="require_consent"
                checked={settings.require_guardian_consent}
                onChange={(e) => updateSetting('require_guardian_consent', e.target.checked)}
                disabled={!canManage}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              />
              <label htmlFor="require_consent" className="flex-1">
                <Typography variant="small" className="font-medium">
                  Kräv vårdnadshavaresamtycke för Långtidsläge
                </Typography>
                <Typography variant="caption" className="text-gray-600 dark:text-gray-400 mt-1">
                  När aktiverat måste vårdnadshavare ge samtycke innan elevdata kan lagras långsiktigt
                </Typography>
              </label>
            </div>
          </div>

          {/* Consent validity period */}
          <div className="space-y-2">
            <label htmlFor="consent_validity" className="block">
              <Typography variant="small" className="font-medium">
                Samtyckesgiltighetstid (månader)
              </Typography>
            </label>
            <Input
              id="consent_validity"
              type="number"
              min="1"
              max="24"
              value={settings.consent_valid_months}
              onChange={(e) => updateSetting('consent_valid_months', parseInt(e.target.value) || 12)}
              disabled={!canManage}
              className="w-32"
            />
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Hur länge ett samtycke är giltigt innan det behöver förnyas
            </Typography>
          </div>

          {/* Short-term retention period */}
          <div className="space-y-2">
            <label htmlFor="korttid_retention" className="block">
              <Typography variant="small" className="font-medium">
                Korttidsläge - Datalagring (dagar)
              </Typography>
            </label>
            <Input
              id="korttid_retention"
              type="number"
              min="1"
              max="90"
              value={settings.retention_korttid_days}
              onChange={(e) => updateSetting('retention_korttid_days', parseInt(e.target.value) || 30)}
              disabled={!canManage}
              className="w-32"
            />
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Hur länge data sparas i Korttidsläge innan automatisk rensning
            </Typography>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <Typography variant="caption" className="text-blue-900 dark:text-blue-200">
            <strong>Viktigt:</strong> Ändringar i dessa inställningar påverkar endast nya quiz och aktiviteter. 
            Befintlig data följer de regler som gällde när den skapades.
          </Typography>
        </div>

        {/* Save button */}
        {canManage && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="primary"
              onClick={saveSettings}
              disabled={isSaving}
              className="flex items-center gap-x-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Sparar...' : 'Spara inställningar'}
            </Button>
          </div>
        )}

        {!canManage && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Du behöver administratörsbehörighet för att ändra dessa inställningar.
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  )
}