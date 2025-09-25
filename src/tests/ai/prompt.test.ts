import { describe, it, expect } from 'vitest'
import { buildMessages } from '@/lib/ai/prompt'
import type { GenerateQuestionsInput, CurriculumRef } from '@/lib/ai/schemas'

describe('buildMessages', () => {
  it('returns three messages containing subject, grade and topic', () => {
    const input: GenerateQuestionsInput = {
      gradeBand: 'ak7-9',
      subject: 'matematik',
      topic: 'algebra',
      difficulty: 3,
      count: 2,
      language: 'sv'
    }
    const curriculum: CurriculumRef[] = [
      { id: 'M7.1', label: 'Algebraiska uttryck' },
      { id: 'M7.2', label: 'Ekvationer' }
    ]
    const msgs = buildMessages(input, curriculum)
    expect(msgs).toHaveLength(3)
    const content = msgs.map(m => m.content).join('\n')
    expect(content).toContain('matematik')
    expect(content).toContain('ak7-9')
    expect(content).toContain('algebra')
  })
})


