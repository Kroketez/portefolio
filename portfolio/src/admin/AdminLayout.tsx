import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { LangSwitch, Logo, ThemeSwitch } from '../components/Layout'
import { Icon } from '../components/Icon'
import type { IconName } from '../components/Icon'
import { DEMO_EMAIL, DEMO_PASSWORD, getUser, isDemo, onAuthChange, signIn, signOut } from '../lib/db'
import type { SessionUser } from '../lib/db'

/** undefined while the session is being checked, null when signed out. */
function useSession() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined)
  useEffect(() => {
    void getUser().then(setUser)
    return onAuthChange(setUser)
  }, [])
  return user
}

const menu: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/projetos', label: 'Projetos', icon: 'folder' },
  { to: '/admin/conteudos', label: 'Conteúdos', icon: 'text' },
  { to: '/admin/contactos', label: 'Contactos', icon: 'inbox' },
  { to: '/admin/estatisticas', label: 'Estatísticas', icon: 'chart' },
]

/** Every /admin page renders inside this guard: no session, no backoffice. */
export default function AdminLayout() {
  const user = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Backoffice'
  }, [])

  if (user === undefined) return <p className="status" aria-busy="true">A carregar…</p>
  if (user === null) return <Navigate to="/admin/login" replace />

  return (
    <div className="adm">
      <aside className="sb">
        <Logo />
        <nav>
          {menu.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} className="mi">
              <Icon name={m.icon} />
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="sb-foot">
          <div className="mu">{user.email}</div>
          <button
            className="mi"
            onClick={async () => {
              await signOut()
              navigate('/admin/login')
            }}
          >
            <Icon name="logout" />
            Terminar sessão
          </button>
        </div>
      </aside>
      <div className="main">
        {isDemo && (
          <div className="notice">
            Modo de demonstração: o Supabase ainda não está configurado, por isso os dados ficam guardados apenas neste navegador.
          </div>
        )}
        <Outlet />
      </div>
    </div>
  )
}

export function PageHead({ title, sub, children }: { title: string; sub: string; children?: ReactNode }) {
  return (
    <div className="ph-head">
      <div>
        <h2>{title}</h2>
        <div className="mu">{sub}</div>
      </div>
      <div className="tools">
        {children}
        <ThemeSwitch />
        <Link to="/" className="bt o s">
          Ver site
          <Icon name="external" size={16} />
        </Link>
      </div>
    </div>
  )
}

export function Login() {
  const user = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/admin" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Preenche o email e a palavra-passe.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await signIn(email, password)
      navigate('/admin')
    } catch {
      setError('Email ou palavra-passe incorretos.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <form className="card login-card" onSubmit={submit} noValidate>
        <div className="login-top">
          <Logo />
          <span className="tools">
            <ThemeSwitch />
            <LangSwitch />
          </span>
        </div>
        <h2>Iniciar sessão</h2>
        <p>Acede à área de administração do website.</p>
        {isDemo && (
          <div className="notice">
            Modo de demonstração. Entra com <b>{DEMO_EMAIL}</b> e a palavra-passe <b>{DEMO_PASSWORD}</b>.
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="in" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Palavra-passe</label>
          <input id="password" className="in" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && (
          <div className="fail" role="alert">
            {error}
          </div>
        )}
        <button className="bt block" type="submit" disabled={busy}>
          {busy ? 'A entrar…' : 'Entrar'}
        </button>
        <Link to="/" className="mu back">
          <Icon name="arrowLeft" size={16} />
          Voltar ao site
        </Link>
      </form>
    </div>
  )
}
