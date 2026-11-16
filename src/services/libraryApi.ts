import type { ApiCollectionStatus, LibraryMovieDto } from '../types/api'
import { fromApiStatus, toApiStatus } from '../types/api'
import type { Status } from '../types/movie'
import { authorizedRequest } from './authorizedRequest'
import { mapMovieSummary } from './movieApi'

export const libraryApi = {
  async list(token: string): Promise<Array<{ movieId: string; status: Status; movie: ReturnType<typeof mapMovieSummary> }>> {
    const entries: LibraryMovieDto[] = []
    let totalPages = 1
    for (let page = 1; page <= totalPages; page += 1) {
      const response = await authorizedRequest<LibraryMovieDto[]>(`/library?page=${page}&limit=50`, {}, token)
      entries.push(...response.data)
      totalPages = Number(response.meta?.totalPages) || 1
    }
    return entries.map((entry) => ({ movieId: String(entry.tmdbId), status: fromApiStatus(entry.status), movie: mapMovieSummary(entry) }))
  },
  async setStatus(token: string, tmdbId: number, status: Status | null, previous?: Status): Promise<void> {
    if (status === null) {
      await authorizedRequest(`/library/${tmdbId}`, { method: 'DELETE' }, token)
      return
    }
    const apiStatus: ApiCollectionStatus = toApiStatus(status)
    if (previous) {
      await authorizedRequest(`/library/${tmdbId}`, { method: 'PATCH', body: JSON.stringify({ status: apiStatus }) }, token)
    } else {
      await authorizedRequest('/library', { method: 'POST', body: JSON.stringify({ tmdbId, status: apiStatus, visibility: 'public' }) }, token)
    }
  },
}
