'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'

interface Subject { code: string; name: string }

interface Props {
  value?: string
  onChange: (code: string) => void
  className?: string
}

export function SyllabusPicker({ value, onChange, className }: Props) {
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [loading, setLoading] = React.useState(true)
  const [fallback, setFallback] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/health/skolverket', { cache: 'no-store' })
        const json = await res.json()
        if (!mounted) return
        if (res.ok && Array.isArray(json?.subjects)) {
          setSubjects(json.subjects as Subject[])
          setFallback(Boolean(json.fallback))
        } else {
          setFallback(true)
          setSubjects([])
        }
      } catch {
        if (mounted) {
          setFallback(true)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <Typography variant="body2">Laddar ämnen...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-3">
        {fallback && (
          <div className="p-3 rounded-md border border-warning-200 bg-warning-50">
            <Typography variant="caption" className="text-warning-800">Uppdatering pågår – visar senast kända lista om tillgänglig.</Typography>
          </div>
        )}
        {subjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {subjects.slice(0, 12).map((s) => (
              <Button
                key={s.code}
                variant={value === s.code ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onChange(s.code)}
              >
                {s.name}
              </Button>
            ))}
          </div>
        ) : (
          <Typography variant="body2" className="text-neutral-600">Inga ämnen tillgängliga.</Typography>
        )}
      </CardContent>
    </Card>
  )
}
