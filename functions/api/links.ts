import type { Env } from '../_lib/types'
import { getActiveCategories, getActiveLinks } from '../_lib/db'
import { json } from '../_lib/response'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const [categories, links] = await Promise.all([
    getActiveCategories(context.env.DB),
    getActiveLinks(context.env.DB),
  ])

  return json({ categories, links })
}
