import { movies } from '../data/movie'
import type { MovieDetail } from '../types/movie'

/** Central data boundary: replace this sample implementation with API calls later. */
export const movieRepository = {
  getAll(): MovieDetail[] {
    return movies
  },
  getById(id: string): MovieDetail | undefined {
    return movies.find((movie) => movie.id === id)
  },
}
