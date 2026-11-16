import type { Movie, MovieDetail } from '../types/movie'
import { movieApi } from './movieApi'

/** API-only catalog boundary used by discovery, search, and detail routes. */
export const movieRepository = {
  search(query: string, page = 1): Promise<Movie[]> {
    return movieApi.search(query, page)
  },
  getById(tmdbId: string | number): Promise<MovieDetail> {
    const numericId = Number(tmdbId)
    if (!Number.isSafeInteger(numericId) || numericId <= 0) {
      return Promise.reject(new Error('This movie does not have a valid TMDB ID.'))
    }
    return movieApi.getById(numericId)
  },
}
