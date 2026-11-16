import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Clapperboard } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ApiError } from '../services/apiClient'
import { authApi } from '../services/authApi'
import { useAuth } from '../lib/authStore'

type Props = { mode: 'login' | 'register' }

export default function AuthPage({ mode }: Props) {
  const navigate = useNavigate()
  const setSession = useAuth((state) => state.setSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'register') await authApi.register(email, password, displayName)
      const session = await authApi.login(email, password, rememberMe)
      setSession(session.user, session.accessToken)
      navigate(`/u/${session.user.publicId}`)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Tidak bisa terhubung ke server. Coba lagi sebentar.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="app-shell"><Header/><main className="auth-page"><section className="auth-card"><span className="brand-mark auth-mark"><Clapperboard size={18}/></span><span className="eyebrow muted">YOUR PERSONAL FILM ARCHIVE</span><h1>{mode === 'login' ? 'Welcome back.' : 'Make it yours.'}</h1><p>{mode === 'login' ? 'Sign in to pick up where your film list left off.' : 'Create an account to save films and share your collection.'}</p><form onSubmit={submit}>
    {mode === 'register' && <label className="field-label">Display name<input required maxLength={80} autoComplete="name" value={displayName} onChange={(event)=>setDisplayName(event.target.value)}/></label>}
    <label className="field-label">Email<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={(event)=>setEmail(event.target.value)}/></label>
    <label className="field-label">Password<input type="password" required minLength={15} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event)=>setPassword(event.target.value)}/><small>Minimal 15 karakter sesuai aturan server.</small></label>
    {mode === 'login' && <label className="auth-remember"><input type="checkbox" checked={rememberMe} onChange={(event)=>setRememberMe(event.target.checked)}/> Keep me signed in</label>}
    {error && <p className="auth-error" role="alert">{error}</p>}
    <button className="button button-light auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={15}/></button>
  </form><div className="auth-switch">{mode === 'login' ? <>New to Watch List? <Link to="/register">Create an account</Link></> : <>Already have an account? <Link to="/login">Sign in</Link></>}</div></section></main><Footer/></div>
}
