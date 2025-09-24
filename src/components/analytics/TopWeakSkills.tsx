"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'

interface SkillMeta { id: string; key?: string; name?: string; subject?: string }

interface WeakItem {
  skillId: string
  attempts: number
  rate: number
  meta?: SkillMeta
}

export function TopWeakSkills({ items }: { items: WeakItem[] }) {
  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Svagaste kompetenser</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body2">Inga kompetenser med tillräckligt underlag ännu.</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Svagaste kompetenser</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((it) => (
          <div key={it.skillId} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{it.meta?.name || it.meta?.key || it.skillId}</div>
              <div className="text-xs text-neutral-500">Försök: {it.attempts}</div>
            </div>
            <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">{it.rate}%</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
