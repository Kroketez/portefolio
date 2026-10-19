import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { DependencyList, ReactNode } from 'react'
import { list } from './db'
import { translate } from './i18n'
import type { TKey } from './i18n'
import type { Lang } from './types'

type Theme = 'light' | 'dark'

interface AppState {
  lang: Lang
  setLang: (lang: Lang) => void
  theme: Theme
  toggleTheme: () => void
  /** interface text */
  t: (key: TKey, vars?: Record<string, string | number>) => string
  /** editable site content, in the current language (falls back to Portuguese) */
  c: (key: string) => string
  /** bilingual column of a database row, e.g. pick(project, 'title') */
  pick: (row: object, base: string) => string
  reloadContent: () => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

const stored = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const CONTENT_CACHE = 'pf:cache:content'

const remember = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // private mode or storage full: the site still works without it
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (stored('pf:lang') === 'en' ? 'en' : 'pt'))
  // First visit follows the system setting; after that the visitor's own choice wins.
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = stored('pf:theme')
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  // Last loaded content is cached so the real name and texts show immediately on the next visit.
  const [content, setContent] = useState<Record<string, { pt: string; en: string }>>(() => {
    try {
      return JSON.parse(stored(CONTENT_CACHE) ?? '{}')
    } catch {
      return {}
    }
  })

  const reloadContent = useCallback(async () => {
    try {
      const rows = await list('content')
      const next = Object.fromEntries(rows.map((r) => [r.key, { pt: r.pt, en: r.en }]))
      setContent(next)
      remember(CONTENT_CACHE, JSON.stringify(next))
    } catch {
      // keep whatever is already shown
    }
  }, [])

  useEffect(() => {
    void reloadContent()
  }, [reloadContent])

  useEffect(() => {
    document.documentElement.lang = lang
    remember('pf:lang', lang)
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    remember('pf:theme', theme)
  }, [theme])

  const value = useMemo<AppState>(
    () => ({
      lang,
      setLang: setLangState,
      theme,
      toggleTheme: () => setTheme((v) => (v === 'dark' ? 'light' : 'dark')),
      t: (key, vars) => translate(lang, key, vars),
      c: (key) => content[key]?.[lang] || content[key]?.pt || '',
      pick: (row, base) => {
        const r = row as Record<string, unknown>
        return String(r[`${base}_${lang}`] || r[`${base}_pt`] || '')
      },
      reloadContent,
    }),
    [lang, theme, content, reloadContent],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

/** Loads async data and exposes loading / error state plus a reload function. */
export function useData<T>(load: () => Promise<T>, deps: DependencyList = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    load()
      .then((result) => {
        if (!alive) return
        setData(result)
        setError('')
      })
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { data, error, loading, reload: () => setTick((n) => n + 1) }
}

function setMeta(selector: string, attr: string, name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.content = content
}

/** SEO: page title, description and Open Graph tags for the current page. */
export function useSeo(pageTitle?: string, description?: string) {
  const { c } = useApp()
  const site = c('seo_title') || c('name') || 'Portefólio'
  const desc = description || c('seo_description')
  useEffect(() => {
    const title = pageTitle ? `${pageTitle} — ${c('name') || site}` : site
    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', desc)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc)
  }, [pageTitle, desc, site, c])
}
