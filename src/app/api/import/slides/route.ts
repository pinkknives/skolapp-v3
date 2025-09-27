import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
    const buf = Buffer.from(await file.arrayBuffer())
    const name = (file.name || '').toLowerCase()

    const questions: string[] = []

    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
      const data = await pdfParse(buf)
      const text = (data.text || '')
      const parts = text.split(/\n\s*\n+/)
      parts.forEach(p => {
        const line = p.split(/\n/)[0]?.trim()
        if (line && line.length > 8) questions.push(line.slice(0, 120))
      })
    } else if (name.endsWith('.pptx') || file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(buf)
      const slideFiles = Object.keys(zip.files).filter(k => k.startsWith('ppt/slides/slide') && k.endsWith('.xml')).sort()
      for (const sf of slideFiles) {
        const xml = await zip.file(sf)!.async('string')
        const texts = Array.from(xml.matchAll(/<a:t>([^<]+)<\/a:t>/g)).map(m => m[1])
        const title = texts.join(' ').replace(/\s+/g, ' ').trim()
        if (title && title.length > 8) questions.push(title.slice(0, 120))
      }
    } else {
      return NextResponse.json({ error: 'unsupported_type' }, { status: 415 })
    }

    const deduped = Array.from(new Set(questions)).slice(0, 15)
    return NextResponse.json({ suggestions: deduped })
  } catch (_e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
