import 'server-only'

import { supabaseServer } from '@/lib/supabase-server'
import { z } from 'zod'

// Common coercions
const zNumeric = z.union([z.number(), z.string()]).transform((v) => Number(v))
const zDateString = z.string() // ISO date string from PostgREST
const zUuid = z.string().uuid()

// Schemas per RPC
export const StudentProgressRowSchema = z.object({
  subject: z.string().nullable().optional(),
  quiz_id: zUuid.nullable().optional(),
  week_start: zDateString,
  attempts: zNumeric,
  correct: zNumeric,
  correct_rate: zNumeric,
})
export type StudentProgressRow = z.infer<typeof StudentProgressRowSchema>

export const ClassProgressRowSchema = z.object({
  subject: z.string().nullable().optional(),
  week_start: zDateString,
  attempts: zNumeric,
  correct: zNumeric,
  correct_rate: zNumeric,
  median_score: zNumeric,
})
export type ClassProgressRow = z.infer<typeof ClassProgressRowSchema>

export const SchoolProgressRowSchema = z.object({
  subject: z.string().nullable().optional(),
  week_start: zDateString,
  attempts: zNumeric,
  correct: zNumeric,
  correct_rate: zNumeric,
})
export type SchoolProgressRow = z.infer<typeof SchoolProgressRowSchema>

export const TopBottomStudentRowSchema = z.object({
  student_id: zUuid,
  attempts: zNumeric,
  avg_score: zNumeric,
})
export type TopBottomStudentRow = z.infer<typeof TopBottomStudentRowSchema>

export type TimeRange = '7d' | '30d' | 'term' | 'year'

function toRpcRange(range?: TimeRange): string {
  switch (range) {
    case '7d':
      return '7d'
    case '30d':
      return '30d'
    case 'term':
      return 'term'
    case 'year':
    default:
      return 'year'
  }
}

export interface StatsResult<T> {
  data: T
  error: string | null
}

async function parseArray<T>(rows: unknown, schema: z.ZodType<T>): Promise<StatsResult<T[]>> {
  const parsed = z.array(schema).safeParse(rows)
  if (!parsed.success) {
    return { data: [], error: 'Validation error' }
  }
  return { data: parsed.data, error: null }
}

export async function fetchStudentProgress(
  studentId: string,
  range?: TimeRange
): Promise<StatsResult<StudentProgressRow[]>> {
  const supabase = supabaseServer()
  const { data, error } = await supabase.rpc('private.get_student_progress', {
    p_student_id: studentId,
    p_range: toRpcRange(range),
  })
  if (error) return { data: [], error: error.message }
  return parseArray(data, StudentProgressRowSchema)
}

export async function fetchClassProgress(
  classId: string,
  range?: TimeRange
): Promise<StatsResult<ClassProgressRow[]>> {
  const supabase = supabaseServer()
  const { data, error } = await supabase.rpc('private.get_class_progress', {
    p_class_id: classId,
    p_range: toRpcRange(range),
  })
  if (error) return { data: [], error: error.message }
  return parseArray(data, ClassProgressRowSchema)
}

export async function fetchSchoolProgress(
  schoolId: string,
  range?: TimeRange
): Promise<StatsResult<SchoolProgressRow[]>> {
  const supabase = supabaseServer()
  const { data, error } = await supabase.rpc('private.get_school_progress', {
    p_school_id: schoolId,
    p_range: toRpcRange(range),
  })
  if (error) return { data: [], error: error.message }
  return parseArray(data, SchoolProgressRowSchema)
}

export async function fetchTopBottomStudents(
  classId: string,
  limit: number = 5
): Promise<StatsResult<TopBottomStudentRow[]>> {
  const supabase = supabaseServer()
  const { data, error } = await supabase.rpc('private.list_top_bottom_students', {
    p_class_id: classId,
    p_limit: limit,
  })
  if (error) return { data: [], error: error.message }
  return parseArray(data, TopBottomStudentRowSchema)
}
