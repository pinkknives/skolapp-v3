'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Quiz, ExecutionMode } from '@/types/quiz'
import { getUserCreatableOrganizations, Organization } from '@/lib/orgs'

interface QuizBasicInfoStepProps {
  quiz: Partial<Quiz>
  onChange: (updates: Partial<Quiz>) => void
  onValidationChange: (isValid: boolean) => void
}

export function QuizBasicInfoStep({ quiz, onChange, onValidationChange }: QuizBasicInfoStepProps) {
  const [tagInput, setTagInput] = useState('')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  // Load user's organizations
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoadingOrgs(true)
        const { data, error } = await getUserCreatableOrganizations()
        if (error) {
          console.error('Error loading organizations:', error)
          return
        }
        
        setOrganizations(data || [])
        
        // Auto-select if only one organization
        if (data && data.length === 1) {
          setSelectedOrgId(data[0].id)
          onChange({ orgId: data[0].id })
        } else if (data && data.length > 1) {
          // Set to current selected org if available
          const currentOrgId = quiz.orgId || ''
          setSelectedOrgId(currentOrgId)
        }
      } catch (error) {
        console.error('Error loading organizations:', error)
      } finally {
        setLoadingOrgs(false)
      }
    }

    loadOrganizations()
  }, [])

  // Validate on changes
  useEffect(() => {
    const hasTitle = !!(quiz.title && quiz.title.trim().length > 0)
    const hasOrg = organizations.length === 0 || selectedOrgId !== ''
    const isValid = hasTitle && hasOrg
    onValidationChange(isValid)
  }, [quiz.title, selectedOrgId, organizations.length, onValidationChange])

  const handleAddTag = () => {
    if (tagInput.trim() && !quiz.tags?.includes(tagInput.trim())) {
      onChange({
        tags: [...(quiz.tags || []), tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      tags: quiz.tags?.filter(tag => tag !== tagToRemove) || []
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId)
    onChange({ orgId })
  }

  const executionModes: { value: ExecutionMode; label: string; description: string }[] = [
    {
      value: 'self-paced',
      label: 'Självtempo',
      description: 'Eleven styr tempot själv och kan ta quizet när det passar'
    },
    {
      value: 'teacher-controlled',
      label: 'Lärarstyrt tempo',
      description: 'Du styr när nästa fråga visas för alla elever samtidigt'
    },
    {
      value: 'teacher-review',
      label: 'Lärargranskningsläge',
      description: 'Projicera och gå igenom frågorna tillsammans med klassen'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-primary-50 border-primary-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <Typography variant="h5" className="text-primary-900 font-semibold mb-2">
                Berätta om ditt quiz
              </Typography>
              <Typography variant="body2" className="text-primary-700">
                Börja med de grundläggande detaljerna. Du kan ändra dessa när som helst senare.
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main form */}
      <Card>
        <CardHeader>
          <CardTitle>Grundläggande information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization selection - only show if user has multiple organizations */}
          {!loadingOrgs && organizations.length > 1 && (
            <div>
              <Typography variant="body2" className="font-medium text-neutral-700 mb-2">
                Organisation <span className="text-red-500">*</span>
              </Typography>
              <select
                value={selectedOrgId}
                onChange={(e) => handleOrgChange(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Välj organisation</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <Typography variant="caption" className="text-neutral-500 mt-1">
                Välj vilken organisation detta quiz ska tillhöra
              </Typography>
            </div>
          )}

          {/* Show selected org for single org users */}
          {!loadingOrgs && organizations.length === 1 && (
            <div>
              <Typography variant="body2" className="font-medium text-neutral-700 mb-2">
                Organisation
              </Typography>
              <div className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md">
                <Typography variant="body2" className="text-neutral-700">
                  {organizations[0].name}
                </Typography>
              </div>
              <Typography variant="caption" className="text-neutral-500 mt-1">
                Detta quiz kommer att tillhöra din organisation
              </Typography>
            </div>
          )}

          {/* Title - Required */}
          <div>
            <Input
              label="Titel"
              placeholder="Ge ditt quiz en tydlig och engagerande titel"
              value={quiz.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
              required
              className="text-lg"
            />
            <Typography variant="caption" className="text-neutral-500 mt-1">
              En bra titel hjälper eleverna förstå vad quizet handlar om
            </Typography>
          </div>

          {/* Description */}
          <div>
            <Textarea
              label="Beskrivning"
              placeholder="Beskriv vad eleverna kommer att lära sig eller öva på"
              value={quiz.description || ''}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div>
            <Typography variant="body2" className="font-medium text-neutral-700 mb-2">
              Taggar (hjälper dig hitta quizet senare)
            </Typography>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="t.ex. matematik, multiplikation, åk3"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                variant="outline"
              >
                Lägg till
              </Button>
            </div>
            {quiz.tags && quiz.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quiz.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-primary-600 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
                      aria-label={`Ta bort taggen ${tag}`}
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Time limit */}
          <div>
            <Input
              label="Tidsgräns (minuter)"
              type="number"
              placeholder="Lämna tomt för obegränsad tid"
              value={quiz.settings?.timeLimit || ''}
              onChange={(e) => {
                const timeLimit = e.target.value ? parseInt(e.target.value) : undefined
                onChange({ 
                  settings: { 
                    allowRetakes: true,
                    shuffleQuestions: false,
                    shuffleAnswers: false,
                    showCorrectAnswers: false,
                    executionMode: 'self-paced',
                    ...quiz.settings,
                    timeLimit 
                  } 
                })
              }}
              min="1"
              max="180"
            />
            <Typography variant="caption" className="text-neutral-500 mt-1">
              Rekommenderat: 1-2 minuter per fråga
            </Typography>
          </div>

          {/* Execution mode */}
          <div>
            <Typography variant="body2" className="font-medium text-neutral-700 mb-3">
              Hur ska quizet genomföras?
            </Typography>
            <div className="space-y-3">
              {executionModes.map((mode) => (
                <label
                  key={mode.value}
                  className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="executionMode"
                    value={mode.value}
                    checked={quiz.settings?.executionMode === mode.value}
                    onChange={() => onChange({ 
                      settings: { 
                        allowRetakes: true,
                        shuffleQuestions: false,
                        shuffleAnswers: false,
                        showCorrectAnswers: false,
                        ...quiz.settings,
                        executionMode: mode.value 
                      } 
                    })}
                    className="mt-1"
                  />
                  <div>
                    <Typography variant="body2" className="font-medium">
                      {mode.label}
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      {mode.description}
                    </Typography>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick tips */}
      <Card className="bg-neutral-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <Typography variant="body2" className="font-medium text-neutral-700 mb-1">
                Tips för en bra start
              </Typography>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Välj en titel som tydligt beskriver ämnet</li>
                <li>• Lägg till taggar för att enkelt hitta quizet senare</li>
                <li>• Självtempo är vanligast för hemuppgifter</li>
                <li>• Lärarstyrt tempo fungerar bra för klassaktiviteter</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}