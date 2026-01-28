export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

export function json<T>(data: T, status = 200): Response {
  return Response.json({ ok: true, data }, { status })
}

export function error(message: string, status = 400): Response {
  return Response.json({ ok: false, error: message }, { status })
}

export function noContent(): Response {
  return new Response(null, { status: 204 })
}
