import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './Pages/Home'
import Profile from './Pages/Profile'
import MovieDetailPage from './Pages/MovieDetailPage'
import { movieRepository } from './services/movieRepository'
import { useCollection } from './lib/collectionStore'
import SearchModal from './components/SearchModal'
import AuthPage from './Pages/AuthPage'
import { useAuth } from './lib/authStore'
import type { MovieDetail } from './types/movie'

export default function App() {
  const bootstrap = useAuth((state) => state.bootstrap)
  const accessToken = useAuth((state) => state.accessToken)
  const hydrateCollection = useCollection((state) => state.hydrate)
  useEffect(() => { void bootstrap() }, [bootstrap])
  useEffect(() => { void hydrateCollection(accessToken) }, [accessToken, hydrateCollection])
  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/u/:publicId" element={<Profile />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/movie/:movieId" element={<MovieDetailRoute />} />
      <Route path="*" element={<Home />} />
    </Routes>
    <SearchModalController />
    <ApiErrorNotice />
    <AuthRequiredRedirect />
    </>
  )
}

function ApiErrorNotice() {
  const [message, setMessage] = useState('')
  useEffect(() => {
    const onError = (event: Event) => {
      setMessage((event as CustomEvent<string>).detail || 'The API request failed.')
      window.setTimeout(() => setMessage(''), 3600)
    }
    window.addEventListener('api-error', onError)
    return () => window.removeEventListener('api-error', onError)
  }, [])
  return message ? <div className="toast api-error-toast" role="status">{message}</div> : null
}

function AuthRequiredRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    const redirect = () => navigate('/login')
    window.addEventListener('auth-required', redirect)
    return () => window.removeEventListener('auth-required', redirect)
  }, [navigate])
  return null
}

function SearchModalController() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  useEffect(() => {
    const onOpen = () => setOpen(true)
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('open-search', onOpen)
    window.addEventListener('keydown', onShortcut)
    return () => {
      window.removeEventListener('open-search', onOpen)
      window.removeEventListener('keydown', onShortcut)
    }
  }, [])
  return <SearchModal open={open} onClose={close} />
}

function MovieDetailRoute() {
  const { movieId = '' } = useParams()
  const [movie, setMovie] = useState<MovieDetail | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    void movieRepository.getById(movieId).then((result) => { if (active) setMovie(result) }).catch((cause) => { if (active) { setMovie(undefined); setError(cause instanceof Error ? cause.message : 'Could not load this film.') } }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [movieId])
  const { collection, setStatus } = useCollection()

  return (
    <div className="app-shell">
      <Header />
      {loading ? <main className="detail-not-found"><span className="eyebrow">THE ARCHIVE</span><h1>Finding the<br/><em>right frame…</em></h1></main> : error ? <main className="detail-not-found"><span className="eyebrow">THE ARCHIVE / API</span><h1>Unable to load<br/><em>this film.</em></h1><p>{error}</p></main> : <MovieDetailPage movie={movie} status={movie ? collection[movie.id] : undefined} onSetStatus={(id, status) => setStatus(id, status, movie)} />}
      <Footer />
    </div>
  )
}
