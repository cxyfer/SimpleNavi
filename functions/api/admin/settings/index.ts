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

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const body = await context.request.json<{
    siteName?: string
  }>().catch(() => null)

  if (!body) return error('Invalid request body', 400)

  if (typeof body.siteName !== 'string') {
    return error('Missing required field: siteName', 400)
  }

  if (body.siteName.length < SITE_NAME_MIN || body.siteName.length > SITE_NAME_MAX) {
    return error('siteName must be between 2 and 50 characters', 400)
  }

  const settings = await updateSiteSettings(context.env.DB, body.siteName)
  return json(settings)
}

export const onRequestPatch: PagesFunction<Env> = onRequestPut