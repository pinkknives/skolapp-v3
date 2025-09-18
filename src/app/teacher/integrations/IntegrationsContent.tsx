'use client'

import React, { useState, useEffect } from 'react'
import { Container, Section } from '@/components/layout/Layout'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { 
  getAvailableIntegrationTemplates,
  canPerformIntegrationAction,
  getIntegrationStatusText,
  getIntegrationTypeText,
  IntegrationService
} from '@/lib/integrations'
import { type Integration, type IntegrationTemplate } from '@/types/integrations'
import { IntegrationCard } from '@/components/integrations/IntegrationCard'
import { IntegrationSetupModal } from '@/components/integrations/IntegrationSetupModal'

export function IntegrationsContent() {
  const { user } = useAuth()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [setupModalOpen, setSetupModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user?.schoolAccountId) {
      setIsLoading(false)
      return
    }

    try {
      const [userIntegrations, availableTemplates] = await Promise.all([
        IntegrationService.getIntegrations(user.schoolAccountId),
        Promise.resolve(getAvailableIntegrationTemplates(user))
      ])

      setIntegrations(userIntegrations)
      setTemplates(availableTemplates)
    } catch (error) {
      console.error('Failed to load integrations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupIntegration = (template: IntegrationTemplate) => {
    if (!canPerformIntegrationAction(user, template.type, 'configure')) {
      return
    }
    setSelectedTemplate(template)
    setSetupModalOpen(true)
  }

  const handleIntegrationCreated = (integration: Integration) => {
    setIntegrations(prev => [...prev, integration])
    setSetupModalOpen(false)
    setSelectedTemplate(null)
  }

  const handleDeleteIntegration = async (integration: Integration) => {
    if (!canPerformIntegrationAction(user, integration.type, 'delete')) {
      return
    }

    try {
      await IntegrationService.deleteIntegration(integration.id)
      setIntegrations(prev => prev.filter(i => i.id !== integration.id))
    } catch (error) {
      console.error('Failed to delete integration:', error)
    }
  }

  if (isLoading) {
    return (
      <Section spacing="xl">
        <Container>
          <div className="text-center">
            <Typography variant="body1">Laddar integrationer...</Typography>
          </div>
        </Container>
      </Section>
    )
  }

  if (!user || user.role !== 'lärare') {
    return (
      <Section spacing="xl">
        <Container>
          <div className="text-center">
            <Typography variant="h2" className="mb-4">
              Åtkomst nekad
            </Typography>
            <Typography variant="body1" className="text-neutral-600">
              Du behöver vara inloggad som lärare för att hantera integrationer.
            </Typography>
          </div>
        </Container>
      </Section>
    )
  }

  const canConfigureIntegrations = user.subscriptionPlan === 'premium' || user.subscriptionPlan === 'skolplan'

  return (
    <>
      <Section spacing="xl">
        <Container>
          <div className="mb-8">
            <Typography variant="h1" className="mb-4">
              Integrationer
            </Typography>
            <Typography variant="subtitle1" className="text-neutral-600">
              Anslut Skolapp till dina befintliga verktyg och system för smidigare arbetsflöden.
            </Typography>
          </div>

          {!canConfigureIntegrations && (
            <Card className="mb-8 bg-amber-50 border-amber-200">
              <CardContent className="text-center py-8">
                <Typography variant="h6" className="mb-2 text-amber-800">
                  Uppgradera för integrationer
                </Typography>
                <Typography variant="body2" className="mb-4 text-amber-700">
                  Integrationer kräver Premium eller Skolplan för att säkerställa 
                  säker datahantering enligt GDPR.
                </Typography>
                <Button variant="outline" size="sm">
                  Se prisplaner
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Active Integrations */}
          {integrations.length > 0 && (
            <div className="mb-12">
              <Typography variant="h5" className="mb-6">
                Aktiva integrationer
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map(integration => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onDelete={() => handleDeleteIntegration(integration)}
                    onEdit={() => {/* TODO: Edit integration */}}
                    onTest={() => {/* TODO: Test integration */}}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Available Integrations */}
          <div className="mb-12">
            <Typography variant="h5" className="mb-6">
              Tillgängliga integrationer
            </Typography>
            
            {templates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Typography variant="body1" className="text-neutral-600">
                    Inga integrationer är tillgängliga för din prenumeration.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => {
                  const isAlreadyConfigured = integrations.some(
                    i => i.type === template.type && 'provider' in i.settings && i.settings.provider === template.provider
                  )
                  
                  return (
                    <Card 
                      key={`${template.type}-${template.provider}`}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Typography variant="body2" className="text-neutral-600 mt-1">
                              {getIntegrationTypeText(template.type)}
                            </Typography>
                          </div>
                          {template.isPopular && (
                            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                              Populär
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Typography variant="body2" className="mb-4 text-neutral-700">
                          {template.description}
                        </Typography>
                        
                        <div className="mb-4">
                          <Typography variant="body2" className="font-medium mb-2">
                            Funktioner:
                          </Typography>
                          <ul className="list-disc list-inside space-y-1">
                            {template.supportedFeatures.slice(0, 3).map(feature => (
                              <li key={feature} className="text-sm text-neutral-600">
                                {getFeatureDisplayName(feature)}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          variant={isAlreadyConfigured ? 'outline' : 'primary'}
                          size="sm"
                          fullWidth
                          onClick={() => handleSetupIntegration(template)}
                          disabled={!canConfigureIntegrations || isAlreadyConfigured}
                        >
                          {isAlreadyConfigured ? 'Redan konfigurerad' : 'Konfigurera'}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Help Section */}
          <Card className="bg-neutral-50">
            <CardHeader>
              <CardTitle>Behöver du hjälp?</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="body2" className="mb-4">
                Integrationer kräver teknisk konfiguration från din skola. 
                Kontakta din IT-avdelning eller skoladministratör för hjälp.
              </Typography>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="sm">
                  Se dokumentation
                </Button>
                <Button variant="outline" size="sm">
                  Kontakta support
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>

      {/* Setup Modal */}
      {setupModalOpen && selectedTemplate && (
        <IntegrationSetupModal
          template={selectedTemplate}
          onClose={() => {
            setSetupModalOpen(false)
            setSelectedTemplate(null)
          }}
          onIntegrationCreated={handleIntegrationCreated}
        />
      )}
    </>
  )
}

function getFeatureDisplayName(feature: string): string {
  const featureNames: Record<string, string> = {
    single_sign_on: 'Enkel inloggning',
    auto_user_creation: 'Automatisk användarskapande',
    role_mapping: 'Rollmappning',
    export_results: 'Exportera resultat',
    create_assignments: 'Skapa uppgifter',
    sync_classes: 'Synkronisera klasser',
    import_schedule: 'Importera schema',
    create_events: 'Skapa händelser'
  }
  return featureNames[feature] || feature
}