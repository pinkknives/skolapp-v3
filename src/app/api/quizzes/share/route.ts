import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

/**
 * POST /api/quizzes/share
 * Body: { quizId: string, targetTeacherId?: string, targetClassId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { quizId, targetTeacherId, targetClassId } = (await req.json().catch(() => ({}))) as {
      quizId?: string
      targetTeacherId?: string
      targetClassId?: string
    }

    if (!quizId || (!targetTeacherId && !targetClassId)) {
      return NextResponse.json({ error: 'quizId och minst en av targetTeacherId/targetClassId krävs' }, { status: 400 })
    }

    const supabase = supabaseServer()

    // Load source quiz
    const { data: src, error: srcErr } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single()

    if (srcErr || !src) {
      return NextResponse.json({ error: 'Quiz hittades inte' }, { status: 404 })
    }

    // Determine created_by
    const createdBy = targetTeacherId || src.created_by

    // Duplicate quiz (basic fields; extend as needed)
    const copy = {
      title: `${src.title || 'Quiz'} (Kopia)`,
      subject: src.subject || null,
      created_by: createdBy,
    }

    const { data: newQuiz, error: insErr } = await supabase
      .from('quizzes')
      .insert(copy)
      .select()
      .single()

    if (insErr || !newQuiz) {
      return NextResponse.json({ error: 'Kunde inte skapa kopia' }, { status: 500 })
    }

    // Optionally relate to class if provided (requires associative table; if not present, skip)
    if (targetClassId) {
      // Best effort: attach via class_sessions if schema exists
      try {
        await supabase
          .from('class_sessions')
          .insert({ class_id: targetClassId, session_id: null, quiz_id: newQuiz.id })
      } catch {
        // ignore if not available
      }
    }

    return NextResponse.json({ success: true, quizId: newQuiz.id })
  } catch (error) {
    console.error('quiz share error', error)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
