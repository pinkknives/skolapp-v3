// scripts/api-health/ably.ts
import "node:process";

const key = process.env.ABLY_SERVER_API_KEY!;
const auth = Buffer.from(key).toString("base64");
const channel = `smoke-ci-${(process.env.GITHUB_SHA || Date.now().toString()).slice(0, 7)}`;

async function main() {
  if (!key) {
    throw new Error("ABLY_SERVER_API_KEY saknas");
  }

  try {
    const response = await fetch(`https://rest.ably.io/channels/${encodeURIComponent(channel)}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([{ 
        name: "ping", 
        data: { t: Date.now(), source: "api-smoke-test" } 
      }])
    });

    if (!response.ok) {
      throw new Error(`Ably HTTP ${response.status}`);
    }

    console.log("Ably OK");
  } catch (error) {
    // Log error without exposing secrets
    const errorMessage = error instanceof Error ? error.message : "Okänt fel";
    throw new Error(`Ably misslyckades: ${errorMessage}`);
  }
}

main().catch((e) => { 
  console.error(e.message); 
  process.exit(1); 
});