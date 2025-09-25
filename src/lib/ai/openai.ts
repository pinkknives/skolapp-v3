import OpenAI from "openai";

// Environment variables validation
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_PROJECT_ID = process.env.OPENAI_PROJECT_ID;

// Only create the client if API key is available
// This prevents errors during build time when the key might not be set
if (!OPENAI_API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    // Downgrade to warning to avoid alarming build-time errors when AI is optional
    console.warn("⚠️  OPENAI_API_KEY saknas i produktionsbygge – AI-funktioner inaktiveras");
  } else {
    console.warn("⚠️  OPENAI_API_KEY saknas - OpenAI funktioner kommer att inaktiveras");
  }
}

// Important: Only instantiate the OpenAI client on the server.
// Importing this file in a Client Component should NOT construct the client.
const isServerRuntime = typeof window === 'undefined'

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