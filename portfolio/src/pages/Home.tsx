import { Link } from 'react-router-dom'
import { CvButton } from '../components/CvButton'
import { Chips, Img, ProjectCard, Status } from '../components/ui'
import { useApp, useData, useSeo } from '../lib/app'
import { list } from '../lib/db'

export default function Home() {
  const { t, c } = useApp()
  useSeo()
  const projects = useData(() => list('projects', { column: 'sort' }))
  const skills = useData(() => list('skills', { column: 'sort' }))

  const published = (projects.data ?? []).filter((p) => p.published)
  const featured = published.filter((p) => p.featured)
  const shown = (featured.length ? featured : published).slice(0, 3)

  return (
    <>
      <section className="sec wrap hero">
        <div className="col">
          <div className="eb">{t('home.hello')}</div>
          <h1>{c('name')}</h1>
          <div className="hero-title">{c('hero_title')}</div>
          <p className="lead">{c('hero_intro')}</p>
          <div className="btns">
            <Link to="/projetos" className="bt">
              {t('home.viewProjects')}
            </Link>
            <CvButton className="bt o" label={t('home.downloadCv')} />
          </div>
        </div>
        <Img src={c('photo_url')} alt={c('name')} label={t('ph.photo')} className="hero-photo" />
      </section>

      <section className="band">
        <div className="sec wrap">
          <div className="sh">
            <div>
              <div className="eb">{t('home.portfolio')}</div>
              <h2>{t('home.featured')}</h2>
            </div>
            <Link to="/projetos" className="lk">
              {t('home.viewAll')}
            </Link>
          </div>
          <Status loading={projects.loading} error={projects.error}>
            <div className="g3">
              {shown.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </Status>
        </div>
      </section>

      <section className="sec wrap g2">
        <div className="col">
          <div className="eb">{t('nav.about')}</div>
          <h2>{t('home.aboutTitle')}</h2>
          <p className="big">{c('about_short')}</p>
          <div className="btns">
            <Link to="/sobre" className="bt o">
              {t('home.more')}
            </Link>
          </div>
        </div>
        <div className="col">
          <div className="lb">{t('home.mainSkills')}</div>
          <Chips items={(skills.data ?? []).slice(0, 8).map((s) => s.name)} variant="ln" />
          <div className="stats">
            {[1, 2].map((n) =>
              c(`stat${n}_value`) ? (
                <div key={n}>
                  <div className="stat-v">{c(`stat${n}_value`)}</div>
                  <div className="mu">{c(`stat${n}_label`)}</div>
                </div>
              ) : null,
            )}
          </div>
        </div>
      </section>

      <section className="wrap cta-wrap">
        <div className="cta">
          <h2>{c('cta_title')}</h2>
          <p>{c('cta_text')}</p>
          <Link to="/contacto" className="bt inv">
            {t('home.ctaBtn')}
          </Link>
        </div>
      </section>
    </>
  )
}
