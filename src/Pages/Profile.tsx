import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Film, Globe2, Share2 } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MovieCard from '../components/MovieCard'
import { useAuth } from '../lib/authStore'
import { useCollection } from '../lib/collectionStore'
import { profileApi } from '../services/profileApi'
import type { Movie, Status } from '../types/movie'
import { defaultProfileAvatar, defaultProfileBanner } from '../data/profileAppearance'

type ProfileMovie = { movie: Movie; status: Status }

export default function Profile() {
  const navigate = useNavigate()
  const { publicId = '' } = useParams()
  const { user, accessToken, initialized } = useAuth()
  const { collection, setStatus } = useCollection()
  const [name, setName] = useState('')
  const [entries, setEntries] = useState<ProfileMovie[]>([])
  const [tab, setTab] = useState<Status>('watched')
  const [sort, setSort] = useState('Recently added')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const isOwner = user?.publicId === publicId

  useEffect(() => {
    if (!initialized) return
    if (!accessToken) {
      navigate('/login', { replace: true })
      return
    }
    let active = true
    setLoading(true)
    setError('')
    void Promise.all([profileApi.get(accessToken, publicId), profileApi.listMovies(accessToken, publicId)])
      .then(([profile, movies]) => {
        if (!active) return
        setName(profile.displayName)
        setEntries(movies)
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Could not load this profile.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [accessToken, initialized, navigate, publicId])

  const visibleEntries = entries.filter((entry) => entry.status === tab)
  const sorted = useMemo(() => [...visibleEntries].sort((a, b) =>
    sort === 'Title A–Z' ? a.movie.title.localeCompare(b.movie.title)
      : sort === 'Release year' ? b.movie.year - a.movie.year
        : sort === 'Highest rated' ? Number(b.movie.rating) - Number(a.movie.rating)
          : 0,
  ), [visibleEntries, sort])
  const watchedCount = entries.filter((entry) => entry.status === 'watched').length
  const plannedCount = entries.filter((entry) => entry.status === 'planned').length

  const share = async () => {
    const url = `${location.origin}/u/${publicId}`
    try { await navigator.clipboard.writeText(url) }
    catch {
      const field = document.createElement('textarea')
      field.value = url
      document.body.append(field)
      field.select()
      document.execCommand('copy')
      field.remove()
    }
    setToast('Profile link copied')
    window.setTimeout(() => setToast(''), 2400)
  }

  return <div className="app-shell">
    <Header />
    <main className="profile-page">
      <button className="back-link" onClick={() => navigate('/')}><ArrowLeft size={15} /> Back to discovery</button>
      <section className="profile-cover api-profile-cover" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,9,13,.72), rgba(8,9,13,.08)), url("${defaultProfileBanner}")` }}><span className="cover-label">A PERSONAL FILM ARCHIVE</span></section>
      <section className="profile-intro">
        <img className="profile-avatar api-profile-avatar" src={defaultProfileAvatar} alt="" />
        <div className="profile-identity"><div className="identity-top"><h1>{name || 'Film archive'}</h1><span className="public-tag"><Globe2 size={12} /> API PROFILE</span></div><span className="username">MEMBER ID · {publicId.slice(0, 8)}</span><p>{isOwner ? 'Your collection, synced with the Watch List API.' : 'A film collection shared through Watch List.'}</p><span className="joined">WATCH LIST MEMBER</span></div>
        <div className="profile-actions"><button className="button button-outline" onClick={share}><Share2 size={15} /> Share profile</button></div>
      </section>
      {loading || !initialized ? <div className="empty-state"><Film size={26} /><b>Loading profile from the API…</b></div> : error ? <div className="private-state"><div className="lock-icon"><Film size={23} /></div><span className="eyebrow muted">PROFILE / API</span><h2>Could not load this profile.</h2><p>{error}</p><button className="text-link" onClick={() => window.location.reload()}>Try again <ArrowRight size={15} /></button></div> : <>
        <div className="profile-stats"><div><strong>{String(watchedCount).padStart(2, '0')}</strong><span>FILMS WATCHED</span></div><div><strong>{String(plannedCount).padStart(2, '0')}</strong><span>ON THE WATCHLIST</span></div><div className="stats-note">“Some films don&apos;t end<br />when the credits roll.”</div></div>
        <section className="profile-library"><div className="library-header"><div className="profile-tabs"><button className={tab === 'watched' ? 'profile-tab active' : 'profile-tab'} onClick={() => setTab('watched')}>Watched <span>{watchedCount}</span></button><button className={tab === 'planned' ? 'profile-tab active' : 'profile-tab'} onClick={() => setTab('planned')}>Plan to watch <span>{plannedCount}</span></button></div><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort films"><option>Recently added</option><option>Title A–Z</option><option>Release year</option><option>Highest rated</option></select></div>
          {sorted.length ? <div className="poster-grid">{sorted.map(({ movie }) => <MovieCard key={movie.id} movie={movie} status={collection[movie.id]} onSelect={(selected) => navigate(`/movie/${selected.id}`)} onAdd={(id, next, selected) => { void setStatus(id, collection[id] === next ? null : next, selected) }} />)}</div> : <div className="empty-state"><Film size={26} /><b>No films here just yet</b><span>{isOwner ? 'Add films from Discover to see them in your archive.' : 'This profile has no films in this section.'}</span><Link to="/" className="text-link">Explore films <ArrowRight size={15} /></Link></div>}
        </section>
      </>}
    </main>
    <Footer />
    <AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Check size={15} />{toast}</motion.div>}</AnimatePresence>
  </div>
}
