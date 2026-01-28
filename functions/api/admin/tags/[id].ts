import type { Env } from '../../../_lib/types'
import { json, error } from '../../../_lib/response'
import type { Tag } from '../../../_lib/db'

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = Number(context.params.id)
  if (isNaN(id)) return error('Invalid ID', 400)

  const existing = await context.env.DB.prepare('SELECT * FROM tags WHERE id = ?')
    .bind(id)
    .first<Tag>()

  if (!existing) return error('Tag not found', 404)

  const body = await context.request.json<{
    name?: string
    slug?: string
  }>().catch(() => null)

  if (!body) return error('Invalid request body', 400)

  const name = body.name ?? existing.name
  const slug = body.slug ?? existing.slug

  if (name.length > 50) return error('Tag name too long', 400)

  if (!/^[a-z0-9-]+$/.test(slug)) return error('Invalid slug format', 400)

  if (slug !== existing.slug) {
    const duplicate = await context.env.DB.prepare('SELECT id FROM tags WHERE slug = ? AND id != ?')
      .bind(slug, id)
      .first()
    if (duplicate) return error('Tag slug already exists', 400)
  }

  const now = new Date().toISOString()
  await context.env.DB.prepare(
    'UPDATE tags SET name = ?, slug = ?, updated_at = ? WHERE id = ?'
  )
    .bind(name, slug, now, id)
    .run()

  const tag = await context.env.DB.prepare('SELECT * FROM tags WHERE id = ?')
    .bind(id)
    .first<Tag>()

  return json(tag)
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = Number(context.params.id)
  if (isNaN(id)) return error('Invalid ID', 400)

  const existing = await context.env.DB.prepare('SELECT id FROM tags WHERE id = ?')
    .bind(id)
    .first()

  if (!existing) return error('Tag not found', 404)

  await context.env.DB.prepare('DELETE FROM tags WHERE id = ?').bind(id).run()

  return json(null, 204)
}
