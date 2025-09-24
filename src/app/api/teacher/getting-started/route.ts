import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireTeacher()
    const supabase = supabaseServer()

    const [{ count: quizCount }, { count: classCount }, { count: sessionCount }] = await Promise.all([
      supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
      supabase.from('classes').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
      supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('teacher_id', user.id)
        .not('ended_at', 'is', null),
    ])

    return NextResponse.json({ 
      quizCount: quizCount ?? 0, 
      classCount: classCount ?? 0,
      hasSession: (sessionCount ?? 0) > 0,
    })
  } catch (_error) {
    return NextResponse.json({ quizCount: 0, classCount: 0, hasSession: false })
  }
}
