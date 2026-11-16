# Frontend API integration

## Current setup

The frontend talks to the deployed Movie Platform Lite API through `src/services/apiClient.ts`.
Set `VITE_API_BASE_URL` to the API prefix, for example:

```env
VITE_API_BASE_URL=https://watch-api.noext.cyou/api/v1
```

If the variable is omitted, the frontend uses that deployed URL. For local backend development,
set it to `http://localhost:3000/api/v1` (or the local HTTPS URL in the supplied OpenAPI file).
Restart Vite after changing the environment file.

All responses are read from the API envelope's `data` field. `apiClient.ts` includes cookies
for refresh sessions, adds JSON headers, attaches bearer access tokens, and turns error
responses into `ApiError` values.

## Endpoint mapping

| Frontend feature | Backend endpoint | Auth |
| --- | --- | --- |
| Spotlight and Discover search | `GET /movies/search?query=...&page=1` | Public |
| Movie detail | `GET /movies/{tmdbId}` | Public |
| Trending section | `GET /recommendations/most-watched` | Public |
| Sign in | `POST /auth/login` | Public; sets refresh cookie |
| Create account | `POST /auth/register` | Public |
| Restore session | `POST /auth/refresh`, then `GET /auth/current-user` | Refresh cookie, then bearer |
| Sign out | `POST /auth/logout` | Refresh cookie |
| Load/add/update/remove collection | `GET/POST /library`, `PATCH/DELETE /library/{tmdbId}` | Bearer |
| View profile and profile movies | `GET /profiles/{publicId}` and `/movies` | Bearer |

For request/response fields and status codes, see the backend's
[`docs/openapi.yaml`](https://github.com/itsrmdhnaz/WatchList_Backend/blob/master/docs/openapi.yaml).

## Data normalization

`src/services/movieApi.ts` is the adapter between API DTOs and the UI's `Movie`/`MovieDetail` types.

- API `tmdbId` numbers become string IDs in the UI.
- `releaseDate` supplies the display year.
- `voteAverage` becomes the UI's string rating.
- `posterPath` and `backdropPath` become full TMDB image URLs.
- Detail `gallery.backdrops` and `gallery.posters` become the UI gallery array.
- Detail `productionCompanies` objects become company-name strings.
- Nullable cast values are filtered or converted to safe display values.
- Similar movie previews are normalized for the detail page.
- Backend `plan_to_watch` maps to the frontend's `planned` status and back.

Discover cards, search results, hero selections, and movie detail pages all use API movie IDs.
The hero displays the first five picks from the For You API-derived selection. For You is
shuffled from the recommendation response; Trending keeps the backend order; Hidden Gems sorts
that same API response by lower vote count. There is no bundled sample movie catalog or local
fallback: API errors are shown in the relevant section.

## Authentication and collection behavior

The access token is held in memory by `src/lib/authStore.ts`; it is not placed in localStorage.
On app startup the frontend attempts cookie-based refresh, then loads the current user. API
requests include credentials so the browser can send the HttpOnly refresh cookie. A 401 on an
authenticated request attempts one refresh and retries once.

Library actions are optimistic. A failed API update rolls back the visible collection and emits
an API error event. A guest action sends the user to sign in. The collection starts empty until
the server library is loaded; no collection or profile data is written to browser storage.

Registration enforces the backend's 15-character minimum password in the form. The profile API
currently exposes `publicId` and `displayName`, but does not provide a profile-update endpoint;
profile editing is unavailable until the backend offers one. The backend profile routes require
authentication, so a profile UUID link prompts guests to sign in.

## Deployment requirements

The backend must allow the deployed frontend's exact origin in `CORS_ORIGINS`, with credentials
enabled. For cross-site refresh cookies, production cookie settings must also be compatible with
the frontend's origin and HTTPS deployment. These are backend deployment settings and cannot be
verified or changed from this frontend repository.

The API root `/` is not a documented route. Use `/health` for a health check and `/api/v1/...`
for application calls.
