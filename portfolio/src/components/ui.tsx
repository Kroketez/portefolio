import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/app'
import type { Experience, Project } from '../lib/types'

/** Shows the image when there is one, otherwise a neutral labelled placeholder. */
export function Img({ src, alt, label, className, style }: { src: string; alt: string; label: string; className?: string; style?: CSSProperties }) {
  if (src) return <img src={src} alt={alt} className={`img ${className ?? ''}`} style={style} loading="lazy" />
  return (
    <div className={`ph ${className ?? ''}`} style={style} role="img" aria-label={alt}>
      {label}
    </div>
  )
}

export function Chips({ items, variant }: { items: string[]; variant?: 'ln' }) {
  return (
    <div className="chips">
      {items.map((item) => (
        <span key={item} className={variant ? `chip ${variant}` : 'chip'}>
          {item}
        </span>
      ))}
    </div>
  )
}

export function ProjectCard({ project }: { project: Project }) {
  const { pick, t } = useApp()
  return (
    <Link to={`/projetos/${project.slug}`} className="card card-link">
      <Img src={project.cover_url} alt={pick(project, 'title')} label={t('ph.image')} className="card-img" />
      <div className="cb">
        <h3>{pick(project, 'title')}</h3>
        <p>{pick(project, 'summary')}</p>
        <Chips items={[project.category, ...project.technologies].filter(Boolean).slice(0, 4)} />
      </div>
    </Link>
  )
}

export function Timeline({ items, dated }: { items: Experience[]; dated?: boolean }) {
  const { pick } = useApp()
  return (
    <div>
      {items.map((item) => (
        <div className="tli" key={item.id}>
          <i className="dot" />
          {dated ? (
            <div className="tl-head">
              <h3>{pick(item, 'title')}</h3>
              <span className="mu">{item.period}</span>
            </div>
          ) : (
            <>
              <div className="lb">{item.period}</div>
              <h3 style={{ marginTop: 6 }}>{pick(item, 'title')}</h3>
            </>
          )}
          <div className="mu">{[item.org, item.location].filter(Boolean).join(' · ')}</div>
          <p>{pick(item, 'description')}</p>
        </div>
      ))}
    </div>
  )
}

/** Loading / error wrapper for pages that fetch data. */
export function Status({ loading, error, children }: { loading: boolean; error: string; children: ReactNode }) {
  const { t } = useApp()
  if (loading) return <p className="status">{t('loading')}</p>
  if (error) return <p className="status err">{t('loadError')}</p>
  return <>{children}</>
}

/** Renders text with blank lines as paragraphs. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i} className={className}>
            {p}
          </p>
        ))}
    </>
  )
}

/**
 * Delete button that asks for a second click instead of a browser dialog
 * (some embedded browsers silently block window.confirm).
 */
export function ConfirmButton({ className, label = 'Eliminar', onConfirm }: { className: string; label?: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), 4000)
    return () => clearTimeout(timer)
  }, [armed])

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (!armed) return setArmed(true)
        setArmed(false)
        onConfirm()
      }}
    >
      {armed ? 'Clica outra vez para confirmar' : label}
    </button>
  )
}
