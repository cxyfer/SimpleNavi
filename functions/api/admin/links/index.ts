import type { Env } from '../../_lib/types'
import { json, error } from '../../_lib/response'
import type { Link } from '../../_lib/db'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare(
    'SELECT * FROM links ORDER BY category_id ASC, sort_order ASC, id ASC'
  ).all<Link>()

  return json(results)
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json<{
    category_id: number
    title: string
    url: string
    description?: string
    icon_url?: string
    icon_source?: string
    sort_order?: number
    is_active?: number
  }>().catch(() => null)

  if (!body?.category_id || !body?.title || !body?.url) {
    return error('Missing required fields', 400)
  }

  if (body.title.length > 100 || body.url.length > 2048) {
    return error('Field length exceeded', 400)
  }

  if (body.description && body.description.length > 500) {
    return error('Description too long', 400)
  }

  const now = new Date().toISOString()
  const result = await context.env.DB.prepare(
    `INSERT INTO links (category_id, title, url, description, icon_url, icon_source, sort_order, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      body.category_id,
      body.title,
      body.url,
      body.description || null,
      body.icon_url || null,
      body.icon_source || 'auto',
      body.sort_order ?? 0,
      body.is_active ?? 1,
      now,
      now
    )
    .run()

  const link = await context.env.DB.prepare('SELECT * FROM links WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<Link>()

  return json(link, 201)
}
