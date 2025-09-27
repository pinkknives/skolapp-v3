import { NextRequest, NextResponse } from 'next/server'

const MAX_BYTES = 2 * 1024 * 1024 // 2MB

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const url = form.get('url') as string | null
    const file = form.get('file') as File | null

    if (!url && !file) {
      return NextResponse.json({ error: 'Ange url eller fil' }, { status: 400 })
    }

    let text = ''

    if (url) {
      const resp = await fetch(url)
      if (!resp.ok) return NextResponse.json({ error: 'Kunde inte hämta URL' }, { status: 400 })
      const contentType = resp.headers.get('content-type') || ''
      if (contentType.includes('text/html')) {
        const html = await resp.text()
        text = html
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ') 
          .trim()
      } else if (contentType.includes('text/plain')) {
        text = await resp.text()
      } else {
        return NextResponse.json({ error: 'Endast HTML eller text stöds för URL' }, { status: 400 })
      }
    } else if (file) {
      if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Filen är för stor' }, { status: 413 })
      const buffer = Buffer.from(await file.arrayBuffer())
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        try {
          // Dynamic import to avoid adding to client bundle
          const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
          const data = await pdfParse(buffer)
          text = (data.text || '').trim()
        } catch {
          return NextResponse.json({ error: 'PDF-analys misslyckades' }, { status: 400 })
        }
      } else if (file.type.startsWith('text/')) {
        text = buffer.toString('utf8')
      } else {
        return NextResponse.json({ error: 'Endast PDF eller text stöds' }, { status: 400 })
      }
    }

    const preview = text.slice(0, 2000)
    const wordCount = text.split(/\s+/).filter(Boolean).length
    return NextResponse.json({ preview, wordCount })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
