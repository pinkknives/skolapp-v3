export function track(eventName: string, properties?: Record<string, unknown>): void {
  try {
    // If gtag is available, send event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)?.gtag?.('event', eventName, properties ?? {})
  } catch {}
  try {
    // Fallback to console for acceptance (events visible in log)
    // Keep payload small to avoid noise
    if (process.env.NODE_ENV !== 'production') {
      console.info('[telemetry]', eventName, properties || {})
    }
  } catch {}
}


