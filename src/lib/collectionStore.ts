import { create } from 'zustand'
import type { Status } from '../types/movie'

type CollectionStore = {
  collection: Record<string, Status>
  setStatus: (id: string, status: Status | null) => void
}

const initialCollection: Record<string, Status> = {
  past: 'watched', arrival: 'watched', her: 'watched', moonlight: 'watched',
  grand: 'planned', interstellar: 'planned', whiplash: 'planned',
}

function loadCollection(): Record<string, Status> {
  if (typeof window === 'undefined') return initialCollection
  try {
    return JSON.parse(window.localStorage.getItem('watchlist-collection') || JSON.stringify(initialCollection))
  } catch {
    return initialCollection
  }
}

export const useCollection = create<CollectionStore>((set) => ({
  collection: loadCollection(),
  setStatus: (id, status) => set((state) => {
    const collection = { ...state.collection }
    if (status) collection[id] = status
    else delete collection[id]
    if (typeof window !== 'undefined') window.localStorage.setItem('watchlist-collection', JSON.stringify(collection))
    return { collection }
  }),
}))
