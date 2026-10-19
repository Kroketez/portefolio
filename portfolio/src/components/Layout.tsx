import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../lib/app'
import { track } from '../lib/db'
import type { TKey } from '../lib/i18n'
import { Icon } from './Icon'

const links: { to: string; key: TKey }[] = [
  { to: '/', key: 'nav.home' },
  { to: '/sobre', key: 'nav.about' },
  { to: '/projetos', key: 'nav.projects' },
  { to: '/cv', key: 'nav.cv' },
  { to: '/contacto', key: 'nav.contact' },
]

const YEAR = new Date().getFullYear()

export function Logo() {
  const { c } = useApp()
  return (
    <Link to="/" className="logo">
      {c('name') || 'Portefólio'}
      <i>.</i>
    </Link>
  )
}

export function LangSwitch() {
  const { lang, setLang } = useApp()
  return (
    <span className="lang" role="group" aria-label="Idioma / Language">
      <button className={lang === 'pt' ? 'on' : ''} onClick={() => setLang('pt')} aria-pressed={lang === 'pt'} lang="pt">
        PT
      </button>
      <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'} lang="en">
        EN
      </button>
    </span>
  )
}

export function ThemeSwitch() {
  const { theme, toggleTheme, t } = useApp()
  return (
    <button className="icon-btn" onClick={toggleTheme} aria-label={t('theme.toggle')} title={t('theme.toggle')}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  )
}

export function SocialLinks({ className }: { className?: string }) {
  const { c } = useApp()
  const items = [
    { label: 'LinkedIn', url: c('linkedin') },
    { label: 'GitHub', url: c('github') },
    { label: 'Behance', url: c('behance') },
  ].filter((i) => i.url)
  return (
    <>
      {items.map((i) => (
        <a key={i.label} href={i.url} target="_blank" rel="noreferrer" className={className}>
          {i.label}
        </a>
      ))}
    </>
  )
}

export default function Layout() {
  const { t, c } = useApp()
  const location = useLocation()
  const [openPath, setOpenPath] = useState('')
  // The mobile menu belongs to the page it was opened on, so navigating closes it.
  const open = openPath === location.pathname

  // One row per public page visit, shown in the backoffice statistics.
  useEffect(() => {
    window.scrollTo(0, 0)
    void track(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenPath('')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <a href="#main" className="skip">
        {t('nav.skip')}
      </a>
      <header className="hd">
        <div className="wrap hd-in">
          <Logo />
          <nav id="site-nav" className={open ? 'nav open' : 'nav'} aria-label="Principal">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}>
                {t(l.key)}
              </NavLink>
            ))}
          </nav>
          <div className="tools">
            <ThemeSwitch />
            <LangSwitch />
            <Link to="/contacto" className="bt s hide-m">
              {t('nav.cta')}
            </Link>
            <button
              className="icon-btn burger"
              onClick={() => setOpenPath(open ? '' : location.pathname)}
              aria-label={open ? t('nav.close') : t('nav.menu')}
              aria-expanded={open}
              aria-controls="site-nav"
            >
              <Icon name={open ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="ft">
        <div className="wrap">
          <div className="ft-top">
            <div>
              <Logo />
              <div className="ft-sub">{c('hero_title')}</div>
            </div>
            <nav className="ft-links" aria-label="Rodapé">
              {links.map((l) => (
                <Link key={l.to} to={l.to}>
                  {t(l.key)}
                </Link>
              ))}
            </nav>
            <div className="ft-links">
              <SocialLinks />
              {c('email') && <a href={`mailto:${c('email')}`}>Email</a>}
            </div>
          </div>
          <div className="ft-bot">
            <span>
              © {YEAR}
              {c('name') && ` ${c('name')}`}. {t('footer.rights')}
            </span>
            <Link to="/admin">{t('footer.admin')}</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
