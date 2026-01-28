import type { Env } from '../../_lib/types'
import { deleteSession } from '../../_lib/auth'

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const cookie = await deleteSession(context.request, context.env)

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    },
  })
}
