"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'

interface SkillMeta { id: string; key?: string; name?: string; subject?: string }
interface HeatmapPoint { skillId: string; rate: number }
interface HeatmapRow { week: string; values: HeatmapPoint[] }

interface SkillsHeatmapProps {
  weeks: string[]
  skills: SkillMeta[]
  heatmap: HeatmapRow[]
}

function rateColor(rate: number): string {
  if (rate >= 80) return 'bg-emerald-500'
  if (rate >= 60) return 'bg-lime-500'
  if (rate >= 40) return 'bg-amber-500'
  if (rate >= 20) return 'bg-orange-500'
  return 'bg-rose-500'
}

export function SkillsHeatmap({ weeks, skills, heatmap }: SkillsHeatmapProps) {
  // Map weeks length to a grid template utility subset
  const colClass = (() => {
    const w = weeks.length
    if (w <= 4) return 'grid-cols-[160px_repeat(4,1fr)]'
    if (w <= 6) return 'grid-cols-[160px_repeat(6,1fr)]'
    if (w <= 8) return 'grid-cols-[160px_repeat(8,1fr)]'
    if (w <= 10) return 'grid-cols-[160px_repeat(10,1fr)]'
    if (w <= 12) return 'grid-cols-[160px_repeat(12,1fr)]'
    return 'grid-cols-[160px_repeat(16,1fr)]'
  })()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kompetens × Vecka</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className={`grid ${colClass}`}>
            <div />
            {weeks.map(week => (
              <div key={week} className="px-2 py-1 text-xs text-neutral-500 text-center">{week}</div>
            ))}
            {skills.map((skill) => (
              <React.Fragment key={skill.id}>
                <div className="px-2 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 sticky left-0 bg-card z-10">
                  {skill.name || skill.key}
                </div>
                {weeks.map((week) => {
                  const row = heatmap.find(r => r.week === week)
                  const point = row?.values.find(v => v.skillId === skill.id)
                  const rate = point?.rate ?? 0
                  return (
                    <div key={week + skill.id} className="p-2">
                      <div className={`h-6 rounded ${rateColor(rate)} flex items-center justify-center text-[10px] text-white/95`}>
                        {rate}%
                      </div>
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        <Typography variant="caption" className="block mt-2 text-neutral-500">Färg = korrekt‑andel per kompetens/vecka.</Typography>
      </CardContent>
    </Card>
  )
}
