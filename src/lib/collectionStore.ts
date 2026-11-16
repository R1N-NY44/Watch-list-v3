import { create } from 'zustand'
import { collectionKeyFor, tmdbIdFor } from '../data/tmdbIds'
import { useAuth } from './authStore'
import { libraryApi } from '../services/libraryApi'
import { movies } from '../data/movie'
import type { Movie, Status } from '../types/movie'

type CollectionStore = {
  collection: Record<string, Status>
  libraryMovies: Record<string, Movie>
  hydrate: (token: string | null) => Promise<void>
  setStatus: (id: string, status: Status | null, movie?: Movie) => Promise<void>
}

const sampleCollection: Record<string, Status> = {
  past: 'watched', arrival: 'watched', her: 'watched', moonlight: 'watched',
  grand: 'planned', interstellar: 'planned', whiplash: 'planned',
}

function loadCollection(): Record<string, Status> {
  const initial = Object.fromEntries(Object.entries(sampleCollection).map(([id, status]) => [collectionKeyFor(id), status]))
  if (typeof window === 'undefined') return initial
  try {
    const stored = JSON.parse(window.localStorage.getItem('watchlist-collection') || '{}') as Record<string, Status>
    return { ...initial, ...Object.fromEntries(Object.entries(stored).map(([id, status]) => [collectionKeyFor(id), status])) }
  } catch { return initial }
}

export const useCollection = create<CollectionStore>((set, get) => ({
  collection: loadCollection(),
  libraryMovies: Object.fromEntries(movies.map((movie) => [collectionKeyFor(movie.id), movie])),
  hydrate: async (token) => {
    if (!token) {
      set({ collection: loadCollection(), libraryMovies: Object.fromEntries(movies.map((movie) => [collectionKeyFor(movie.id), movie])) })
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
    }
  },
  setStatus: async (id, status, movie) => {
    const key = collectionKeyFor(id)
    const previous = get().collection[key]
    const collection = { ...get().collection }
    if (status) collection[key] = status
    else delete collection[key]
    set({ collection })
    if (movie && status) set((state) => ({ libraryMovies: { ...state.libraryMovies, [key]: movie } }))
    if (!status) set((state) => {
      const libraryMovies = { ...state.libraryMovies }
      if (!movies.some((sample) => collectionKeyFor(sample.id) === key)) delete libraryMovies[key]
      return { libraryMovies }
    })
    if (typeof window !== 'undefined') window.localStorage.setItem('watchlist-collection', JSON.stringify(collection))

    const token = useAuth.getState().accessToken
    const tmdbId = tmdbIdFor(id)
    if (!token || !tmdbId) return
    try {
      await libraryApi.setStatus(token, tmdbId, status, previous)
    } catch (error) {
      const rollback = { ...get().collection }
      const libraryMovies = { ...get().libraryMovies }
      if (previous) rollback[key] = previous
      else delete rollback[key]
      if (!previous && !movies.some((sample) => collectionKeyFor(sample.id) === key)) delete libraryMovies[key]
      set({ collection: rollback, libraryMovies })
      if (typeof window !== 'undefined') window.localStorage.setItem('watchlist-collection', JSON.stringify(rollback))
      console.error('Could not update the API library.', error)
      window.dispatchEvent(new CustomEvent('api-error', { detail: error instanceof Error ? error.message : 'Could not update library.' }))
    }
  },
}))
