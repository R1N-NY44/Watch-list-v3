import { movies } from '../data/movie'
import type { MovieDetail } from '../types/movie'
import { movieApi } from './movieApi'
import { tmdbIdFor } from '../data/tmdbIds'

/** Central data boundary: remote API first, local sample catalog as a resilient fallback. */
export const movieRepository = {
  getAll(): MovieDetail[] {
    return movies
  },
  getById(id: string): MovieDetail | undefined {
    return movies.find((movie) => movie.id === id)
  },
  async getByIdAsync(id: string): Promise<MovieDetail | undefined> {
    const apiId = tmdbIdFor(id)
    if (apiId) {
      try { return await movieApi.getById(apiId) } catch (error) { console.warn('Using sample movie data after API detail request failed.', error) }
    }
    return movies.find((movie) => movie.id === id || String(tmdbIdFor(movie.id)) === id)
  },
  async search(query: string): Promise<MovieDetail[]> {
    try { return await movieApi.search(query) } catch (error) {
      console.warn('Using sample search results after API search failed.', error)
      const normalized = query.trim().toLocaleLowerCase()
      return movies.filter((movie) => `${movie.title} ${movie.originalTitle ?? ''} ${movie.year} ${movie.genre}`.toLocaleLowerCase().includes(normalized))
    }
  },
}
