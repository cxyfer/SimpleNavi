import type { Env } from '../../../_lib/types'
import { json, error, noContent } from '../../../_lib/response'
import type { Link } from '../../../_lib/db'

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = parseInt(context.params.id as string)
  if (isNaN(id)) {
    return error('Invalid id', 400)
  }

  const existing = await context.env.DB.prepare('SELECT id FROM links WHERE id = ?')
    .bind(id)
    .first()

  if (!existing) {
    return error('Link not found', 404)
  }

  const body = await context.request.json<{
    category_id?: number
    title?: string
    url?: string
    description?: string
    icon_url?: string
    icon_source?: string
    sort_order?: number
    is_active?: number
  }>().catch(() => null)

  if (!body) {
    return error('Invalid body', 400)
  }

  if (body.title && body.title.length > 100) {
    return error('Title too long', 400)
  }

  if (body.url && body.url.length > 2048) {
    return error('URL too long', 400)
  }

  if (body.description && body.description.length > 500) {
    return error('Description too long', 400)
  }

  const updates: string[] = []
  const values: unknown[] = []

  if (body.category_id !== undefined) {
    updates.push('category_id = ?')
    values.push(body.category_id)
  }
  if (body.title !== undefined) {
    updates.push('title = ?')
    values.push(body.title)
  }
  if (body.url !== undefined) {
    updates.push('url = ?')
    values.push(body.url)
  }
  if (body.description !== undefined) {
    updates.push('description = ?')
    values.push(body.description || null)
  }
  if (body.icon_url !== undefined) {
    updates.push('icon_url = ?')
    values.push(body.icon_url || null)
  }
  if (body.icon_source !== undefined) {
    updates.push('icon_source = ?')
    values.push(body.icon_source)
  }
  if (body.sort_order !== undefined) {
    updates.push('sort_order = ?')
    values.push(body.sort_order)
  }
  if (body.is_active !== undefined) {
    updates.push('is_active = ?')
    values.push(body.is_active)
  }

  if (updates.length === 0) {
    return error('No fields to update', 400)
  }

  updates.push('updated_at = ?')
  values.push(new Date().toISOString())
  values.push(id)

  await context.env.DB.prepare(`UPDATE links SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()

  const link = await context.env.DB.prepare('SELECT * FROM links WHERE id = ?')
    .bind(id)
    .first<Link>()

  return json(link)
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = parseInt(context.params.id as string)
  if (isNaN(id)) {
    return error('Invalid id', 400)
  }

  await context.env.DB.prepare('DELETE FROM links WHERE id = ?').bind(id).run()
  return noContent()
}
