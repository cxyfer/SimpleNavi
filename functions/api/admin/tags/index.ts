import type { Env } from '../../../_lib/types'
import { json, error } from '../../../_lib/response'
import type { Tag } from '../../../_lib/db'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare(
    'SELECT * FROM tags ORDER BY name ASC'
  ).all<Tag>()

  return json(results)
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json<{
    name: string
    slug?: string
  }>().catch(() => null)

  if (!body?.name) {
    return error('Missing required field: name', 400)
  }

  if (body.name.length > 50) {
    return error('Tag name too long', 400)
  }

  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  if (!/^[a-z0-9-]+$/.test(slug) || slug.length === 0) {
    return error('Invalid slug format', 400)
  }

  const existing = await context.env.DB.prepare('SELECT id FROM tags WHERE slug = ?')
    .bind(slug)
    .first()

  if (existing) {
    return error('Tag slug already exists', 400)
  }

  const now = new Date().toISOString()
  const result = await context.env.DB.prepare(
    `INSERT INTO tags (name, slug, created_at, updated_at) VALUES (?, ?, ?, ?)`
  )
    .bind(body.name, slug, now, now)
    .run()

  const tag = await context.env.DB.prepare('SELECT * FROM tags WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<Tag>()

  return json(tag, 201)
}
