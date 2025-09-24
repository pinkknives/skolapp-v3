import { NextRequest, NextResponse } from 'next/server'
import { signShareToken, type SharePayload } from '@/lib/tokens'

export async function POST(req: NextRequest) {
  try {
    const { scope, id, ttl } = (await req.json().catch(() => ({}))) as { scope?: 'student' | 'class'; id?: string; ttl?: number }
    if ((scope !== 'student' && scope !== 'class') || !id) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const ttlSeconds = Math.min(Math.max(ttl ?? 3600, 300), 60 * 60 * 24 * 7) // 5 min to 7 days
    const payload: SharePayload = { scope, id, exp: Math.floor(Date.now() / 1000) + ttlSeconds }
    const token = signShareToken(payload)
    const base = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
    const url = `${base}/reports/${token}`
    return NextResponse.json({ url, expiresIn: ttlSeconds })
  } catch (_error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
