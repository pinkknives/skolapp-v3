'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai, isOpenAIAvailable } from '@/lib/ai/openai'

interface InsightsRequestBody {
  weeks?: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Du måste vara inloggad' }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as InsightsRequestBody
    const weeks = Math.max(1, Math.min(26, Number(body.weeks || 10)))

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const headers = { cookie: request.headers.get('cookie') || '', 'x-correlation-id': request.headers.get('x-correlation-id') || '' }
    const [overviewRes, skillsRes] = await Promise.all([
      fetch(`${baseUrl}/api/analytics/teacher/overview?weeks=${weeks}`, { headers }),
      fetch(`${baseUrl}/api/analytics/teacher/skills?weeks=${weeks}`, { headers }),
    ])

    const overview = overviewRes.ok ? await overviewRes.json() : { points: [], avgCorrectRate: 0 }
    const skills = skillsRes.ok ? await skillsRes.json() : { heatmap: [], topWeak: [], skills: [] }

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [
      {
        role: 'system',
        content: 'Du är en lärares assistent. Analysera klassens utveckling och ge konkreta rekommendationer. Svara strikt i JSON enligt schema.'
      },
      {
        role: 'user',
        content: JSON.stringify({
          overview,
          skills,
          schema: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              classInsights: { type: 'array', items: { type: 'string' } },
              studentStrategies: { type: 'array', items: { type: 'string' } },
              focusSkills: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, reason: { type: 'string' } } } },
              suggestedExercises: { type: 'array', items: { type: 'string' } }
            },
            required: ['summary','classInsights','studentStrategies','focusSkills']
          }
        })
      }
    ]

    if (!isOpenAIAvailable) {
      return NextResponse.json({
        summary: 'Demo‑läge: Begränsad analys utan AI.',
        classInsights: ['Korrekt‑andelen är stabil, fokusera på de lägsta kompetenserna.'],
        studentStrategies: ['Planera repetition för elever med låg korrekt‑andel i flera veckor.'],
        focusSkills: (skills.topWeak || []).map((w: { meta?: { key?: string; name?: string }; skillId: string }) => ({ key: w.meta?.key || w.meta?.name || w.skillId, reason: 'Låg korrekt‑andel och tillräckligt underlag.' })),
        suggestedExercises: ['Skapa riktade övningar för de svagaste kompetenserna.']
      })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' }
    })

    const text = response.choices?.[0]?.message?.content || '{}'
    const json = JSON.parse(text) as unknown
    return NextResponse.json(json)
  } catch (error) {
    console.error('insights error', error)
    return NextResponse.json({ error: 'Ett fel uppstod' }, { status: 500 })
  }
}
