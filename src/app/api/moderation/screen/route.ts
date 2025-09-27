import { NextRequest, NextResponse } from 'next/server'
import { screenText } from '@/lib/moderation/rules'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { items?: string[]; gradeLevel?: string }
    const items = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) return NextResponse.json({ results: [] })

    const results = items.map((t) => screenText(t, { gradeLevel: body.gradeLevel }))
    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
