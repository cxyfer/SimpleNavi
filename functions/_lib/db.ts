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

export interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface LinkTag {
  link_id: number
  tag_id: number
}

export interface LinkWithTags extends Link {
  tags: Pick<Tag, 'id' | 'name' | 'slug'>[]
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

export async function getActiveTags(db: Env['DB']): Promise<Tag[]> {
  const { results } = await db
    .prepare('SELECT * FROM tags ORDER BY name ASC')
    .all<Tag>()
  return results
}

export async function getActiveLinksWithTags(db: Env['DB']): Promise<LinkWithTags[]> {
  const [linksResult, tagsResult] = await Promise.all([
    db.prepare('SELECT * FROM links WHERE is_active = 1 ORDER BY sort_order ASC, id ASC').all<Link>(),
    db.prepare(`
      SELECT lt.link_id, t.id, t.name, t.slug
      FROM link_tags lt
      JOIN tags t ON lt.tag_id = t.id
      JOIN links l ON lt.link_id = l.id
      WHERE l.is_active = 1
    `).all<{ link_id: number; id: number; name: string; slug: string }>(),
  ])

  const tagsByLinkId = new Map<number, Pick<Tag, 'id' | 'name' | 'slug'>[]>()
  for (const row of tagsResult.results) {
    const tags = tagsByLinkId.get(row.link_id) || []
    tags.push({ id: row.id, name: row.name, slug: row.slug })
    tagsByLinkId.set(row.link_id, tags)
  }

  return linksResult.results.map((link) => ({
    ...link,
    tags: tagsByLinkId.get(link.id) || [],
  }))
}
