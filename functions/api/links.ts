import type { Env } from '../_lib/types'
import { getActiveCategories, getActiveLinksWithTags } from '../_lib/db'
import { json } from '../_lib/response'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const [categories, links] = await Promise.all([
    getActiveCategories(context.env.DB),
    getActiveLinksWithTags(context.env.DB),
  ])

  return json({ categories, links })
}
