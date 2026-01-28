import type { Env } from '../../../../_lib/types'
import { json, error } from '../../../../_lib/response'

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const linkId = Number(context.params.id)
  if (isNaN(linkId)) return error('Invalid link ID', 400)

  const link = await context.env.DB.prepare('SELECT id FROM links WHERE id = ?')
    .bind(linkId)
    .first()

  if (!link) return error('Link not found', 404)

  const body = await context.request.json<{ tag_ids: number[] }>().catch(() => null)

  if (!body || !Array.isArray(body.tag_ids)) {
    return error('Invalid request body: tag_ids array required', 400)
  }

  const tagIds = body.tag_ids.filter((id) => typeof id === 'number' && !isNaN(id))

  if (tagIds.length > 0) {
    const placeholders = tagIds.map(() => '?').join(',')
    const { results } = await context.env.DB.prepare(
      `SELECT id FROM tags WHERE id IN (${placeholders})`
    )
      .bind(...tagIds)
      .all<{ id: number }>()

    if (results.length !== tagIds.length) {
      return error('Some tag IDs do not exist', 400)
    }
  }

  await context.env.DB.prepare('DELETE FROM link_tags WHERE link_id = ?')
    .bind(linkId)
    .run()

  if (tagIds.length > 0) {
    const insertStatements = tagIds.map((tagId) =>
      context.env.DB.prepare('INSERT INTO link_tags (link_id, tag_id) VALUES (?, ?)')
        .bind(linkId, tagId)
    )
    await context.env.DB.batch(insertStatements)
  }

  const { results: tags } = await context.env.DB.prepare(`
    SELECT t.id, t.name, t.slug
    FROM tags t
    JOIN link_tags lt ON t.id = lt.tag_id
    WHERE lt.link_id = ?
  `)
    .bind(linkId)
    .all<{ id: number; name: string; slug: string }>()

  return json({ link_id: linkId, tags })
}
