import type { Movie, MovieDetail } from '../types/movie'
import type { MovieDetailDto, MovieSummaryDto } from '../types/api'
import { apiRequest } from './apiClient'

const imageUrl = (path: string | null | undefined) => path ? (path.startsWith('http') ? path : `https://image.tmdb.org/t/p/original${path}`) : ''
const yearOf = (date: string | null | undefined) => date ? Number(date.slice(0, 4)) || 0 : 0

export function mapMovieSummary(dto: MovieSummaryDto): Movie {
  return {
    id: String(dto.tmdbId), title: dto.title, year: yearOf(dto.releaseDate),
    genre: 'Film', rating: Number(dto.voteAverage || 0).toFixed(1), voteCount: dto.voteCount,
    poster: imageUrl(dto.posterPath), backdrop: imageUrl(dto.backdropPath),
    description: dto.overview || 'No synopsis is available yet.',
  }
}

export function mapMovieDetail(dto: MovieDetailDto): MovieDetail {
  const base = mapMovieSummary({
    tmdbId: dto.tmdbId, title: dto.title, overview: dto.description ?? dto.overview ?? null,
    releaseDate: dto.releaseDate ?? null, posterPath: dto.posterPath ?? dto.poster ?? null, backdropPath: dto.backdropPath ?? dto.backdrop ?? null,
    voteAverage: dto.rating ?? dto.voteAverage ?? 0, voteCount: dto.voteCount ?? 0,
  })
  const gallery = dto.gallery
    ? [...(dto.gallery.backdrops ?? []), ...(dto.gallery.posters ?? [])].map((path) => imageUrl(path)).filter(Boolean)
    : []
  return {
    ...base, year: dto.year ?? base.year, genre: dto.genre || 'Film', originalTitle: dto.originalTitle || undefined, tagline: dto.tagline || undefined,
    runtime: dto.runtime || undefined, releaseDate: dto.releaseDate || undefined,
    originalLanguage: dto.originalLanguage || undefined, country: dto.country ?? [],
    director: dto.director || undefined, writers: dto.writers ?? [], producers: dto.producers ?? [],
    cinematographer: dto.cinematographer || undefined,
    productionCompanies: (dto.productionCompanies ?? []).map((company) => typeof company === 'string' ? company : company.name),
    budget: dto.budget || undefined, revenue: dto.revenue || undefined,
    cast: (dto.cast ?? []).filter((member) => member.name).map((member, index) => ({
      id: String(member.id ?? index), name: member.name!, character: member.character || '', profileUrl: member.profileUrl || '',
    })),
    gallery: gallery.length ? gallery : [base.backdrop, base.poster].filter(Boolean),
    similarMovieIds: dto.similarMovieIds?.map(String),
    similarMovies: dto.similarMovies?.map((item) => ({ ...base, id: String(item.id), title: item.title, poster: item.poster || '' })),
  } as MovieDetail
}

export const movieApi = {
  async search(query: string, page = 1): Promise<Movie[]> {
    const params = new URLSearchParams({ query, page: String(page) })
    const response = await apiRequest<MovieSummaryDto[]>(`/movies/search?${params}`)
    return response.data.map(mapMovieSummary)
  },
  async getById(tmdbId: number): Promise<MovieDetail> {
    const response = await apiRequest<MovieDetailDto>(`/movies/${tmdbId}`)
    return mapMovieDetail(response.data)
  },
}
