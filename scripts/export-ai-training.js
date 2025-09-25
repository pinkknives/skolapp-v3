#!/usr/bin/env node
/*
  Export ai_training_data to exports/ai_training_YYYYMMDD.jsonl
*/
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRole) {
    console.error('Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)')
    process.exit(1)
  }
  const supabase = createClient(url, serviceRole, { auth: { persistSession: false } })
  const { data, error } = await supabase
    .from('ai_training_data')
    .select('id, teacher_id, quiz_id, question_text, question_type, subject, grade, created_at')
    .order('created_at', { ascending: true })
  if (error) {
    console.error('Query failed:', error)
    process.exit(1)
  }
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const dir = path.join(process.cwd(), 'exports')
  try { fs.mkdirSync(dir, { recursive: true }) } catch {}
  const file = path.join(dir, `ai_training_${y}${m}${d}.jsonl`)
  const stream = fs.createWriteStream(file, { encoding: 'utf8' })
  for (const row of data || []) {
    // ensure no PII is included
    const out = {
      id: row.id,
      teacher_id: row.teacher_id, // pseudonymous id
      quiz_id: row.quiz_id,
      question_text: row.question_text,
      question_type: row.question_type,
      subject: row.subject,
      grade: row.grade,
      created_at: row.created_at,
    }
    stream.write(JSON.stringify(out) + '\n')
  }
  stream.end()
  stream.on('finish', () => {
    console.log('Export written:', file)
  })
}

main().catch((e) => { console.error(e); process.exit(1) })


