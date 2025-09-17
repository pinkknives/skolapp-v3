'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { useAuth } from '@/contexts/AuthContext'
import { longTermDataService } from '@/lib/long-term-data'
import { 
  getDataRetentionDisplayName, 
  getDataRetentionDescription,
  getAvailableDataRetentionModes,
  validateUserDataSettings
} from '@/lib/auth-utils'
import { type DataRetentionMode } from '@/types/auth'

interface DataManagementSettingsProps {
  className?: string
}

export function DataManagementSettings({ className }: DataManagementSettingsProps) {
  const { user, updateUser } = useAuth()
  const [selectedMode, setSelectedMode] = useState<DataRetentionMode>(
    user?.dataRetentionMode || 'korttid'
  )
  const [isChanging, setIsChanging] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [longTermStats, setLongTermStats] = useState({
    quizResults: 0,
    analyticsData: 0,
    hasValidConsent: false
  })

  useEffect(() => {
    if (user && user.dataRetentionMode === 'långtid') {
      const quizResults = longTermDataService.getLongTermQuizResults(user.id)
      const analyticsData = longTermDataService.getAnalyticsData(user.id)
      const hasValidConsent = longTermDataService.hasValidConsent(user.id)
      
      setLongTermStats({
        quizResults: quizResults.length,
        analyticsData: analyticsData.length,
        hasValidConsent
      })
    }
  }, [user])

  if (!user) {
    return null
  }

  const availableModes = getAvailableDataRetentionModes(user.subscriptionPlan)
  const currentMode = user.dataRetentionMode
  const validation = validateUserDataSettings(
    user.subscriptionPlan,
    selectedMode,
    user.hasParentalConsent,
    user.isMinor
  )

  const handleModeChange = async () => {
    if (!validation.isValid) return
    
    setIsChanging(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user data retention mode
      updateUser({ dataRetentionMode: selectedMode })
      
      // If switching to long-term mode and user is minor, trigger consent flow
      if (selectedMode === 'långtid' && user.isMinor && !user.hasParentalConsent) {
        // In a real app, this would trigger the consent request flow
        console.log('Triggering parental consent request...')
      }
      
      // If switching from long-term to short-term, show data migration options
      if (currentMode === 'långtid' && selectedMode === 'korttid') {
        setShowExportDialog(true)
      }
      
    } catch (error) {
      console.error('Error changing data retention mode:', error)
    } finally {
      setIsChanging(false)
    }
  }

  const handleExportData = () => {
    if (!user) return
    
    const exportedData = longTermDataService.exportUserData(user.id)
    
    // Create downloadable JSON file
    const dataStr = JSON.stringify(exportedData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `skolapp-data-export-${user.id}-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleDeleteAllData = async () => {
    if (!user) return
    
    const confirmed = window.confirm(
      'Är du säker på att du vill radera all sparad data? Detta kan inte ångras.'
    )
    
    if (confirmed) {
      // In a real app, this would call an API to delete user data
      console.log('Deleting all user data...')
      
      // Simulate the deletion locally
      if (typeof window !== 'undefined') {
        const keysToRemove = Object.keys(localStorage).filter(key =>
          key.includes(user.id)
        )
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
      
      // Reset stats
      setLongTermStats({
        quizResults: 0,
        analyticsData: 0,
        hasValidConsent: false
      })
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>
            <Typography variant="h6">Datahantering & GDPR</Typography>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current mode status */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <Typography variant="subtitle2" className="mb-2">
                Nuvarande dataläge
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
                  Aktivt
                </div>
              </div>
            </div>

            {/* Long-term data statistics */}
            {currentMode === 'långtid' && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <Typography variant="subtitle2" className="text-primary-800 mb-3">
                  Sparad långtidsdata
                </Typography>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <Typography variant="h5" className="text-primary-600">
                      {longTermStats.quizResults}
                    </Typography>
                    <Typography variant="caption" className="text-primary-700">
                      Quiz-resultat
                    </Typography>
                  </div>
                  <div className="text-center">
                    <Typography variant="h5" className="text-primary-600">
                      {longTermStats.analyticsData}
                    </Typography>
                    <Typography variant="caption" className="text-primary-700">
                      Analysdata
                    </Typography>
                  </div>
                </div>
                <div className={`px-3 py-2 rounded-md text-sm ${
                  longTermStats.hasValidConsent 
                    ? 'bg-success-100 text-success-800' 
                    : 'bg-warning-100 text-warning-800'
                }`}>
                  {longTermStats.hasValidConsent 
                    ? '✓ Giltigt föräldrasamtycke' 
                    : '⚠️ Väntande föräldrasamtycke'
                  }
                </div>
              </div>
            )}

            {/* Data retention mode selector */}
            <div>
              <Typography variant="subtitle2" className="mb-3">
                Ändra dataläge
              </Typography>
              <div className="space-y-3">
                {availableModes.map((mode) => {
                  const isSelected = selectedMode === mode
                  const isCurrent = currentMode === mode
                  
                  return (
                    <Card
                      key={mode}
                      variant={isSelected ? 'elevated' : 'outlined'}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-primary-500 border-primary-300' : ''
                      } ${isCurrent ? 'opacity-50' : ''}`}
                      onClick={() => !isCurrent && setSelectedMode(mode)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => !isCurrent && setSelectedMode(mode)}
                            disabled={isCurrent}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <Typography variant="subtitle2" className="font-medium">
                              {getDataRetentionDisplayName(mode)}
                              {isCurrent && (
                                <span className="ml-2 text-sm text-neutral-500">(Nuvarande)</span>
                              )}
                            </Typography>
                            <Typography variant="caption" className="text-neutral-600">
                              {getDataRetentionDescription(mode)}
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Validation messages */}
            {!validation.isValid && (
              <Card variant="outlined" className="border-warning-300 bg-warning-50">
                <CardContent className="p-4">
                  <Typography variant="subtitle2" className="text-warning-800 mb-2">
                    Observera följande:
                  </Typography>
                  <ul className="space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index} className="text-sm text-warning-700 flex items-start">
                        <span className="mr-2">⚠️</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {selectedMode !== currentMode && (
                <Button
                  onClick={handleModeChange}
                  disabled={!validation.isValid || isChanging}
                  size="md"
                >
                  {isChanging ? 'Ändrar...' : `Byt till ${getDataRetentionDisplayName(selectedMode)}`}
                </Button>
              )}
              
              {currentMode === 'långtid' && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    size="md"
                  >
                    Exportera data
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAllData}
                    size="md"
                  >
                    Radera all data
                  </Button>
                </>
              )}
            </div>

            {/* GDPR information */}
            <div className="bg-info-50 border border-info-200 rounded-lg p-4">
              <Typography variant="subtitle2" className="text-info-800 mb-2">
                GDPR-rättigheter
              </Typography>
              <Typography variant="caption" className="text-info-700">
                Du har rätt att få en kopia av all data vi lagrar om dig, rätt att korrigera 
                felaktig information, och rätt att begära radering av dina data. För långtidslagring 
                av minderårigas data krävs förälders samtycke som kan återkallas när som helst.
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>
                <Typography variant="h6">Exportera data innan ändring</Typography>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="body2" className="mb-4">
                Du byter från långtids- till korttidsläge. Vill du exportera din sparade data 
                innan den raderas?
              </Typography>
              <div className="flex gap-3">
                <Button onClick={handleExportData} size="md">
                  Exportera först
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowExportDialog(false)}
                  size="md"
                >
                  Hoppa över
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}