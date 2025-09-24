import crypto from 'crypto'

export interface SharePayload {
  scope: 'student' | 'class'
  id: string
  exp: number // unix seconds
}

function getSecret(): string {
  const s = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || ''
  if (!s) throw new Error('Missing secret for token signing')
  return s
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function signShareToken(payload: SharePayload): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encHeader = base64url(JSON.stringify(header))
  const encPayload = base64url(JSON.stringify(payload))
  const data = `${encHeader}.${encPayload}`
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${data}.${sig}`
}

export function verifyShareToken(token: string): SharePayload | null {
  try {
    const [encHeader, encPayload, sig] = token.split('.')
    if (!encHeader || !encPayload || !sig) return null
    const data = `${encHeader}.${encPayload}`
    const expected = crypto.createHmac('sha256', getSecret()).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    if (sig !== expected) return null
    const json = JSON.parse(Buffer.from(encPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')) as SharePayload
    if (typeof json.exp !== 'number' || Date.now() / 1000 > json.exp) return null
    if (json.scope !== 'student' && json.scope !== 'class') return null
    if (!json.id) return null
    return json
  } catch {
    return null
  }
}
