export const BANNED_WORDS: string[] = [
  'idiot', 'dum', 'hat', 'skit', 'svordom', 'rasist', 'sex', 'våld'
]

export interface ScreenResult {
  level: 'ok' | 'warn' | 'block'
  reasons: string[]
}

export function screenText(text: string, options?: { gradeLevel?: string }): ScreenResult {
  const reasons: string[] = []
  const lower = text.toLowerCase()
  if (BANNED_WORDS.some(w => lower.includes(w))) {
    reasons.push('Otillåtet språk upptäckt')
  }
  // Readability heuristic: average word length
  const words = text.split(/\s+/).filter(Boolean)
  const avgLen = words.length ? words.join('').length / words.length : 0
  if (avgLen > 8) {
    reasons.push('Texten kan vara svårläst (lång genomsnittlig ordlängd)')
  }
  // Grade heuristic: simple check for advanced terms for low grades
  const grade = options?.gradeLevel || ''
  const gradeNum = parseInt(grade.replace(/\D/g, ''))
  if (!Number.isNaN(gradeNum) && gradeNum <= 3) {
    const advancedTerms = ['derivata', 'integral', 'fotosyntes', 'procentuell']
    if (advancedTerms.some(t => lower.includes(t))) {
      reasons.push('Innehåll verkar över nivå för vald årskurs')
    }
  }

  let level: ScreenResult['level'] = 'ok'
  if (reasons.length > 0) level = reasons.some(r => r.includes('Otillåtet')) ? 'block' : 'warn'
  return { level, reasons }
}
