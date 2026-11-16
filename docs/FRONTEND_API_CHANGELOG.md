# Frontend API change history

## 2026-11-17 — API-only Discover and collection state

### Discover and hero

- Removed the bundled sample movie catalog from the active frontend and deleted its data modules.
- Loaded the Discover pool from `GET /api/v1/recommendations/most-watched`.
- Shuffled the API pool for For You; selecting For You or pressing Shuffle produces a new order.
- Made the hero carousel exactly the first five items in the current For You selection.
- Reused For You items for the two decorative poster-rail tracks.
- Kept Trending in backend recommendation order and derived Hidden Gems by lower TMDB vote count.
- Added loading, empty, and API error states for discovery and search.

### API-only browsing and profile

- Removed local movie-detail and search fallbacks. Search and detail now report API errors instead.
- Removed localStorage collection/profile stores and the local profile editor, since the backend has
  no profile-update endpoint.
- Collection state now starts empty, loads from `/library`, and persists mutations through the API.
- Guests are sent to sign in when they try to save a movie or open a profile.
- Profile pages now load profile data and visible movies using the authenticated profile endpoints.
- Deleted obsolete sample data, discovery ID lists, sample TMDB mappings, and the local profile modal/store.

## API integration foundation

- Added a shared API client, DTO adapters, auth bootstrap and refresh, login/register pages, library
  operations, profile queries, and recommendation queries.
- Configured `VITE_API_BASE_URL` with the deployed API as its default and documented local override.
- Documented endpoint mapping, field normalization, auth lifecycle, and the backend CORS requirement
  in [`API_INTEGRATION.md`](./API_INTEGRATION.md).

## Verification

- `npm run build` completed successfully after these changes.
- `git diff --check` completed without whitespace errors.
- Authentication and library mutations still require a real test account for end-to-end verification.
