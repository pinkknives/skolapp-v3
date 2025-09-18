'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { RubricEditor } from './RubricEditor'
import { Question, Rubric } from '@/types/quiz'

interface EditRubricModalProps {
  question: Question
  onSave: (questionId: string, rubric: Rubric | undefined) => void
  onClose: () => void
}

export function EditRubricModal({ question, onSave, onClose }: EditRubricModalProps) {
  const [rubric, setRubric] = useState<Rubric | undefined>(question.rubric)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real app, this would make an API call to update the question
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      onSave(question.id, rubric)
      onClose()
    } catch {
      // Error saving rubric - handle gracefully
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Redigera bedömningskriterier</CardTitle>
                <Typography variant="body2" className="text-neutral-600 mt-1">
                  {question.title}
                </Typography>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="mb-4">
              <Typography variant="body2" className="text-neutral-600">
                Ändringar av bedömningskriterier påverkar framtida AI-rättningar. 
                Du kan också köra AI-rättning igen med de nya kriterierna.
              </Typography>
            </div>

            <RubricEditor
              rubric={rubric}
              questionId={question.id}
              onChange={setRubric}
            />
          </CardContent>

          <div className="border-t p-6 flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSaving}
            >
              Avbryt
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sparar...
                </>
              ) : (
                'Spara ändringar'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}