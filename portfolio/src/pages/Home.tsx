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
      <section className="wrap hero">
        <div className="hero-text">
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
          <ul className="hero-meta">
            {c('location') && (
              <li>
                <Icon name="pin" size={16} />
                {c('location')}
              </li>
            )}
            {c('email') && (
              <li>
                <Icon name="mail" size={16} />
                <a href={`mailto:${c('email')}`}>{c('email')}</a>
              </li>
            )}
          </ul>
        </div>
        <Img src={c('photo_url')} alt={c('name')} label={t('ph.photo')} className="hero-photo" />
      </section>

      <section className="sec wrap" aria-labelledby="featured-title">
        <div className="sh">
          <h2 id="featured-title">{t('home.featured')}</h2>
          <Link to="/projetos" className="lk">
            {t('home.viewAll')}
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        <Status loading={projects.loading} error={projects.error} skeleton="cards">
          <div className="featured">
            {shown.map((p, i) => (
              <ProjectCard key={p.id} project={p} big={i === 0 && shown.length === 3} />
            ))}
          </div>
        </Status>
      </section>

      <section className="sec wrap about-teaser" aria-labelledby="about-title">
        <h2 id="about-title">{t('nav.about')}</h2>
        <div>
          <p className="statement">{c('about_short')}</p>
          <Chips items={(skills.data ?? []).slice(0, 8).map((s) => s.name)} variant="ln" />
          <div className="about-foot">
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
            <Link to="/sobre" className="lk">
              {t('home.more')}
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <h2>{c('cta_title')}</h2>
          <p>{c('cta_text')}</p>
          <div className="btns">
            <Link to="/contacto" className="bt inv">
              {t('home.ctaBtn')}
              <Icon name="arrowRight" />
            </Link>
            {c('email') && (
              <a className="cta-mail" href={`mailto:${c('email')}`}>
                {c('email')}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
