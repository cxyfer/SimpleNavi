import type { Env } from './types'

export async function checkRateLimit(
  limiter: Env['LOGIN_LIMITER'] | Env['CLICK_LIMITER'] | undefined,
  key: string
): Promise<boolean> {
  if (!limiter) return true
  const { success } = await limiter.limit({ key })
  return success
}
