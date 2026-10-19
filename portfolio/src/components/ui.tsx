import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/app'
import type { Experience, Project } from '../lib/types'
import { Icon } from './Icon'

/** Shows the image when there is one, otherwise a neutral labelled placeholder. */
export function Img({ src, alt, label, className, style }: { src: string; alt: string; label: string; className?: string; style?: CSSProperties }) {
  if (src) return <img src={src} alt={alt} className={`img ${className ?? ''}`} style={style} loading="lazy" decoding="async" />
  return (
    <div className={`ph ${className ?? ''}`} style={style} role="img" aria-label={alt}>
      <Icon name={label === 'Fotografia' || label === 'Photo' ? 'user' : 'image'} size={28} />
      <span>{label}</span>
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
        {project.category && <div className="card-meta">{project.category}</div>}
        <h3 className="card-title">
          {pick(project, 'title')}
          <Icon name="arrowRight" size={18} className="icon card-arrow" />
        </h3>
        <p>{pick(project, 'summary')}</p>
        {project.technologies.length > 0 && <Chips items={project.technologies.slice(0, 3)} />}
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
          <i className="dot" aria-hidden="true" />
          {dated ? (
            <div className="tl-head">
              <h3>{pick(item, 'title')}</h3>
              <span className="mu">{item.period}</span>
            </div>
          ) : (
            <>
              <div className="tl-period">{item.period}</div>
              <h3>{pick(item, 'title')}</h3>
            </>
          )}
          <div className="mu">{[item.org, item.location].filter(Boolean).join(' · ')}</div>
          <p>{pick(item, 'description')}</p>
        </div>
      ))}
    </div>
  )
}

/** Placeholder shapes shown while data loads, sized like the real content to avoid layout jumps. */
export function Skeleton({ kind }: { kind: 'cards' | 'lines' }) {
  const { t } = useApp()
  if (kind === 'cards') {
    return (
      <div className="g3" aria-busy="true" aria-label={t('loading')}>
        {[0, 1, 2].map((i) => (
          <div className="card sk-card" key={i}>
            <div className="sk sk-img" />
            <div className="cb">
              <div className="sk sk-line" style={{ width: '40%' }} />
              <div className="sk sk-line lg" style={{ width: '70%' }} />
              <div className="sk sk-line" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div aria-busy="true" aria-label={t('loading')}>
      {[70, 90, 55].map((w) => (
        <div className="sk sk-line lg" style={{ width: `${w}%` }} key={w} />
      ))}
    </div>
  )
}

/** Loading / error wrapper for pages that fetch data. */
export function Status({ loading, error, children, skeleton = 'lines' }: { loading: boolean; error: string; children: ReactNode; skeleton?: 'cards' | 'lines' }) {
  const { t } = useApp()
  if (loading) return <Skeleton kind={skeleton} />
  if (error) return <p className="status err" role="alert">{t('loadError')}</p>
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
      className={armed ? `${className} armed` : className}
      aria-live="polite"
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
