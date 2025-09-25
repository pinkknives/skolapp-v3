import OpenAI from "openai";

// Important: Only instantiate and log on the server.
const isServerRuntime = typeof window === 'undefined'

// Environment variables validation
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_PROJECT_ID = process.env.OPENAI_PROJECT_ID;

// Warn only on server to avoid noisy client console
if (isServerRuntime && !OPENAI_API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    console.warn("⚠️  OPENAI_API_KEY saknas i produktionsbygge – AI-funktioner inaktiveras");
  } else {
    console.warn("⚠️  OPENAI_API_KEY saknas - OpenAI funktioner kommer att inaktiveras (dev-varning)");
  }
}

export const openai: OpenAI = (isServerRuntime
  ? new OpenAI({
      apiKey: OPENAI_API_KEY || "placeholder-key-for-build",
      // Optional organization and project configuration
      ...(OPENAI_PROJECT_ID && { project: OPENAI_PROJECT_ID }),
    })
  : (undefined as unknown as OpenAI)
)

// Client-safe availability flag: server checks real key; client uses NEXT_PUBLIC flag
export const isOpenAIAvailable = isServerRuntime
  ? !!OPENAI_API_KEY
  : process.env.NEXT_PUBLIC_OPENAI_ENABLED !== 'false'