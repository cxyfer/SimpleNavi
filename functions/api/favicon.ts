import type { Env } from '../_lib/types'
import { getFavicon } from '../_lib/favicon'
import { error } from '../_lib/response'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const domain = url.searchParams.get('domain')

  if (!domain) {
    return error('Missing domain parameter', 400)
  }

  const faviconUrl = await getFavicon(domain, context.env)
  if (!faviconUrl) {
    return error('Favicon not found', 404)
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: faviconUrl,
      'Cache-Control': 'public, max-age=604800',
    },
  })
}

