/** TMDB IDs for the seeded sample catalog, allowing the same cards to use API-backed detail/library calls. */
const sampleIds: Record<string, number> = {
  dune: 693134,
  past: 666277,
  poor: 792307,
  arrival: 329865,
  parasite: 496243,
  her: 152601,
  moonlight: 376867,
  grand: 120467,
  interstellar: 157336,
  whiplash: 244786,
}

export function tmdbIdFor(id: string): number | null {
  const numericId = Number(id)
  if (Number.isSafeInteger(numericId) && numericId > 0) return numericId
  return sampleIds[id] ?? null
}

export function collectionKeyFor(id: string): string {
  return String(tmdbIdFor(id) ?? id)
}

export function movieRouteId(id: string): string {
  return String(tmdbIdFor(id) ?? id)
}
