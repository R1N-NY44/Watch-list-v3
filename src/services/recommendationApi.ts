import type { Movie } from '../types/movie'
import type { MovieSummaryDto } from '../types/api'
import { apiRequest } from './apiClient'
import { mapMovieSummary } from './movieApi'

export async function getMostWatched(): Promise<Movie[]> {
  const response = await apiRequest<MovieSummaryDto[]>('/recommendations/most-watched')
  return response.data.map(mapMovieSummary)
}
