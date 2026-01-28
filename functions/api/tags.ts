import type { Env } from '../_lib/types'
import { getActiveTags } from '../_lib/db'
import { json } from '../_lib/response'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const tags = await getActiveTags(context.env.DB)
  return json(tags)
}
