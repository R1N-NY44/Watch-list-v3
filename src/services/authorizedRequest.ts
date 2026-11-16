import { useAuth } from '../lib/authStore'
import { authApi } from './authApi'
import { ApiError, apiRequest } from './apiClient'

export async function authorizedRequest<T>(path: string, init: RequestInit = {}, tokenOverride?: string) {
  const auth = useAuth.getState()
  const token = auth.accessToken ?? tokenOverride
  try {
    return await apiRequest<T>(path, init, token ?? undefined)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !auth.user) throw error
    try {
      const accessToken = await authApi.refresh()
      const user = await authApi.currentUser(accessToken)
      useAuth.getState().setSession(user, accessToken)
      return await apiRequest<T>(path, init, accessToken)
    } catch (refreshError) {
      useAuth.getState().clearSession()
      throw refreshError
    }
  }
}
