import type { Env } from '../_lib/types'
import { recordClick } from '../_lib/db'
import { checkRateLimit } from '../_lib/rate-limit'
import { error, noContent } from '../_lib/response'

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown'

  const body = await context.request.json<{ linkId: number }>().catch(() => null)
  if (!body?.linkId || typeof body.linkId !== 'number') {
    return error('Invalid linkId', 400)
  }

  const allowed = await checkRateLimit(context.env.CLICK_LIMITER, `click:${ip}:${body.linkId}`)
  if (!allowed) {
    return error('Too Many Requests', 429)
  }

  await recordClick(context.env.DB, body.linkId)
  return noContent()
}
