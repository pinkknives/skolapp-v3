import 'dotenv/config'

async function main() {
  const base = process.env.BASE_URL || 'http://localhost:3000'
  const p95ThresholdMs = Number(process.env.SKOLVERKET_P95_MS || 2000)

  const started = Date.now()
  const res = await fetch(`${base}/api/health/skolverket`, { cache: 'no-store' })
  const latency = Date.now() - started
  const json = await res.json().catch(() => ({}))

  const ok = res.ok && json?.ok !== false

  // Telemetry-like console outputs for CI/workflows to scrape
  console.log(JSON.stringify({ event: 'skolverket.request', latency }))
  if (json?.fallback) console.log(JSON.stringify({ event: 'skolverket.fallback' }))
  if (ok) console.log(JSON.stringify({ event: 'skolverket.version', version: json?.version || null }))

  if (!ok) {
    console.error('ALERT skolverket.error upstream unavailable')
    process.exit(1)
  }

  if (latency > p95ThresholdMs) {
    console.error(`ALERT skolverket.latency p95>${p95ThresholdMs}ms (observed ${latency}ms)`) 
    process.exit(2)
  }

  console.log('SKOLVERKET_SYNTHETIC_OK')
}

main().catch((e) => {
  console.error('ALERT skolverket.error synthetic failed:', e?.message || e)
  process.exit(3)
})
