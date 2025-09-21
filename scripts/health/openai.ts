// scripts/health/openai.ts
import OpenAI from "openai";

async function main() {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
    // @ts-ignore – projekt-id är valfritt, sätts bara om det finns
    project: process.env.OPENAI_PROJECT_ID || undefined,
  });

  // Minimal prompt som inte kostar nästan någonting
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Svara exakt: PONG" }],
    temperature: 0,
  });

  const text = res.choices?.[0]?.message?.content?.trim();
  if (text !== "PONG") {
    console.error("OpenAI health failed. Got:", text);
    process.exit(1);
  }

  console.log("OPENAI_OK");
}

main().catch((e) => {
  console.error("OpenAI error:", e?.message || e);
  process.exit(1);
});