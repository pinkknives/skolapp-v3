import { NextRequest, NextResponse } from 'next/server'
import { fetchStudentProgress, fetchClassProgress, fetchSchoolProgress, fetchTopBottomStudents, type TimeRange } from '@/lib/api/stats'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as {
      studentId?: string
      classId?: string
      schoolId?: string
      range?: TimeRange
      limit?: number
    }

    const range: TimeRange = body.range || '30d'

    const [student, cls, school, topBottom] = await Promise.all([
      body.studentId ? fetchStudentProgress(body.studentId, range) : Promise.resolve({ data: [], error: null }),
      body.classId ? fetchClassProgress(body.classId, range) : Promise.resolve({ data: [], error: null }),
      body.schoolId ? fetchSchoolProgress(body.schoolId, range) : Promise.resolve({ data: [], error: null }),
      body.classId ? fetchTopBottomStudents(body.classId, body.limit ?? 5) : Promise.resolve({ data: [], error: null })
    ])

    return NextResponse.json({ student, class: cls, school, topBottom })
  } catch (_error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
