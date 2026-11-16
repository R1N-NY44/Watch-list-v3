import { Link } from 'react-router-dom'
import { Clapperboard } from 'lucide-react'

export default function Footer(){return <footer className="footer"><Link to="/" className="brand"><span className="brand-mark"><Clapperboard size={15}/></span><span>watch<span className="brand-light">list</span></span></Link><span>Made for the love of looking.</span><span>© 2025 WATCH LIST</span></footer>}
