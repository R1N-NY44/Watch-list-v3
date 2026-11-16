/** Section membership stays explicit; IDs are resolved against the movie repository. */
export const discoveryMovieIds = {
  heroPosterRail: ['dune', 'past', 'poor', 'arrival', 'parasite', 'her', 'moonlight', 'dune', 'past', 'poor', 'arrival', 'parasite', 'her', 'moonlight'],
  carousel: ['dune', 'past', 'poor', 'arrival', 'parasite'],
  forYou: ['dune', 'past', 'poor', 'arrival', 'parasite', 'her', 'moonlight', 'grand'],
  trending: ['whiplash', 'interstellar', 'grand', 'moonlight', 'her', 'parasite', 'arrival', 'poor'],
  hiddenGems: ['past', 'moonlight', 'her', 'arrival', 'grand', 'parasite', 'poor', 'whiplash'],
} as const

export function resolveSection<T extends { id: string }>(ids: readonly string[], catalog: readonly T[]): T[] {
  const byId = new Map(catalog.map((item) => [item.id, item]))
  return ids.flatMap((id) => {
    const item = byId.get(id)
    return item ? [item] : []
  })
}
