import bcrypt from 'bcryptjs'
import type { Env } from '../../_lib/types'
import { createSession } from '../../_lib/auth'
import { checkRateLimit } from '../../_lib/rate-limit'
import { json, error } from '../../_lib/response'

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown'

  const allowed = await checkRateLimit(context.env.LOGIN_LIMITER, `login:${ip}`)
  if (!allowed) {
    return error('Too Many Requests', 429)
  }

  const body = await context.request.json<{ password: string }>().catch(() => null)
  if (!body?.password) {
    return error('Missing password', 400)
  }

  const valid = await bcrypt.compare(body.password, context.env.ADMIN_PASSWORD_HASH)
  if (!valid) {
    return error('Invalid password', 401)
  }

  const { cookie } = await createSession(context.env)

  return new Response(JSON.stringify({ ok: true, data: { authenticated: true } }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    },
  })
}
