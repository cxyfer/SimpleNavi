import type { Env } from '../../../_lib/types'
import { json, error, noContent } from '../../../_lib/response'
import type { Category } from '../../../_lib/db'

const RESERVED_SLUGS = ['admin', 'api', 'auth', 'login', 'logout']

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = parseInt(context.params.id as string)
  if (isNaN(id)) {
    return error('Invalid id', 400)
  }

  const existing = await context.env.DB.prepare('SELECT id FROM categories WHERE id = ?')
    .bind(id)
    .first()

  if (!existing) {
    return error('Category not found', 404)
  }

  const body = await context.request.json<{
    name?: string
    slug?: string
    sort_order?: number
    is_active?: number
  }>().catch(() => null)

  if (!body) {
    return error('Invalid body', 400)
  }

  if (body.name && body.name.length > 100) {
    return error('Name too long', 400)
  }

  if (body.slug) {
    if (body.slug.length > 50) {
      return error('Slug too long', 400)
    }
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return error('Invalid slug format', 400)
    }
    if (RESERVED_SLUGS.includes(body.slug)) {
      return error('Reserved slug', 400)
    }
  }

  const updates: string[] = []
  const values: unknown[] = []

  if (body.name !== undefined) {
    updates.push('name = ?')
    values.push(body.name)
  }
  if (body.slug !== undefined) {
    updates.push('slug = ?')
    values.push(body.slug)
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

  await context.env.DB.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()

  const category = await context.env.DB.prepare('SELECT * FROM categories WHERE id = ?')
    .bind(id)
    .first<Category>()

  return json(category)
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = parseInt(context.params.id as string)
  if (isNaN(id)) {
    return error('Invalid id', 400)
  }

  const hasLinks = await context.env.DB.prepare(
    'SELECT id FROM links WHERE category_id = ? LIMIT 1'
  )
    .bind(id)
    .first()

  if (hasLinks) {
    return error('Cannot delete category with existing links', 400)
  }

  await context.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run()
  return noContent()
}
