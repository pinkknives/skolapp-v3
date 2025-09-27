import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const base = new URL(request.url)
    const studentsRes = await fetch(`${base.origin}/api/sessions/${id}/results/students`, { headers: { cookie: request.headers.get('cookie') || '' } })
    if (!studentsRes.ok) return NextResponse.json({ error: 'Kunde inte hämta elevresultat' }, { status: 500 })
    const students = (await studentsRes.json()).data as Array<{ displayName: string; bestScore: number; questionsAttempted: number; avgTimePerQuestion?: number | null; status: string }>

    const header = ['Namn','Poäng','Antal frågor','Snitt tid/fråga (s)','Status']
    const rows = students.map(s => [s.displayName, s.bestScore, s.questionsAttempted, s.avgTimePerQuestion ?? '', s.status])
    const csv = [header, ...rows].map(r => r.map(x => String(x).replaceAll('"','""')).map(x => /[",\n]/.test(x) ? `"${x}"` : x).join(',')).join('\n')
    return new NextResponse(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="session-${id}-students.csv"` } })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
