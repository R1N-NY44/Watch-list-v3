import type { ApiUser, AuthSession } from '../types/api'
import { apiRequest } from './apiClient'

export const authApi = {
  async login(email: string, password: string, rememberMe = true): Promise<AuthSession> {
    const response = await apiRequest<{ user: ApiUser; accessToken: string }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password, rememberMe }),
    })
    return response.data
  },
  async register(email: string, password: string, displayName: string): Promise<ApiUser> {
    const response = await apiRequest<{ user: ApiUser }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ email, password, displayName }),
    })
    return response.data.user
  },
  async refresh(): Promise<string> {
    const response = await apiRequest<{ accessToken: string }>('/auth/refresh', { method: 'POST' })
    return response.data.accessToken
  },
  async currentUser(token: string): Promise<ApiUser> {
    const response = await apiRequest<{ user: ApiUser }>('/auth/current-user', {}, token)
    return response.data.user
  },
  async logout(): Promise<void> {
    await apiRequest<Record<string, never>>('/auth/logout', { method: 'POST' })
  },
}
