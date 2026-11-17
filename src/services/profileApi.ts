import type { ApiEnvelope, LibraryMovieDto } from '../types/api'
import { fromApiStatus } from '../types/api'
import { authorizedRequest } from './authorizedRequest'
import { mapMovieSummary } from './movieApi'

export const profileApi = {
  async get(token: string, publicId: string): Promise<{ publicId: string; displayName: string; visibility: 'public' | 'private' }> {
    const response = await authorizedRequest<{ publicId: string; displayName: string; visibility: 'public' | 'private' }>(`/profiles/${publicId}`, {}, token)
    return response.data
  },
  async toggleVisibility(token: string, publicId: string): Promise<void> {
    await authorizedRequest(`/profiles/${publicId}/visibility`, { method: 'PATCH' }, token)
  },
  async listMovies(token: string, publicId: string, status?: 'watched' | 'plan_to_watch') {
    const entries: LibraryMovieDto[] = []
    let totalPages = 1
    for (let page = 1; page <= totalPages; page += 1) {
      const params = new URLSearchParams({ limit: '50', page: String(page) })
      if (status) params.set('status', status)
      const response: ApiEnvelope<LibraryMovieDto[]> = await authorizedRequest(`/profiles/${publicId}/movies?${params}`, {}, token)
      entries.push(...response.data)
      totalPages = Number(response.meta?.totalPages) || 1
    }
    return entries.map((entry) => ({ movie: mapMovieSummary(entry), status: fromApiStatus(entry.status) }))
  },
}
