import { CvButton } from '../components/CvButton'
import { Chips, Img, Status, Timeline } from '../components/ui'
import { useApp, useData, useSeo } from '../lib/app'
import { list } from '../lib/db'

export default function Cv() {
  const { t, c } = useApp()
  useSeo('Curriculum Vitae', c('cv_summary'))
  const skills = useData(() => list('skills', { column: 'sort' }))
  const experience = useData(() => list('experience', { column: 'sort' }))
  const items = experience.data ?? []
  const contacts = [c('email'), c('phone'), c('location'), c('linkedin').replace(/^https?:\/\/(www\.)?/, '')].filter(Boolean)

  return (
    <>
      <section className="sec wrap sec-head cv-head no-print">
        <div>
          <h1 className="h1s">Curriculum Vitae</h1>
          <p className="lead">{t('cv.lead')}</p>
        </div>
        <CvButton className="bt" label={t('cv.download')} print />
      </section>

      <section className="band cv-band">
        <div className="wrap">
          <div className="cv-sheet">
            <aside className="cv-side">
              <Img src={c('photo_url')} alt={c('name')} label={t('ph.photo')} className="cv-photo" />
              <h3>{t('cv.contacts')}</h3>
              <div className="cv-list">
                {contacts.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
              <h3>{t('about.skills')}</h3>
              <Chips items={(skills.data ?? []).map((s) => s.name)} />
              <h3>{t('cv.languages')}</h3>
              <div className="cv-list">
                {c('languages')
                  .split('\n')
                  .filter(Boolean)
                  .map((line) => (
                    <div key={line}>{line}</div>
                  ))}
              </div>
            </aside>
            <div className="col">
              <h2 className="cv-name">{c('name')}</h2>
              <div className="cv-title">{c('hero_title')}</div>
              <p>{c('cv_summary')}</p>
              <Status loading={experience.loading} error={experience.error}>
                <div className="lb cv-sec">{t('about.experience')}</div>
                <Timeline items={items.filter((i) => i.kind === 'work')} dated />
                <div className="lb cv-sec">{t('about.education')}</div>
                <Timeline items={items.filter((i) => i.kind === 'education')} dated />
              </Status>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
