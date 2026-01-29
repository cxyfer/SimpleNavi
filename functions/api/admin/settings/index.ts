import type { Env } from '../../../_lib/types'
import { json, error } from '../../../_lib/response'
import { getSiteSettings, updateSiteSettings } from '../../../_lib/db'

const SITE_NAME_MIN = 2
const SITE_NAME_MAX = 50

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const settings = await getSiteSettings(context.env.DB)
  if (!settings) return error('Site settings not found', 404)

  return json(settings)
}

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const body = await context.request.json<{
    site_name?: string
  }>().catch(() => null)

  if (!body) return error('Invalid request body', 400)

  if (typeof body.site_name !== 'string') {
    return error('Missing required field: site_name', 400)
  }

  if (body.site_name.length < SITE_NAME_MIN || body.site_name.length > SITE_NAME_MAX) {
    return error('site_name must be between 2 and 50 characters', 400)
  }

  const settings = await updateSiteSettings(context.env.DB, body.site_name)
  return json(settings)
}