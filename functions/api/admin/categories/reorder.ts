import type { Env } from '../../../_lib/types'
import { json, error } from '../../../_lib/response'

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const body = await context.request.json<{
    ids: number[]
  }>().catch(() => null)

  if (!body?.ids || !Array.isArray(body.ids)) {
    return error('Missing required field: ids', 400)
  }

  const now = new Date().toISOString()
  const statements = body.ids.map((id, index) =>
    context.env.DB.prepare('UPDATE categories SET sort_order = ?, updated_at = ? WHERE id = ?')
      .bind(index, now, id)
  )

  await context.env.DB.batch(statements)

  return json({ success: true })
}
