import type { Env } from './_lib/types'

export const scheduled: ExportedHandlerScheduledHandler<Env> = async (event, env) => {
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at < datetime("now")').run()
}
