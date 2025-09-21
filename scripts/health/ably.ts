// scripts/health/ably.ts
import { Realtime } from "ably";

async function main() {
  const key = process.env.ABLY_SERVER_API_KEY;
  if (!key) throw new Error("Missing ABLY_SERVER_API_KEY");

  // En enkel connect -> connected räcker som hälsokoll för key + nät
  const realtime = new Realtime({ key });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      realtime.close();
      reject(new Error("Ably connection timeout"));
    }, 10000);

    realtime.connection.on('connected', () => {
      clearTimeout(timeout);
      realtime.close();
      resolve();
    });

    realtime.connection.on('failed', (error) => {
      clearTimeout(timeout);
      realtime.close();
      reject(error);
    });
  });

  console.log("ABLY_OK");
}

main().catch((e) => {
  console.error("Ably error:", e?.message || e);
  process.exit(1);
});