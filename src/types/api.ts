import type { MovieDetail, Status } from './movie'

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  meta?: Record<string, unknown>
}

export interface ApiUser {
  publicId: string
  email: string
  displayName: string
}

export interface MovieSummaryDto {
  tmdbId: number
  title: string
  overview: string | null
  releaseDate: string | null
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  voteCount: number
  status?: 'watched' | 'plan_to_watch'
  visibility?: 'public' | 'private'
}

export interface MovieDetailDto {
  id: number
  tmdbId: number
  title: string
  originalTitle?: string | null
  year?: number | null
  genre?: string | null
  rating: number
  poster?: string | null
  backdrop?: string | null
  description?: string | null
  tagline?: string | null
  runtime?: number | null
  releaseDate?: string | null
  originalLanguage?: string | null
  country?: string[]
  director?: string | null
  writers?: string[]
  producers?: string[]
  cinematographer?: string | null
  budget?: number | null
  revenue?: number | null
  cast?: Array<{ id: number | null; name: string | null; character: string | null; profileUrl: string | null }>
  productionCompanies?: Array<{ id: number; name: string; logoPath: string | null }>
  gallery?: { posters?: string[]; backdrops?: string[]; logos?: string[] }
  similarMovieIds?: number[]
  similarMovies?: Array<{ id: number; title: string; poster: string | null }>
  voteAverage?: number
  voteCount?: number
  overview?: string | null
  posterPath?: string | null
  backdropPath?: string | null
}

export interface LibraryMovieDto extends MovieSummaryDto {
  status: 'watched' | 'plan_to_watch'
  visibility?: 'public' | 'private'
  createdAt?: string
}

export interface AuthSession {
  user: ApiUser
  accessToken: string
}

export type ApiCollectionStatus = 'watched' | 'plan_to_watch'
export const fromApiStatus = (status: ApiCollectionStatus): Status => status === 'plan_to_watch' ? 'planned' : 'watched'
export const toApiStatus = (status: Status): ApiCollectionStatus => status === 'planned' ? 'plan_to_watch' : 'watched'
