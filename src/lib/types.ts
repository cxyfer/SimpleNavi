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

export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

export interface LinksData {
  categories: Category[]
  links: Link[]
}

export interface StatsData {
  topLinks: { id: number; title: string; url: string; click_count: number }[]
  dailyStats: { day: string; total_clicks: number }[]
  totalLinks: number
  totalCategories: number
}
