// Non-API presentation defaults. These are deliberately kept separate from
// account and collection data so the UI remains ready for profile API fields.
const unsplashPhoto = (id: string, width: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`

export const defaultProfileAvatar = unsplashPhoto('photo-1534528741775-53994a69daeb', 240)
export const defaultProfileBanner = 'https://i.pinimg.com/originals/1e/a6/66/1ea66601f1ee09b578c40feee6ecd953.gif'
// export const defaultProfileBanner = unsplashPhoto('photo-1519608487953-e999c86e7455', 1600)
