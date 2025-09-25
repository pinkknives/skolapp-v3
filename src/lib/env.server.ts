import { z } from 'zod'

const baseSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_AI_QUOTA_CHECK: z.enum(['on', 'off']).optional(),
})

const parsed = baseSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NEXT_PUBLIC_AI_QUOTA_CHECK: process.env.NEXT_PUBLIC_AI_QUOTA_CHECK,
})

export const env = {
  nodeEnv: parsed.NODE_ENV,
  openaiKey: parsed.OPENAI_API_KEY,
  quotaCheck: parsed.NEXT_PUBLIC_AI_QUOTA_CHECK ?? ((parsed.NODE_ENV === 'development' || parsed.NODE_ENV === 'test') ? 'off' : 'on'),
}

export function assertOpenAIAvailable(): { ok: boolean; reason?: string } {
  if (!env.openaiKey) {
    if (env.nodeEnv !== 'production') {
      console.warn('OPENAI_API_KEY saknas i dev – AI körs i dev‑läge utan hårt krav på nyckel.')
      return { ok: false, reason: 'MISSING_API_KEY_DEV' }
    }
    return { ok: false, reason: 'MISSING_API_KEY_PROD' }
  }
  return { ok: true }
}


