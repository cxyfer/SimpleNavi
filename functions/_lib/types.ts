export interface Env {
  DB: D1Database
  FAVICON_CACHE: KVNamespace
  LOGIN_LIMITER: RateLimit
  CLICK_LIMITER: RateLimit
  ADMIN_PASSWORD_HASH: string
  SESSION_SECRET: string
}

interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>
}
