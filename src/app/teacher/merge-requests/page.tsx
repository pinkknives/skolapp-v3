'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'

interface MergeRequest {
  id: string
  source_student_id: string
  target_student_id: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function MergeRequestsPage() {
  const [items, setItems] = React.useState<MergeRequest[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let aborted = false
    async function run() {
      setLoading(true)
      try {
        const res = await fetch('/api/merge-requests', { cache: 'no-store' })
        const json = await res.json()
        if (!aborted) setItems(json?.items || [])
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    run()
    return () => { aborted = true }
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Typography variant="h3" className="font-semibold">Sammanslagningsbegäran</Typography>

      <Card>
        <CardHeader>
          <CardTitle>Mina begäran</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Typography variant="body2">Laddar…</Typography>
          ) : items.length === 0 ? (
            <Typography variant="body2">Inga begäran ännu.</Typography>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-neutral-600">
                  <tr>
                    <th className="py-2 pr-4">Skapad</th>
                    <th className="py-2 pr-4">Källa elev</th>
                    <th className="py-2 pr-4">Mål elev</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Orsak</th>
                    <th className="py-2">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-t border-neutral-200">
                      <td className="py-2 pr-4">{new Date(it.created_at).toLocaleString('sv-SE')}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{it.source_student_id.slice(0, 8)}…</td>
                      <td className="py-2 pr-4 font-mono text-xs">{it.target_student_id.slice(0, 8)}…</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          it.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          it.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>{it.status}</span>
                      </td>
                      <td className="py-2">{it.reason || '-'}</td>
                      <td className="py-2">
                        {it.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              className="px-2 py-1 border rounded text-xs"
                              onClick={async () => {
                                const key = prompt('ADMIN_API_KEY för att godkänna?')
                                if (!key) return
                                await fetch(`/api/admin/merge-requests/${it.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ action: 'approve' }) })
                                location.reload()
                              }}
                            >Godkänn</button>
                            <button
                              className="px-2 py-1 border rounded text-xs"
                              onClick={async () => {
                                const key = prompt('ADMIN_API_KEY för att avslå?')
                                if (!key) return
                                await fetch(`/api/admin/merge-requests/${it.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ action: 'reject' }) })
                                location.reload()
                              }}
                            >Avslå</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
