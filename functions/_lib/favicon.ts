import type { Env } from './types'

const FAVICON_PROVIDERS = [
  (domain: string) => `https://ico.faviconkit.net/favicon/${domain}?sz=64`,
  (domain: string) => `https://icon.horse/icon/${domain}`,
  (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
]

const FETCH_TIMEOUT = 1500
const MAX_SIZE = 64 * 1024
const CACHE_TTL = 7 * 24 * 60 * 60

export async function getFavicon(domain: string, env: Env): Promise<string | null> {
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(domain)) {
    return null
  }

  const cacheKey = `favicon:${domain}`
  const cached = await env.FAVICON_CACHE?.get(cacheKey)
  if (cached) return cached

  for (const getUrl of FAVICON_PROVIDERS) {
    const url = getUrl(domain)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!res.ok) continue

      const contentLength = res.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > MAX_SIZE) continue

      await env.FAVICON_CACHE?.put(cacheKey, url, { expirationTtl: CACHE_TTL })
      return url
    } catch {
      continue
    }
  }

  return null
}
