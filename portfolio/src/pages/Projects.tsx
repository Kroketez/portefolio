import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { ProjectCard, Status } from '../components/ui'
import { useApp, useData, useSeo } from '../lib/app'
import { list } from '../lib/db'

export default function Projects() {
  const { t, pick } = useApp()
  useSeo(t('nav.projects'), t('projects.lead'))
  const { data, loading, error } = useData(() => list('projects', { column: 'sort' }))
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [tech, setTech] = useState('')

  const published = useMemo(() => (data ?? []).filter((p) => p.published), [data])
  const categories = useMemo(() => [...new Set(published.map((p) => p.category).filter(Boolean))].sort(), [published])
  const techs = useMemo(() => [...new Set(published.flatMap((p) => p.technologies))].sort(), [published])

  const query = search.trim().toLowerCase()
  const results = published.filter((p) => {
    if (category && p.category !== category) return false
    if (tech && !p.technologies.includes(tech)) return false
    if (!query) return true
    const haystack = [pick(p, 'title'), pick(p, 'summary'), p.category, ...p.technologies].join(' ').toLowerCase()
    return haystack.includes(query)
  })

  return (
    <>
      <section className="sec wrap sec-head">
        <h1 className="h1s">{t('nav.projects')}</h1>
        <p className="lead">{t('projects.lead')}</p>

        <div className="filters">
          <label className="search">
            <Icon name="search" />
            <input
            className="in"
            type="search"
            placeholder={t('projects.search')}
            aria-label={t('projects.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          </label>
          <div className="chips">
            <button className={category ? 'chip' : 'chip on'} aria-pressed={!category} onClick={() => setCategory('')}>
              {t('projects.all')}
            </button>
            {categories.map((name) => (
              <button key={name} className={category === name ? 'chip on' : 'chip'} aria-pressed={category === name} onClick={() => setCategory(name)}>
                {name}
              </button>
            ))}
          </div>
          <select className="in sel" value={tech} onChange={(e) => setTech(e.target.value)} aria-label={t('project.tech')}>
            <option value="">{t('projects.allTech')}</option>
            {techs.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
        {!loading && !error && (
          <div className="mu found" aria-live="polite">
            {results.length === 1 ? t('projects.found1') : t('projects.found', { n: results.length })}
          </div>
        )}
      </section>

      <section className="wrap sec-body">
        <Status loading={loading} error={error} skeleton="cards">
          {results.length ? (
            <div className="g3">
              {results.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <p className="status">{t('projects.none')}</p>
          )}
        </Status>
      </section>
    </>
  )
}
