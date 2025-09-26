'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Typography } from '@/components/ui/Typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function InviteJoinPage() {
  const router = useRouter()
  const params = useParams<{ token: string }>()
  const [loading, setLoading] = React.useState(true)
  const [valid, setValid] = React.useState(false)
  const [invite, setInvite] = React.useState<{ org_id: string; email: string; role: string } | null>(null)

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      const resp = await fetch(`/api/org/invites?token=${encodeURIComponent(params.token)}`)
      const json = await resp.json()
      setValid(Boolean(json.valid))
      setInvite(json.invite || null)
      setLoading(false)
    }
    load()
  }, [params.token])

  const accept = async () => {
    setLoading(true)
    const resp = await fetch(`/api/org/invites/accept`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: params.token })
    })
    setLoading(false)
    if (resp.ok) router.push('/teacher/org')
  }

  if (loading) return <Typography variant="body2">Laddar inbjudan…</Typography>

  if (!valid || !invite) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2">Ogiltig eller utgången inbjudan.</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inbjudan till organisation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Typography variant="body2">E‑post: {invite.email}</Typography>
        <Typography variant="body2">Roll: {invite.role}</Typography>
        <div className="flex gap-2">
          <Button onClick={accept}>Acceptera</Button>
          <Button variant="outline" onClick={() => router.push('/')}>Avböj</Button>
        </div>
      </CardContent>
    </Card>
  )
}
