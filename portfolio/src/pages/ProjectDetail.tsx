import { Link, useParams } from 'react-router-dom'
import { Chips, Img, Paragraphs, Status } from '../components/ui'
import { useApp, useData, useSeo } from '../lib/app'
import { list } from '../lib/db'

export default function ProjectDetail() {
  const { slug } = useParams()
  const { t, pick } = useApp()
  const { data, loading, error } = useData(() => list('projects', { column: 'sort' }))

  const published = (data ?? []).filter((p) => p.published)
  const index = published.findIndex((p) => p.slug === slug)
  const project = published[index]
  const prev = index > 0 ? published[index - 1] : undefined
  const next = index >= 0 ? published[index + 1] : undefined

  useSeo(project ? pick(project, 'title') : t('nav.projects'), project ? pick(project, 'summary') : undefined)

  return (
    <Status loading={loading} error={error}>
      {!project ? (
        <section className="sec wrap">
          <p className="status">{t('project.notFound')}</p>
          <Link to="/projetos" className="lk">
            {t('project.back')}
          </Link>
        </section>
      ) : (
        <>
          <section className="sec wrap sec-head">
            <Link to="/projetos" className="lk">
              {t('project.back')}
            </Link>
            {project.category && <Chips items={[project.category]} />}
            <h1 className="h1s">{pick(project, 'title')}</h1>
            <p className="lead">{pick(project, 'summary')}</p>
            <div className="meta">
              {project.client && (
                <div>
                  <div className="lb">{t('project.client')}</div>
                  <b>{project.client}</b>
                </div>
              )}
              {project.year && (
                <div>
                  <div className="lb">{t('project.year')}</div>
                  <b>{project.year}</b>
                </div>
              )}
              {pick(project, 'role') && (
                <div>
                  <div className="lb">{t('project.role')}</div>
                  <b>{pick(project, 'role')}</b>
                </div>
              )}
              {project.technologies.length > 0 && (
                <div>
                  <div className="lb">{t('project.tech')}</div>
                  <Chips items={project.technologies} />
                </div>
              )}
            </div>
          </section>

          <div className="wrap">
            <Img src={project.cover_url} alt={pick(project, 'title')} label={t('ph.image')} className="cover" />
          </div>

          <section className="sec wrap g2">
            <div className="col2">
              {pick(project, 'challenge') && (
                <>
                  <h2>{t('project.challenge')}</h2>
                  <Paragraphs text={pick(project, 'challenge')} className="big" />
                </>
              )}
              {pick(project, 'solution') && (
                <>
                  <h2 className="mt">{t('project.solution')}</h2>
                  <Paragraphs text={pick(project, 'solution')} className="big" />
                </>
              )}
            </div>
            {(project.live_url || project.repo_url) && (
              <div className="col">
                <div className="card">
                  <div className="cb">
                    <h3>{t('project.links')}</h3>
                    <p>{t('project.linksText')}</p>
                    {project.live_url && (
                      <a className="bt block" href={project.live_url} target="_blank" rel="noreferrer">
                        {t('project.live')}
                      </a>
                    )}
                    {project.repo_url && (
                      <a className="bt o block" href={project.repo_url} target="_blank" rel="noreferrer">
                        {t('project.repo')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {project.gallery.length > 0 && (
            <div className="wrap gallery">
              {project.gallery.map((url) => (
                <Img key={url} src={url} alt={pick(project, 'title')} label={t('ph.image')} className="gallery-img" />
              ))}
            </div>
          )}

          <div className="wrap">
            <div className="pager">
              <div>
                {prev && (
                  <Link to={`/projetos/${prev.slug}`}>
                    <div className="lb">{t('project.prev')}</div>
                    <h3>← {pick(prev, 'title')}</h3>
                  </Link>
                )}
              </div>
              <div className="right">
                {next && (
                  <Link to={`/projetos/${next.slug}`}>
                    <div className="lb">{t('project.next')}</div>
                    <h3>{pick(next, 'title')} →</h3>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Status>
  )
}
