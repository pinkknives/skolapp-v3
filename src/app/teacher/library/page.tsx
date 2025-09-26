'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'

export default function TeacherLibraryPage() {
  const [items, setItems] = React.useState<Array<{ id: string; title: string; item_type: string; subject?: string; grade?: string; created_at: string }>>([])
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState('')
  const [tag, setTag] = React.useState('')

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (tag) params.set('tag', tag)
      const url = q || tag ? `/api/library/search?${params.toString()}` : '/api/library/items'
      const resp = await fetch(url)
      const json = await resp.json()
      setItems(json.items || [])
      setLoading(false)
    }
    load()
  }, [q, tag])

  return (
    <div className="container mx-auto p-4 pb-[env(safe-area-inset-bottom)] space-y-6">
      <Typography variant="h3">Bibliotek</Typography>
      <Card>
        <CardHeader>
          <CardTitle>Mallar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <input id="library-search" className="border rounded px-3 py-3 text-base w-full" placeholder="Sök titel/ämne/årskurs" value={q} onChange={(e) => setQ(e.target.value)} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Tagg" value={tag} onChange={(e) => setTag(e.target.value)} />
          </div>
          {loading ? (
            <Typography variant="body2">Laddar…</Typography>
          ) : items.length === 0 ? (
            <Typography variant="body2">Inga mallar ännu.</Typography>
          ) : (
            <ul className="space-y-2">
              {items.map(it => (
                <li key={it.id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <Typography variant="body2" className="font-medium">{it.title}</Typography>
                    <Typography variant="caption" className="text-neutral-500">{it.item_type} · {it.subject || '—'} · {it.grade || '—'}</Typography>
                  </div>
                  <Typography variant="caption" className="text-neutral-500">{new Date(it.created_at).toLocaleDateString()}</Typography>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Mobile FAB: Fokus på sök */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          aria-label="Fokusera sök"
          onClick={() => {
            const el = document.getElementById('library-search') as HTMLInputElement | null
            el?.focus()
            el?.scrollIntoView({ behavior: (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'auto' : 'smooth', block: 'center' })
          }}
          className="h-14 w-14 rounded-full bg-primary-600 text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 flex items-center justify-center"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-3.5-3.5"/></svg>
        </button>
      </div>
    </div>
  )
}


