import type { Env } from '../../_lib/types'
import { json } from '../../_lib/response'

interface TopLink {
  id: number
  title: string
  url: string
  click_count: number
}

interface DailyStat {
  day: string
  total_clicks: number
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const [topLinks, dailyStats, totalLinks, totalCategories] = await Promise.all([
    context.env.DB.prepare(
      'SELECT id, title, url, click_count FROM links ORDER BY click_count DESC LIMIT 10'
    ).all<TopLink>(),
    context.env.DB.prepare(
      `SELECT day, SUM(count) as total_clicks FROM click_stats_daily
       WHERE day >= date('now', '-30 days')
       GROUP BY day ORDER BY day DESC`
    ).all<DailyStat>(),
    context.env.DB.prepare('SELECT COUNT(*) as count FROM links').first<{ count: number }>(),
    context.env.DB.prepare('SELECT COUNT(*) as count FROM categories').first<{ count: number }>(),
  ])

  return json({
    topLinks: topLinks.results,
    dailyStats: dailyStats.results,
    totalLinks: totalLinks?.count ?? 0,
    totalCategories: totalCategories?.count ?? 0,
  })
}
