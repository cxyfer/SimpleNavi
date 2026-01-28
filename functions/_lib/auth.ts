import type { Env } from './types'

const SESSION_COOKIE = '__Host-sn_session'
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000

export function parseSessionCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie')
  if (!cookie) return null

  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))
  return match ? match[1] : null
}

export async function createSession(env: Env): Promise<{ id: string; cookie: string }> {
  const id = crypto.randomUUID()
  const signature = await sign(id, env.SESSION_SECRET)
  const token = `${id}.${signature}`

  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_TTL)

  await env.DB.prepare(
    'INSERT INTO sessions (id, created_at, expires_at) VALUES (?, ?, ?)'
  )
    .bind(id, now.toISOString(), expiresAt.toISOString())
    .run()

  const cookie = `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL / 1000}`
  return { id, cookie }
}

export async function validateSession(request: Request, env: Env): Promise<boolean> {
  const token = parseSessionCookie(request)
  if (!token) return false

  const [id, signature] = token.split('.')
  if (!id || !signature) return false

  const expectedSig = await sign(id, env.SESSION_SECRET)
  if (signature !== expectedSig) return false

  const result = await env.DB.prepare(
    'SELECT id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
  )
    .bind(id)
    .first()

  return !!result
}

export async function deleteSession(request: Request, env: Env): Promise<string> {
  const token = parseSessionCookie(request)
  if (token) {
    const [id] = token.split('.')
    if (id) {
      await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run()
    }
  }

  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}

async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
