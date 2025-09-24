'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'

interface FocusItem { key: string; reason: string }
interface SourceItem { reason: string; subject?: string; weekStart?: string; correctRate?: number }

export interface InsightsData {
  summary: string
  classInsights?: string[]
  studentStrategies?: string[]
  focusSkills?: FocusItem[]
  strengths?: string[]
  sources?: SourceItem[]
}

export function AIInsightsPanel({ data, loading }: { data: InsightsData | null; loading?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI‑insikter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && !data ? (
          <Typography variant="body2">Analyserar…</Typography>
        ) : !data ? (
          <Typography variant="body2">Inga insikter tillgängliga.</Typography>
        ) : (
          <>
            <Typography variant="body1" className="font-medium">{data.summary}</Typography>

            {data.focusSkills && data.focusSkills.length > 0 && (
              <div>
                <Typography variant="body2" className="font-semibold mb-1">Fokusområden</Typography>
                <ul className="list-disc ml-5 text-sm">
                  {data.focusSkills.map((f, idx) => (
                    <li key={idx}><span className="font-medium">{f.key}:</span> {f.reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.studentStrategies && data.studentStrategies.length > 0 && (
              <div>
                <Typography variant="body2" className="font-semibold mb-1">Förslag</Typography>
                <ul className="list-disc ml-5 text-sm">
                  {data.studentStrategies.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.classInsights && data.classInsights.length > 0 && (
              <div>
                <Typography variant="body2" className="font-semibold mb-1">Klassinsikter</Typography>
                <ul className="list-disc ml-5 text-sm">
                  {data.classInsights.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.strengths && data.strengths.length > 0 && (
              <div>
                <Typography variant="body2" className="font-semibold mb-1">Styrkor</Typography>
                <div className="flex flex-wrap gap-2">
                  {data.strengths.map((k, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {data.sources && data.sources.length > 0 && (
              <div>
                <Typography variant="caption" className="font-semibold mb-1 block">Förklaringskällor</Typography>
                <ul className="list-disc ml-5 text-xs text-neutral-600">
                  {data.sources.map((src, idx) => (
                    <li key={idx}>{src.reason}{src.subject ? ` – ${src.subject}` : ''}{src.weekStart ? ` (${src.weekStart})` : ''}{typeof src.correctRate === 'number' ? ` • ${src.correctRate}%` : ''}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )}
