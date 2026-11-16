import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Globe2, Plus, Share2, Star, X } from 'lucide-react'
import type { MovieDetail, Status } from '../types/movie'

type MovieDetailPageProps = {
  movie?: MovieDetail
  movies: MovieDetail[]
  status?: Status
  onSetStatus: (id: string, status: Status | null) => void
}

export default function MovieDetailPage({ movie, movies, status, onSetStatus }: MovieDetailPageProps) {
  const navigate = useNavigate()
  const [activeImage, setActiveImage] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    if (!movie) return
    document.title = `${movie.title} — Watch List`
    return () => { document.title = 'Watch List — Your cinematic archive' }
  }, [movie])

  const recommendations = useMemo(() => {
    if (!movie) return []
    const preferred = movie.similarMovieIds?.map((id) => movies.find((item) => item.id === id)).filter((item): item is MovieDetail => Boolean(item)) ?? []
    const genres = movie.genre.toLowerCase().split(' · ').filter(Boolean)
    const byGenre = movies.filter((item) => item.id !== movie.id && item.genre.toLowerCase().split(' · ').some((genre) => genres.includes(genre)))
    return [...preferred, ...byGenre.filter((item) => !preferred.some((match) => match.id === item.id))].slice(0, 4)
  }, [movie, movies])

  if (!movie) {
    return <main className="detail-not-found"><span className="eyebrow">THE ARCHIVE / 404</span><h1>This film slipped<br /><em>out of frame.</em></h1><Link className="button button-light" to="/">Return to the archive <ArrowRight size={16} /></Link></main>
  }

  const gallery = movie.gallery?.length ? movie.gallery : [movie.backdrop, movie.poster]
  const changeStatus = (next: Status) => {
    const nextStatus = status === next ? null : next
    onSetStatus(movie.id, nextStatus)
    setToast(nextStatus === 'watched' ? 'Added to watched' : nextStatus === 'planned' ? 'Added to plan to watch' : 'Removed from collection')
  }
  const shareMovie = async () => {
    const url = `${window.location.origin}/movie/${movie.id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const field = document.createElement('textarea')
      field.value = url
      field.setAttribute('readonly', '')
      field.style.position = 'absolute'
      field.style.left = '-9999px'
      document.body.append(field)
      field.select()
      document.execCommand('copy')
      field.remove()
    }
    setToast('Movie link copied')
  }

  return (
    <main className="movie-detail-page">
      <button className="detail-back" onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}><ArrowLeft size={15} /> Back to discovery</button>
      <MovieHero movie={movie} status={status} onStatusChange={changeStatus} onShare={shareMovie} />
      <div className="detail-content">
        <div className="detail-primary-column">
          <MovieOverview movie={movie} />
          <CastCarousel cast={movie.cast ?? []} />
          <MovieGallery images={gallery} title={movie.title} onOpen={setActiveImage} />
        </div>
        <aside className="detail-side-column"><MovieMetadata movie={movie} /><MovieFacts movie={movie} /></aside>
      </div>
      {recommendations.length > 0 && <SimilarMovies movies={recommendations} />}
      <AnimatePresence>{activeImage !== null && <ImageLightbox images={gallery} initialIndex={activeImage} title={movie.title} onClose={() => setActiveImage(null)} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast detail-toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><Check size={15} />{toast}</motion.div>}</AnimatePresence>
    </main>
  )
}

function MovieHero({ movie, status, onStatusChange, onShare }: { movie: MovieDetail; status?: Status; onStatusChange: (status: Status) => void; onShare: () => void }) {
  return (
    <section className="detail-hero">
      <div className="detail-hero-image" style={{ backgroundImage: `url(${movie.backdrop})` }} />
      <div className="detail-hero-wash" />
      <div className="detail-hero-inner">
        <div className="detail-poster-wrap"><img src={movie.poster} alt={`${movie.title} poster`} /><span className="poster-index">WATCH LIST / FILM FILE</span></div>
        <div className="detail-hero-copy">
          <span className="eyebrow detail-eyebrow">A FILM TO KEEP <span>—</span> {movie.year}</span>
          {movie.originalTitle && movie.originalTitle !== movie.title && <p className="original-title">{movie.originalTitle}</p>}
          <h1>{movie.title}</h1>
          {movie.tagline && <p className="detail-tagline">“{movie.tagline}”</p>}
          <div className="detail-meta-row"><span className="detail-rating"><Star size={14} fill="currentColor" /> {movie.rating}<small> / 10</small></span><i />{movie.year}<i />{movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null}<i />{movie.ageRating}<i />{movie.genre}</div>
          <p className="detail-hero-summary">{movie.description}</p>
          <MovieCollectionActions status={status} onStatusChange={onStatusChange} />
          <button className="detail-share" onClick={onShare}><Share2 size={15} /> Share movie <span>·</span> copy link</button>
        </div>
      </div>
      <span className="detail-hero-caption">FRAME NO. {String(movie.year).slice(-2)} / THE CINEMATIC ARCHIVE</span>
    </section>
  )
}

function MovieCollectionActions({ status, onStatusChange }: { status?: Status; onStatusChange: (status: Status) => void }) {
  return (
    <div className="detail-actions">
      <button className={`button ${status === 'watched' ? 'button-light is-current' : 'button-light'}`} onClick={() => onStatusChange('watched')} aria-pressed={status === 'watched'}>{status === 'watched' ? <Check size={16} /> : <Plus size={16} />}{status === 'watched' ? 'Watched' : 'Add to Watched'}</button>
      <button className={`button ${status === 'planned' ? 'button-outline is-current' : 'button-outline'}`} onClick={() => onStatusChange('planned')} aria-pressed={status === 'planned'}>{status === 'planned' ? <Check size={16} /> : <Bookmark size={15} />}{status === 'planned' ? 'On your list' : 'Plan to Watch'}</button>
      {status && <span className="collection-status"><span /> IN YOUR {status === 'watched' ? 'WATCHED' : 'PLAN TO WATCH'} LIST</span>}
      {status && <span className="collection-remove-hint">Select the active status to remove</span>}
    </div>
  )
}

function MovieOverview({ movie }: { movie: MovieDetail }) {
  return (
    <section className="detail-section overview-section">
      <div className="detail-section-heading"><span className="eyebrow">01 / THE STORY</span><h2>A world worth <em>stepping into.</em></h2></div>
      <p className="full-synopsis">{movie.description} {movie.tagline ? `“${movie.tagline}”` : ''}</p>
      <div className="overview-chip-row">{movie.genre.split(' · ').map((genre) => <span className="overview-chip" key={genre}>{genre}</span>)}</div>
      <div className="overview-note"><span className="note-mark">“</span><p>{movie.tagline || 'Some stories find their way into your own.'}</p><span className="eyebrow">A NOTE FROM THE FILM</span></div>
    </section>
  )
}

function MovieMetadata({ movie }: { movie: MovieDetail }) {
  const rows = [
    { icon: CalendarDays, label: 'Release date', value: movie.releaseDate ? new Date(`${movie.releaseDate}T12:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : `${movie.year}` },
    { icon: Clock3, label: 'Runtime', value: movie.runtime ? `${movie.runtime} minutes` : undefined },
    { icon: Globe2, label: 'Language', value: movie.originalLanguage },
    { icon: null, label: 'Country', value: movie.country?.join(', ') },
  ].filter((row) => row.value)
  return <section className="detail-section metadata-section"><div className="detail-section-heading"><span className="eyebrow">AT A GLANCE</span><h2>Film <em>metadata.</em></h2></div><dl className="metadata-list">{rows.map(({ icon: Icon, label, value }) => <div className="metadata-row" key={label}><dt>{Icon && <Icon size={14} />}{label}</dt><dd>{value}</dd></div>)}</dl></section>
}

function MovieFacts({ movie }: { movie: MovieDetail }) {
  const facts = [
    { label: 'Director', values: movie.director ? [movie.director] : undefined },
    { label: 'Writers', values: movie.writers },
    { label: 'Producers', values: movie.producers },
    { label: 'Cinematography', values: movie.cinematographer ? [movie.cinematographer] : undefined },
    { label: 'Production', values: movie.productionCompanies },
    { label: 'Budget', values: movie.budget ? [formatCurrency(movie.budget)] : undefined },
    { label: 'Box office', values: movie.revenue ? [formatCurrency(movie.revenue)] : undefined },
  ].filter((fact) => fact.values?.length)
  return <section className="detail-section facts-section"><div className="detail-section-heading"><span className="eyebrow">THE PEOPLE & THE CRAFT</span><h2>Credits & <em>facts.</em></h2></div><dl className="facts-list">{facts.map(({ label, values }) => <div className="facts-row" key={label}><dt>{label}</dt><dd>{values?.join(', ')}</dd></div>)}</dl></section>
}

function CastCarousel({ cast }: { cast: NonNullable<MovieDetail['cast']> }) {
  if (!cast.length) return null
  return <section className="detail-section cast-section"><div className="detail-section-heading cast-heading"><div><span className="eyebrow">02 / THE PEOPLE</span><h2>Faces in the <em>frame.</em></h2></div><span className="cast-count">CAST / {String(cast.length).padStart(2, '0')}</span></div><div className="cast-track">{cast.map((member, index) => <article className="cast-card" key={member.id}><div className="cast-image-wrap"><img src={member.profileUrl} alt={`${member.name}`} loading="lazy" /><span>0{index + 1}</span></div><strong>{member.name}</strong><small>{member.character}</small></article>)}</div></section>
}

function MovieGallery({ images, title, onOpen }: { images: string[]; title: string; onOpen: (index: number) => void }) {
  return <section className="detail-section gallery-section"><div className="detail-section-heading gallery-heading"><div><span className="eyebrow">03 / VISUAL NOTES</span><h2>Scenes that <em>stay.</em></h2></div><span className="gallery-count">{String(images.length).padStart(2, '0')} FRAMES</span></div><div className="detail-gallery">{images.slice(0, 5).map((image, index) => <button className={`gallery-image gallery-image-${index + 1}`} key={image} onClick={() => onOpen(index)} aria-label={`Open still ${index + 1} from ${title}`}><img src={image} alt={`${title} cinematic still ${index + 1}`} loading="lazy" /><span>VIEW FRAME <ArrowRight size={13} /></span></button>)}</div></section>
}

function ImageLightbox({ images, initialIndex, title, onClose }: { images: string[]; initialIndex: number; title: string; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex)
  const previous = () => setIndex((current) => (current - 1 + images.length) % images.length)
  const next = () => setIndex((current) => (current + 1) % images.length)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') previous()
      if (event.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow }
  }, [onClose])
  return <motion.div className="lightbox-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose} role="dialog" aria-modal="true" aria-label={`${title} gallery`}><button className="lightbox-close" onClick={onClose} aria-label="Close image viewer"><X size={20} /></button><button className="lightbox-arrow lightbox-previous" onClick={(event) => { event.stopPropagation(); previous() }} aria-label="Previous image"><ChevronLeft size={23} /></button><figure className="lightbox-figure" onMouseDown={(event) => event.stopPropagation()}><img src={images[index]} alt={`${title} still ${index + 1} of ${images.length}`} /><figcaption><span>{title.toUpperCase()}</span><span>{String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span></figcaption></figure><button className="lightbox-arrow lightbox-next" onClick={(event) => { event.stopPropagation(); next() }} aria-label="Next image"><ChevronRight size={23} /></button></motion.div>
}

function SimilarMovies({ movies }: { movies: MovieDetail[] }) {
  return <section className="similar-section"><div className="detail-section-heading similar-heading"><div><span className="eyebrow">04 / KEEP EXPLORING</span><h2>More like <em>this.</em></h2></div><span className="gallery-count">CURATED BY SHARED GENRES</span></div><div className="similar-grid">{movies.map((movie, index) => <Link className="similar-card" to={`/movie/${movie.id}`} key={movie.id}><div className="similar-image"><img src={movie.poster} alt={`${movie.title} poster`} loading="lazy" /><span className="similar-index">0{index + 1}</span><span className="similar-arrow"><ArrowRight size={16} /></span></div><span className="similar-title">{movie.title}</span><span className="similar-meta">{movie.year} <i /> {movie.genre.split(' · ')[0]}</span></Link>)}</div></section>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}
