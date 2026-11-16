export type Status = 'watched' | 'planned'

export interface CastMember {
  id: string
  name: string
  character: string
  profileUrl: string
}

export interface Movie {
  id: string
  title: string
  year: number
  genre: string
  rating: string
  poster: string
  backdrop: string
  description: string
}

export interface MovieDetail extends Movie {
  originalTitle?: string
  tagline?: string
  releaseDate?: string
  runtime?: number
  ageRating?: string
  originalLanguage?: string
  country?: string[]
  director?: string
  writers?: string[]
  producers?: string[]
  cinematographer?: string
  productionCompanies?: string[]
  budget?: number
  revenue?: number
  officialWebsite?: string
  cast?: CastMember[]
  gallery?: string[]
  similarMovieIds?: string[]
  similarMovies?: Movie[]
}

export interface Profile {
  name: string
  username: string
  bio: string
  isPublic: boolean
  avatar: string
  cover: string
}
