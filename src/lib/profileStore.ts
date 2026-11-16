import { useState } from 'react'
import { photo } from '../data'
import type { Profile } from '../types/movie'

export const initialProfile: Profile = {
  name: 'Alex Morgan',
  username: 'alexmorgan',
  bio: 'Collecting stories that stay with you. Usually somewhere between sci-fi and slow cinema.',
  isPublic: true,
  avatar: 'https://placewaifu.com/image/200',
  // avatar: 'https://i.pravatar.cc/300',
  // avatar: photo('photo-1534528741775-53994a69daeb', 240),
  cover: photo('photo-1519608487953-e999c86e7455', 1600),
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(() => {
    if (typeof window === 'undefined') return initialProfile
    try {
      return { ...initialProfile, ...JSON.parse(window.localStorage.getItem('watchlist-profile') || '{}') }
    } catch {
      return initialProfile
    }
  })

  const update = (next: Profile) => {
    setProfile(next)
    if (typeof window !== 'undefined') window.localStorage.setItem('watchlist-profile', JSON.stringify(next))
  }

  return { profile, update }
}
