import type { Env } from '../../../_lib/types'
import { json, error } from '../../../_lib/response'
import type { Category } from '../../../_lib/db'

const RESERVED_SLUGS = ['admin', 'api', 'auth', 'login', 'logout']

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare(
    'SELECT * FROM categories ORDER BY sort_order ASC, id ASC'
  ).all<Category>()

  return json(results)
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json<{
    name: string
    slug: string
    sort_order?: number
    is_active?: number
  }>().catch(() => null)

  if (!body?.name || !body?.slug) {
    return error('Missing required fields', 400)
  }

  if (body.name.length > 100 || body.slug.length > 50) {
    return error('Field length exceeded', 400)
  }

  if (!/^[a-z0-9-]+$/.test(body.slug)) {
    return error('Invalid slug format', 400)
  }

  if (RESERVED_SLUGS.includes(body.slug)) {
    return error('Reserved slug', 400)
  }

  const now = new Date().toISOString()
  const result = await context.env.DB.prepare(
    `INSERT INTO categories (name, slug, sort_order, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(body.name, body.slug, body.sort_order ?? 0, body.is_active ?? 1, now, now)
    .run()

  const category = await context.env.DB.prepare('SELECT * FROM categories WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<Category>()

  return json(category, 201)
}
