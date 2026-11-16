import { create } from 'zustand'
import { useAuth } from './authStore'
import { libraryApi } from '../services/libraryApi'
import type { Movie, Status } from '../types/movie'

type CollectionStore = {
  collection: Record<string, Status>
  libraryMovies: Record<string, Movie>
  hydrate: (token: string | null) => Promise<void>
  setStatus: (tmdbId: string, status: Status | null, movie?: Movie) => Promise<void>
}

export const useCollection = create<CollectionStore>((set, get) => ({
  collection: {},
  libraryMovies: {},
  hydrate: async (token) => {
    if (!token) {
      set({ collection: {}, libraryMovies: {} })
      return
    }
    try {
      const entries = await libraryApi.list(token)
      set({
        collection: Object.fromEntries(entries.map((entry) => [entry.movieId, entry.status])),
        libraryMovies: Object.fromEntries(entries.map((entry) => [entry.movieId, entry.movie])),
      })
    } catch (error) {
      console.error('Could not load the API library.', error)
      window.dispatchEvent(new CustomEvent('api-error', { detail: error instanceof Error ? error.message : 'Could not load the library.' }))
    }
  },
  setStatus: async (tmdbId, status, movie) => {
    const token = useAuth.getState().accessToken
    if (!token) {
      window.dispatchEvent(new Event('auth-required'))
      return
    }

    const key = String(tmdbId)
    const previous = get().collection[key]
    const collection = { ...get().collection }
    const libraryMovies = { ...get().libraryMovies }
    if (status) {
      collection[key] = status
      if (movie) libraryMovies[key] = movie
    } else {
      delete collection[key]
      delete libraryMovies[key]
    }
    set({ collection, libraryMovies })

    try {
      await libraryApi.setStatus(token, Number(tmdbId), status, previous)
    } catch (error) {
      const rollbackCollection = { ...get().collection }
      const rollbackMovies = { ...get().libraryMovies }
      if (previous) rollbackCollection[key] = previous
      else delete rollbackCollection[key]
      if (movie && status && !previous) delete rollbackMovies[key]
      if (previous && movie) rollbackMovies[key] = movie
      set({ collection: rollbackCollection, libraryMovies: rollbackMovies })
      console.error('Could not update the API library.', error)
      window.dispatchEvent(new CustomEvent('api-error', { detail: error instanceof Error ? error.message : 'Could not update library.' }))
    }
  },
}))
