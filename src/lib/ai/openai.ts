import OpenAI from "openai";

// Only create the client if API key is available
// This prevents errors during build time when the key might not be set
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY not found - OpenAI features will be disabled");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "placeholder-key-for-build",
  // ...(optional) organization: process.env.OPENAI_ORG_ID,
  // ...(optional) project: process.env.OPENAI_PROJECT,
});

export const isOpenAIAvailable = !!process.env.OPENAI_API_KEY;