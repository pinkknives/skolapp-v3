import OpenAI from "openai";

// Environment variables validation
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_PROJECT_ID = process.env.OPENAI_PROJECT_ID;

// Only create the client if API key is available
// This prevents errors during build time when the key might not be set
if (!OPENAI_API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    console.error("❌ OPENAI_API_KEY är obligatoriskt i production-miljö");
  } else {
    console.warn("⚠️  OPENAI_API_KEY saknas - OpenAI funktioner kommer att inaktiveras");
  }
}

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY || "placeholder-key-for-build",
  // Optional organization and project configuration
  ...(OPENAI_PROJECT_ID && { project: OPENAI_PROJECT_ID }),
});

export const isOpenAIAvailable = !!OPENAI_API_KEY;