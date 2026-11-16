import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search, X } from 'lucide-react'
import { movieRepository } from '../services/movieRepository'
import { movieRouteId } from '../data/tmdbIds'
import type { MovieDetail } from '../types/movie'

type Props = { open: boolean; onClose: () => void }

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [results, setResults] = useState<MovieDetail[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const normalized = query.trim()
    if (!open || !normalized) {
      setResults([])
      setSearching(false)
      return
    }
    let active = true
    setSearching(true)
    const timeout = window.setTimeout(() => {
      void movieRepository.search(normalized).then((found) => { if (active) setResults(found.slice(0, 6)) }).finally(() => { if (active) setSearching(false) })
    }, 280)
    return () => { active = false; window.clearTimeout(timeout) }
  }, [open, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowDown') {
        const firstResult = resultsRef.current?.querySelector<HTMLButtonElement>('.spotlight-result')
        if (firstResult) {
          event.preventDefault()
          firstResult.focus()
        }
      }
      if (event.key === 'Enter' && document.activeElement === inputRef.current) {
        resultsRef.current?.querySelector<HTMLButtonElement>('.spotlight-result')?.click()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="spotlight-backdrop" onMouseDown={onClose}>
      <section className="spotlight-modal" role="dialog" aria-modal="true" aria-label="Search films" onMouseDown={(event) => event.stopPropagation()}>
        <div className="spotlight-search"><Search size={19} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search films…" aria-label="Search movie titles"/><kbd>ESC</kbd><button onClick={onClose} aria-label="Close search"><X size={18}/></button></div>
        <div className="spotlight-results" aria-live="polite" ref={resultsRef}>
          {!query.trim() ? <p className="spotlight-hint">Type a film title to search the archive.</p> : searching ? <p className="spotlight-hint">Searching the film archive…</p> : results.length === 0 ? <p className="spotlight-hint">No films found for “{query.trim()}”. Try another title.</p> : results.map((movie) => <button className="spotlight-result" key={movie.id} onClick={() => { onClose(); navigate(`/movie/${movieRouteId(movie.id)}`) }}><img src={movie.poster} alt=""/><span className="spotlight-result-copy"><strong>{movie.title}</strong><small>{movie.year} <i/> {movie.genre} <i/> ★ {movie.rating}</small><span>{movie.description}</span></span><ArrowRight size={16}/></button>)}
        </div>
      </section>
    </div>, document.body,
  )
}
