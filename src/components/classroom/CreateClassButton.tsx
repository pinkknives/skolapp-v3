'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { createClassAction } from '@/app/actions/classes'
import { useAuth } from '@/contexts/AuthContext'
import { X } from 'lucide-react'

interface CreateClassButtonProps {
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CreateClassButton({ 
  children = 'Skapa klass', 
  variant = 'primary',
  size = 'md',
  className 
}: CreateClassButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user: _user } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await createClassAction(formData)
      
      if (result.success) {
        setIsOpen(false)
        // Reset form
        e.currentTarget.reset()
        try { localStorage.setItem('sk_last_class_created_at', String(Date.now())) } catch {}
        // Refresh the page to show new class
        window.location.reload()
      } else {
        setError(result.error || 'Det gick inte att skapa klassen')
      }
    } catch (_err) {
      setError('Ett oväntat fel inträffade')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Skapa ny klass</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Klassnamn"
                name="name"
                placeholder="t.ex. Klass 6A"
                required
                disabled={isSubmitting}
              />
              
              <Input
                label="Årskurs"
                name="grade"
                placeholder="t.ex. 6 eller Gymnasiet år 1"
                disabled={isSubmitting}
              />
              
              <Input
                label="Ämne"
                name="subject"
                placeholder="t.ex. Matematik eller Svenska"
                disabled={isSubmitting}
              />

              {/* Hidden org ID - for now we don't support org selection */}
              <input type="hidden" name="orgId" value="" />

              {error && (
                <div className="p-3 rounded-lg bg-error-50 border border-error-200">
                  <Typography variant="body2" className="text-error-700">
                    {error}
                  </Typography>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Avbryt
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Skapar...' : 'Skapa klass'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setIsOpen(true)}
      className={className}
    >
      {children}
    </Button>
  )
}