import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDownRight, ArrowLeft, ArrowRight, Bookmark, Check, Clapperboard, Film, Plus, Search, Settings2, Shuffle, Sparkles, Star, X } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MovieCard from '../components/MovieCard'
import { useAuth } from '../lib/authStore'
import { useCollection } from '../lib/collectionStore'
import { movieRepository } from '../services/movieRepository'
import { getMostWatched } from '../services/recommendationApi'
import type { Movie, Status } from '../types/movie'

type DiscoverTab = 'For you' | 'Trending' | 'Hidden gems'

function uniqueMovies(items: Movie[]) {
  const seen = new Set<string>()
  return items.filter((movie) => {
    if (!movie.id || !movie.title || !movie.poster || seen.has(movie.id)) return false
    seen.add(movie.id)
    return true
  })
}

function shuffleMovies(items: Movie[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

export default function Home() {
  const navigate = useNavigate()
  const user = useAuth((state) => state.user)
  const { collection, setStatus } = useCollection()
  const reducedMotion = useReducedMotion()
  const [catalog, setCatalog] = useState<Movie[]>([])
  const [forYou, setForYou] = useState<Movie[]>([])
  const [trending, setTrending] = useState<Movie[]>([])
  const [hiddenGems, setHiddenGems] = useState<Movie[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [tab, setTab] = useState<DiscoverTab>('For you')
  const [filter, setFilter] = useState(false)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    let active = true
    void getMostWatched()
      .then((response) => {
        const movies = uniqueMovies(response)
        if (!active) return
        setCatalog(movies)
        setTrending(movies.slice(0, 8))
        setForYou(shuffleMovies(movies).slice(0, 8))
        const lowVisibility = movies.filter((movie) => (movie.voteCount ?? 0) > 0)
          .sort((a, b) => (a.voteCount ?? 0) - (b.voteCount ?? 0) || Number(b.rating) - Number(a.rating))
        const hidden = uniqueMovies([...lowVisibility, ...movies.filter((movie) => !lowVisibility.includes(movie))]).slice(0, 8)
        setHiddenGems(hidden)
        if (movies.length === 0) setCatalogError('The API did not return any discoverable films.')
      })
      .catch((error) => {
        if (active) setCatalogError(error instanceof Error ? error.message : 'Could not load films from the API.')
      })
      .finally(() => { if (active) setCatalogLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const term = query.trim()
    if (!term) {
      setSearchResults([])
      setSearching(false)
      setSearchError('')
      return
    }
    let active = true
    setSearching(true)
    setSearchError('')
    const timer = window.setTimeout(() => {
      void movieRepository.search(term)
        .then((results) => { if (active) setSearchResults(uniqueMovies(results)) })
        .catch((error) => { if (active) setSearchError(error instanceof Error ? error.message : 'Search is unavailable.') })
        .finally(() => { if (active) setSearching(false) })
    }, 280)
    return () => { active = false; window.clearTimeout(timer) }
  }, [query])

  const featuredMovies = useMemo(() => forYou.slice(0, 5), [forYou])
  const featuredMovie = featuredMovies[featuredIndex]
  const railMovies = forYou
  const sectionMovies = tab === 'Trending' ? trending : tab === 'Hidden gems' ? hiddenGems : forYou
  const displayMovies = useMemo(() => filter ? [...sectionMovies].sort((a, b) => Number(b.rating) - Number(a.rating)) : sectionMovies, [filter, sectionMovies])

  useEffect(() => {
    setFeaturedIndex(0)
  }, [forYou])

  useEffect(() => {
    if (reducedMotion || featuredMovies.length < 2) return
    const timer = window.setInterval(() => setFeaturedIndex((index) => (index + 1) % featuredMovies.length), 7000)
    return () => window.clearInterval(timer)
  }, [featuredMovies.length, reducedMotion])

  const flash = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2300)
  }
  const add = (id: string, next: Status, movie?: Movie) => {
    void setStatus(id, collection[id] === next ? null : next, movie)
    flash(collection[id] === next ? 'Removed from your collection' : next === 'watched' ? 'Added to watched' : 'Added to plan to watch')
  }
  const selectTab = (next: DiscoverTab) => {
    setTab(next)
    if (next === 'For you' && catalog.length) setForYou(shuffleMovies(catalog).slice(0, 8))
  }

  return (
    <div className="app-shell">
      <Header />
      <main>
        <section className="hero" aria-roledescription="carousel" aria-label="Featured films">
          {featuredMovie && <div className="hero-image" key={featuredMovie.id} style={{ backgroundImage: `url(${featuredMovie.backdrop || featuredMovie.poster})` }} />}
          <div className="hero-vignette" />
          <div className="hero-content" key={featuredMovie?.id ?? 'empty-hero'}>
            <div className="eyebrow"><span className="eyebrow-dot" /> FILM JOURNAL — FEATURED</div>
            <p className="hero-kicker">TONIGHT, ENTER ANOTHER WORLD</p>
            <h1>{featuredMovie?.title ?? (catalogLoading ? 'Finding your next film.' : 'The archive is waiting.')}</h1>
            <p className="hero-copy">{featuredMovie?.description ?? (catalogError || 'Fresh selections from the Watch List movie API.')}</p>
            <div className="hero-actions">
              {featuredMovie && <button className="button button-light" onClick={() => navigate(`/movie/${featuredMovie.id}`)}>Discover film <ArrowDownRight size={16} /></button>}
              {featuredMovie && <button className="button button-ghost" onClick={() => add(featuredMovie.id, 'planned', featuredMovie)}><Plus size={16} />{collection[featuredMovie.id] === 'planned' ? 'In your list' : 'Add to watchlist'}</button>}
            </div>
            {featuredMovie && <div className="hero-meta"><span><Star size={13} fill="currentColor" /> {featuredMovie.rating}</span><i /> {featuredMovie.year || '—'} <i /> {featuredMovie.genre}</div>}
          </div>
          {railMovies.length > 0 && <div className="hero-poster-rail" aria-hidden="true">
            {[{ items: railMovies, direction: 'rail-track-up' }, { items: [...railMovies].reverse(), direction: 'rail-track-down' }].map(({ items, direction }) => <div className="hero-poster-column" key={direction}><div className={`hero-poster-track ${direction}`}>
              {[0, 1].map((copy) => <div className="hero-poster-loop-set" aria-hidden={copy === 1 || undefined} key={copy}>{items.map((movie) => <img key={`${copy}-${movie.id}`} src={movie.poster} alt="" loading="lazy" />)}</div>)}
            </div></div>)}
          </div>}
          <div className="hero-caption"><div className="hero-controls"><button aria-label="Previous featured film" disabled={featuredMovies.length < 2} onClick={() => setFeaturedIndex((index) => (index - 1 + featuredMovies.length) % featuredMovies.length)}><ArrowLeft size={15} /></button><span>{String(featuredMovies.length ? featuredIndex + 1 : 0).padStart(2, '0')} / {String(featuredMovies.length).padStart(2, '0')}</span><button aria-label="Next featured film" disabled={featuredMovies.length < 2} onClick={() => setFeaturedIndex((index) => (index + 1) % featuredMovies.length)}><ArrowRight size={15} /></button></div><span>FEATURED / FOR YOU</span><div className="hero-lines">{featuredMovies.map((movie, index) => <button key={movie.id} aria-label={`Show ${movie.title}`} aria-current={featuredIndex === index ? 'true' : undefined} onClick={() => setFeaturedIndex(index)} />)}</div></div>
        </section>

        <section className="intro-row" id="discover"><div><div className="eyebrow muted">YOUR NEXT FAVORITE IS IN HERE</div><h2>A little more <em>cinema.</em></h2></div><p>Film picks served directly from the Watch List API.<br />No sample catalog. Just your next good watch.</p></section>
        <section className="discovery-wrap">
          <div className="discover-toolbar"><div className="tabs">{(['For you', 'Trending', 'Hidden gems'] as DiscoverTab[]).map((item) => <button key={item} className={tab === item ? 'tab active' : 'tab'} onClick={() => selectTab(item)}>{item}</button>)}</div><div className="toolbar-actions"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a film..." aria-label="Search movies" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}</label><button className={`filter-button ${filter ? 'filter-active' : ''}`} aria-label="Toggle highest rated filter" onClick={() => setFilter(!filter)}><span>Filter</span><Settings2 size={15} /></button></div></div>
          {query.trim() ? <>
            <div className="section-heading"><div><span className="eyebrow muted">SEARCH RESULTS</span><h3>{searching ? 'Searching…' : `${searchResults.length} films found`}</h3></div></div>
            {searching ? <div className="empty-state"><Search size={26} /><b>Searching the API catalog…</b></div> : searchError ? <div className="empty-state"><Film size={26} /><b>Search is unavailable</b><span>{searchError}</span></div> : searchResults.length ? <div className="poster-grid">{searchResults.map((movie) => <MovieCard key={movie.id} movie={movie} status={collection[movie.id]} onSelect={(selected) => navigate(`/movie/${selected.id}`)} onAdd={add} />)}</div> : <div className="empty-state"><Film size={28} /><b>No films found</b><span>Try another title or genre.</span></div>}
          </> : <>
            <div className="section-heading"><div><span className="eyebrow muted">{tab === 'Trending' ? 'MOST WATCHED / API' : tab === 'Hidden gems' ? 'LOWER DISCOVERY / API' : 'A GOOD PLACE TO START'}</span><h3>{tab === 'For you' ? 'Picked for your kind of cinema' : tab === 'Trending' ? 'On everyone’s radar' : 'Under the surface'}</h3></div>{tab === 'For you' && <button className="text-link" onClick={() => selectTab('For you')}><Shuffle size={14} /> Shuffle picks</button>}</div>
            {tab === 'For you' && featuredMovie && <div className="editorial-pick"><div className="editorial-img" style={{ backgroundImage: `url(${featuredMovie.backdrop || featuredMovie.poster})` }} /><div className="editorial-copy"><span className="eyebrow">A RANDOM API PICK</span><h3>{featuredMovie.title}<br /><em>{featuredMovie.year || 'Selected for you.'}</em></h3><p>{featuredMovie.description}</p><button className="text-link" onClick={() => navigate(`/movie/${featuredMovie.id}`)}>Discover the pick <ArrowRight size={15} /></button></div><span className="editorial-number">01 — {String(forYou.length).padStart(2, '0')}</span></div>}
            {catalogLoading ? <div className="empty-state"><Film size={26} /><b>Loading films from the API…</b></div> : catalogError ? <div className="empty-state"><Film size={26} /><b>Could not load the movie catalog</b><span>{catalogError}</span><button className="text-link" onClick={() => window.location.reload()}>Try again <ArrowRight size={15} /></button></div> : displayMovies.length ? <div className="poster-grid" id="all-films">{displayMovies.map((movie) => <MovieCard key={movie.id} movie={movie} status={collection[movie.id]} onSelect={(selected) => navigate(`/movie/${selected.id}`)} onAdd={add} />)}</div> : <div className="empty-state"><Film size={26} /><b>No films in this section yet</b><span>Try another discovery tab.</span></div>}
            <div className="section-heading second-heading"><div><span className="eyebrow muted">MORE FROM THE LIVE CATALOG</span><h3>Keep following <em>the feeling.</em></h3></div><span className="taste-note"><Sparkles size={14} /> API recommendations</span></div>
            <div className="recommend-strip"><div className="recommend-lead"><span className="recommend-index">01 / API PICKS</span><h3>Follow the<br /><em>feeling.</em></h3><p>More titles drawn from the same live recommendation feed.</p><div className="recommend-dots"><span /><span /><span /></div></div>{trending.slice(0, 3).map((movie, index) => <button className="recommend-card" key={movie.id} onClick={() => navigate(`/movie/${movie.id}`)}><img src={movie.poster} alt={`${movie.title} poster`} /><span className="recommend-overlay"><b>0{index + 1} / NEXT UP</b><strong>{movie.title}</strong><small>{movie.genre} · {movie.year || '—'}</small></span></button>)}</div>
          </>}
        </section>
        <section className="collection-callout"><div className="callout-icon"><Bookmark size={18} /></div><div><span className="eyebrow muted">YOUR PERSONAL ARCHIVE</span><h3>Keep the films that <em>keep you.</em></h3><p>{Object.keys(collection).length} films in your collection · {Object.values(collection).filter((status) => status === 'watched').length} watched</p></div><Link className="button button-outline" to={user ? `/u/${user.publicId}` : '/login'}>{user ? 'Open my collection' : 'Sign in to save films'} <ArrowRight size={15} /></Link></section>
      </main>
      <Footer />
      <AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><Check size={15} />{toast}</motion.div>}</AnimatePresence>
    </div>
  )
}
