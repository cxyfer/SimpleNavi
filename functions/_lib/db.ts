import type { Env } from './types'

export interface Category {
  id: number
  name: string
  slug: string
  sort_order: number
  is_active: number
  created_at: string
  updated_at: string
}

export interface Link {
  id: number
  category_id: number
  title: string
  url: string
  description: string | null
  icon_url: string | null
  icon_source: string
  sort_order: number
  is_active: number
  click_count: number
  created_at: string
  updated_at: string
}

export interface ClickStatDaily {
  link_id: number
  day: string
  count: number
  last_clicked_at: string | null
}

export async function getActiveCategories(db: Env['DB']): Promise<Category[]> {
  const { results } = await db
    .prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')
    .all<Category>()
  return results
}

export async function getActiveLinks(db: Env['DB']): Promise<Link[]> {
  const { results } = await db
    .prepare('SELECT * FROM links WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')
    .all<Link>()
  return results
}

export async function recordClick(db: Env['DB'], linkId: number): Promise<void> {
  const day = new Date().toISOString().slice(0, 10)
  const now = new Date().toISOString()

  await db.batch([
    db.prepare('UPDATE links SET click_count = click_count + 1 WHERE id = ?').bind(linkId),
    db
      .prepare(
        `INSERT INTO click_stats_daily (link_id, day, count, last_clicked_at)
         VALUES (?, ?, 1, ?)
         ON CONFLICT (link_id, day) DO UPDATE SET
           count = count + 1,
           last_clicked_at = excluded.last_clicked_at`
      )
      .bind(linkId, day, now),
  ])
}
