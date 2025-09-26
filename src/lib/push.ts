type PushPayload = { headings: string; contents: string; url?: string }

export async function sendPushToAll(payload: PushPayload): Promise<void> {
  const appId = process.env.ONESIGNAL_APP_ID
  const apiKey = process.env.ONESIGNAL_REST_API_KEY
  if (!appId || !apiKey) return
  try {
    await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ['All'],
        headings: { en: payload.headings, sv: payload.headings },
        contents: { en: payload.contents, sv: payload.contents },
        url: payload.url
      })
    })
  } catch {}
}


