import type { ApiEnvelope } from '../types/api'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://watch-api.noext.cyou/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: 'include' })
  const body = await response.json().catch(() => null) as ApiEnvelope<T> | { message?: string; error?: { code?: string } } | null
  if (!response.ok) {
    const message = body && 'message' in body && body.message ? body.message : `Request failed (${response.status})`
    const code = body && 'error' in body ? body.error?.code : undefined
    throw new ApiError(message, response.status, code)
  }
  if (!body || !('data' in body)) throw new ApiError('The API returned an invalid response.', response.status)
  return body as ApiEnvelope<T>
}
