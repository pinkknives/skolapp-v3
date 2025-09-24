"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function StatsDemoPage() {
  const [studentId, setStudentId] = React.useState('')
  const [classId, setClassId] = React.useState('')
  const [schoolId, setSchoolId] = React.useState('')
  const [range, setRange] = React.useState<'7d' | '30d' | 'term' | 'year'>('30d')

  const [output, setOutput] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)

  async function run() {
    setLoading(true)
    try {
      const res = await fetch('/api/demo/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, classId, schoolId, range })
      })
      const json = await res.json()
      setOutput(JSON.stringify(json, null, 2))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <Typography variant="h3" className="font-semibold">Stats Demo</Typography>
        <Typography variant="body2" className="text-neutral-600">Testa RPC-wrappers mot Supabase.</Typography>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parametrar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="studentId (uuid)" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
            <Input placeholder="classId (uuid)" value={classId} onChange={(e) => setClassId(e.target.value)} />
            <Input placeholder="schoolId (uuid)" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <select className="border rounded px-2 py-1" value={range} onChange={(e) => setRange(e.target.value as '7d' | '30d' | 'term' | 'year')}>
              <option value="7d">7d</option>
              <option value="30d">30d</option>
              <option value="term">term</option>
              <option value="year">year</option>
            </select>
            <Button onClick={run} disabled={loading}>{loading ? 'Kör…' : 'Kör'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultat</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs whitespace-pre-wrap break-words">{output || '—'}</pre>
        </CardContent>
      </Card>
    </div>
  )
}
