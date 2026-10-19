import { Link } from 'react-router-dom'
import { CvButton } from '../components/CvButton'
import { Icon } from '../components/Icon'
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
  const stats = [1, 2].filter((n) => c(`stat${n}_value`))

  return (
    <>
      <section className="sec wrap hero">
        <div className="col hero-text">
          <h1>{c('name')}</h1>
          <p className="hero-title">{c('hero_title')}</p>
          <p className="lead">{c('hero_intro')}</p>
          <div className="btns">
            <Link to="/projetos" className="bt">
              {t('home.viewProjects')}
              <Icon name="arrowRight" />
            </Link>
            <CvButton className="bt o" label={t('home.downloadCv')} />
          </div>
        </div>
        <Img src={c('photo_url')} alt={c('name')} label={t('ph.photo')} className="hero-photo" />
      </section>

      <section className="band" aria-labelledby="featured-title">
        <div className="sec wrap">
          <div className="sh">
            <h2 id="featured-title">{t('home.featured')}</h2>
            <Link to="/projetos" className="lk">
              {t('home.viewAll')}
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
          <Status loading={projects.loading} error={projects.error} skeleton="cards">
            <div className="g3">
              {shown.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </Status>
        </div>
      </section>

      <section className="sec wrap g2" aria-labelledby="about-title">
        <div className="col">
          <h2 id="about-title">{t('nav.about')}</h2>
          <p className="big measure">{c('about_short')}</p>
          <div className="btns">
            <Link to="/sobre" className="bt o">
              {t('home.more')}
            </Link>
          </div>
        </div>
        <div className="col">
          <h3 className="sub-h">{t('home.mainSkills')}</h3>
          <Chips items={(skills.data ?? []).slice(0, 8).map((s) => s.name)} variant="ln" />
          {stats.length > 0 && (
            <dl className="stats">
              {stats.map((n) => (
                <div key={n}>
                  <dt className="mu">{c(`stat${n}_label`)}</dt>
                  <dd className="stat-v">{c(`stat${n}_value`)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section className="wrap cta-wrap">
        <div className="cta">
          <h2>{c('cta_title')}</h2>
          <p>{c('cta_text')}</p>
          <Link to="/contacto" className="bt inv">
            {t('home.ctaBtn')}
            <Icon name="arrowRight" />
          </Link>
        </div>
      </section>
    </>
  )
}
