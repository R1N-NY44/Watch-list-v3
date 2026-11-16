import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './Pages/Home'
import Profile from './Pages/Profile'
import MovieDetailPage from './Pages/MovieDetailPage'
import { movieRepository } from './services/movieRepository'
import { useCollection } from './lib/collectionStore'
import SearchModal from './components/SearchModal'

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/u/:username" element={<Profile />} />
      <Route path="/movie/:movieId" element={<MovieDetailRoute />} />
      <Route path="*" element={<Home />} />
    </Routes>
    <SearchModalController />
    </>
  )
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
  const movie = movieRepository.getById(movieId)
  const movies = movieRepository.getAll()
  const { collection, setStatus } = useCollection()

  return (
    <div className="app-shell">
      <Header />
      <MovieDetailPage movie={movie} movies={movies} status={movie ? collection[movie.id] : undefined} onSetStatus={setStatus} />
      <Footer />
    </div>
  )
}
