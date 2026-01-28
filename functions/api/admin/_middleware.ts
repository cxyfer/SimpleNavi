import type { Env } from '../../_lib/types'
import { validateSession } from '../../_lib/auth'
import { error } from '../../_lib/response'

export const onRequest: PagesFunction<Env> = async (context) => {
  const valid = await validateSession(context.request, context.env)
  if (!valid) {
    return error('Unauthorized', 401)
  }

  return context.next()
}
