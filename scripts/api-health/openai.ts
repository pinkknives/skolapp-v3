// scripts/api-health/openai.ts
import "node:process";

const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const key = process.env.OPENAI_API_KEY!;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

async function main() {
  if (!key) {
    throw new Error("OPENAI_API_KEY saknas");
  }

  // Retry logic with timeout
  const maxRetries = 1;
  const retryDelay = 500;
  const timeout = 15000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Svara med exakt texten OK." }],
          temperature: 0
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI HTTP ${response.status}`);
      }

      const json = await response.json();
      const text = json?.choices?.[0]?.message?.content?.trim();
      
      if (text !== "OK") {
        throw new Error("OpenAI svar avvek från 'OK'");
      }

      console.log("OpenAI OK");
      return;
    } catch (error) {
      if (attempt < maxRetries) {
        console.warn(`OpenAI attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // Log error without exposing secrets
      const errorMessage = error instanceof Error ? error.message : "Okänt fel";
      throw new Error(`OpenAI misslyckades: ${errorMessage}`);
    }
  }
}

main().catch((e) => { 
  console.error(e.message); 
  process.exit(1); 
});