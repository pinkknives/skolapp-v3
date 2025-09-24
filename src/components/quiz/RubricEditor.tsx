'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Rubric, RubricCriterion } from '@/types/quiz'

interface RubricEditorProps {
  rubric: Rubric | undefined
  questionId: string
  onChange: (rubric: Rubric | undefined) => void
}

export function RubricEditor({ rubric, questionId, onChange }: RubricEditorProps) {
  const [isExpanded, setIsExpanded] = useState(!!rubric)

  const handleToggleRubric = () => {
    if (rubric) {
      // Remove rubric
      onChange(undefined)
      setIsExpanded(false)
    } else {
      // Create new rubric
      const newRubric: Rubric = {
        id: `rubric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        questionId,
        criteria: [
          {
            id: `criterion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: '',
            weight: 3,
            example: ''
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      onChange(newRubric)
      setIsExpanded(true)
    }
  }

  const addCriterion = () => {
    if (!rubric) return
    
    const newCriterion: RubricCriterion = {
      id: `criterion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      weight: 3,
      example: ''
    }
    
    const updatedRubric: Rubric = {
      ...rubric,
      criteria: [...rubric.criteria, newCriterion],
      updatedAt: new Date()
    }
    
    onChange(updatedRubric)
  }

  const removeCriterion = (criterionId: string) => {
    if (!rubric) return
    
    const updatedRubric: Rubric = {
      ...rubric,
      criteria: rubric.criteria.filter(c => c.id !== criterionId),
      updatedAt: new Date()
    }
    
    onChange(updatedRubric)
  }

  const updateCriterion = (criterionId: string, updates: Partial<RubricCriterion>) => {
    if (!rubric) return
    
    const updatedRubric: Rubric = {
      ...rubric,
      criteria: rubric.criteria.map(c => 
        c.id === criterionId ? { ...c, ...updates } : c
      ),
      updatedAt: new Date()
    }
    
    onChange(updatedRubric)
  }

  const weightLabels = {
    1: 'Mycket låg (1)',
    2: 'Låg (2)', 
    3: 'Medel (3)',
    4: 'Hög (4)',
    5: 'Mycket hög (5)'
  }

  return (
    <Card className="border-primary-200 bg-primary-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <CardTitle className="text-primary-800">
              Bedömningskriterier för AI-rättning
            </CardTitle>
          </div>
          <Button 
            variant={rubric ? "outline" : "primary"}
            size="sm" 
            onClick={handleToggleRubric}
          >
            {rubric ? (
              <>
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Ta bort kriterier
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Lägg till kriterier
              </>
            )}
          </Button>
        </div>
        {!rubric && (
          <Typography variant="body2" className="text-neutral-600 mt-2">
            Definiera kriterier som hjälper AI:n att bedöma svar mer träffsäkert och transparent.
          </Typography>
        )}
      </CardHeader>

      {isExpanded && rubric && (
        <CardContent className="space-y-4">
          <Typography variant="body2" className="text-neutral-600 mb-4">
            Kriterier hjälper AI:n att förstå vad som ska bedömas i svaret. Ju mer specifika kriterier, desto bättre rättning.
          </Typography>

          <div className="space-y-4">
            {rubric.criteria.map((criterion, index) => (
              <div key={criterion.id} className="p-4 border border-neutral-200 rounded-lg bg-white">
                <div className="flex items-center justify-between mb-3">
                  <Typography variant="body2" className="font-medium text-neutral-700">
                    Kriterium {index + 1}
                  </Typography>
                  {rubric.criteria.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCriterion(criterion.id)}
                      className="text-error-600 hover:text-error-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <Input
                    label="Beskrivning av kriterium"
                    placeholder="T.ex. 'Svaret innehåller korrekt definition av...'"
                    value={criterion.text}
                    onChange={(e) => updateCriterion(criterion.id, { text: e.target.value })}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Vikt
                    </label>
                    <select
                      value={criterion.weight}
                      onChange={(e) => updateCriterion(criterion.id, { weight: parseInt(e.target.value) })}
                      className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      {Object.entries(weightLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <Typography variant="caption" className="text-neutral-500 mt-1">
                      Hur viktigt är detta kriterium för bedömningen?
                    </Typography>
                  </div>

                  <Input
                    label="Exempel på korrekt svar (valfritt)"
                    placeholder="T.ex. 'Fotosyntesen omvandlar koldioxid och vatten till glukos'"
                    value={criterion.example || ''}
                    onChange={(e) => updateCriterion(criterion.id, { example: e.target.value })}
                    helperText="Hjälper AI:n att förstå vad som förväntas"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={addCriterion}
            className="mt-4"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Lägg till kriterium
          </Button>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <Typography variant="body2" className="text-blue-800">
              <strong>Tips:</strong> Bra kriterier är specifika och mätbara. 
              Undvik vaga begrepp som &quot;bra&quot; eller &quot;tillräckligt&quot;. 
              Fokusera på konkreta element som ska finnas i svaret.
            </Typography>
          </div>
        </CardContent>
      )}
    </Card>
  )
}