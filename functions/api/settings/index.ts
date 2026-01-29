import type { Env } from '../../_lib/types'
import { json } from '../../_lib/response'
import { getSiteSettings } from '../../_lib/db'

const DEFAULT_SITE_NAME = 'SimpleNavi'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const settings = await getSiteSettings(context.env.DB)
  const siteName = settings?.site_name ?? DEFAULT_SITE_NAME
  return json({ siteName })
}