import type { ApiResponse, LinksData, Link, Category, StatsData, Tag } from './types'

const BASE_URL = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (res.status === 204) return undefined as T

  const data = (await res.json()) as ApiResponse<T>
  if (!data.ok) throw new Error(data.error || 'Request failed')
  return data.data as T
}

export const api = {
  links: {
    list: () => request<LinksData>('/links'),
    click: (linkId: number) =>
      navigator.sendBeacon
        ? (navigator.sendBeacon(`${BASE_URL}/click`, JSON.stringify({ linkId })), Promise.resolve())
        : request<void>('/click', { method: 'POST', body: JSON.stringify({ linkId }) }),
  },

  tags: {
    list: () => request<Tag[]>('/tags'),
  },

  favicon: {
    get: (domain: string) => request<{ url: string }>(`/favicon?domain=${encodeURIComponent(domain)}`),
  },

  auth: {
    login: (password: string) =>
      request<{ authenticated: boolean }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),
    logout: () => request<void>('/auth/logout', { method: 'POST' }),
    me: () => request<{ authenticated: boolean }>('/auth/me'),
  },

  admin: {
    links: {
      list: () => request<Link[]>('/admin/links'),
      create: (data: Partial<Link>) =>
        request<Link>('/admin/links', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: number, data: Partial<Link>) =>
        request<Link>(`/admin/links/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: number) => request<void>(`/admin/links/${id}`, { method: 'DELETE' }),
      updateTags: (id: number, tagIds: number[]) =>
        request<{ link_id: number; tags: Pick<Tag, 'id' | 'name' | 'slug'>[] }>(
          `/admin/links/${id}/tags`,
          { method: 'PUT', body: JSON.stringify({ tag_ids: tagIds }) }
        ),
    },
    categories: {
      list: () => request<Category[]>('/admin/categories'),
      create: (data: Partial<Category>) =>
        request<Category>('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: number, data: Partial<Category>) =>
        request<Category>(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: number) => request<void>(`/admin/categories/${id}`, { method: 'DELETE' }),
    },
    tags: {
      list: () => request<Tag[]>('/admin/tags'),
      create: (data: { name: string; slug?: string }) =>
        request<Tag>('/admin/tags', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: number, data: Partial<Tag>) =>
        request<Tag>(`/admin/tags/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: number) => request<void>(`/admin/tags/${id}`, { method: 'DELETE' }),
    },
    stats: () => request<StatsData>('/admin/stats'),
  },
}
