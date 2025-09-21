import { Realtime } from 'ably'

let client: Realtime | null = null

export function getAbly(clientId?: string, role?: 'teacher' | 'student') {
  if (!client) {
    // Check if we have a public subscribe-only key for read-only access
    const subscribeKey = process.env.NEXT_PUBLIC_ABLY_SUBSCRIBE_KEY
    
    if (subscribeKey && !role) {
      // Use public key for read-only access
      client = new Realtime({
        key: subscribeKey,
        transportParams: { remainPresentForMs: 60000 },
      })
    } else {
      // Use token authentication for full access
      client = new Realtime({
        authUrl: '/api/ably/token',
        authHeaders: {
          ...(clientId ? { 'x-client-id': clientId } : {}),
          ...(role ? { 'x-role': role } : {}),
        },
        transportParams: { remainPresentForMs: 60000 },
      })
    }
  }
  return client
}

export function disconnectAbly() {
  if (client) {
    client.close()
    client = null
  }
}