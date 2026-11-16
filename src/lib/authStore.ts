import { create } from 'zustand'
import type { ApiUser } from '../types/api'
import { authApi } from '../services/authApi'

type AuthState = {
  user: ApiUser | null
  accessToken: string | null
  initialized: boolean
  initializing: boolean
  setSession: (user: ApiUser, accessToken: string) => void
  clearSession: () => void
  signOut: () => Promise<void>
  bootstrap: () => Promise<void>
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  initialized: false,
  initializing: false,
  setSession: (user, accessToken) => set({ user, accessToken, initialized: true, initializing: false }),
  clearSession: () => set({ user: null, accessToken: null, initialized: true, initializing: false }),
  signOut: async () => {
    try { await authApi.logout() } catch (error) { console.warn('Could not revoke the server session.', error) }
    finally { get().clearSession() }
  },
  bootstrap: async () => {
    if (get().initialized || get().initializing) return
    set({ initializing: true })
    try {
      const accessToken = await authApi.refresh()
      const user = await authApi.currentUser(accessToken)
      if (get().user) return
      set({ user, accessToken, initialized: true, initializing: false })
    } catch {
      if (!get().user) set({ user: null, accessToken: null, initialized: true, initializing: false })
    }
  },
}))
