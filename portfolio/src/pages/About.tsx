import { Link } from 'react-router-dom'
import { Chips, Img, Paragraphs, Status, Timeline } from '../components/ui'
import { useApp, useData, useSeo } from '../lib/app'
import { list } from '../lib/db'
import type { Skill } from '../lib/types'

/** Groups skills by their (translated) group name, keeping the saved order. */
export function groupSkills(skills: Skill[], pick: (row: object, base: string) => string) {
  const groups = new Map<string, string[]>()
  for (const s of skills) {
    const name = pick(s, 'group')
    groups.set(name, [...(groups.get(name) ?? []), s.name])
  }
  return [...groups.entries()]
}

export default function About() {
  const { t, c, pick } = useApp()
  useSeo(t('nav.about'), c('about_short'))
  const skills = useData(() => list('skills', { column: 'sort' }))
  const experience = useData(() => list('experience', { column: 'sort' }))
  const items = experience.data ?? []

  return (
    <>
      <section className="sec wrap g2">
        <Img src={c('photo_url')} alt={c('name')} label={t('ph.photo')} className="about-photo" />
        <div className="col">
          <div className="eb">{t('nav.about')}</div>
          <h1 className="h1s">{c('about_heading')}</h1>
          <Paragraphs text={c('about_bio')} className="big" />
          <div className="btns">
            <Link to="/cv" className="bt">
              {t('about.viewCv')}
            </Link>
            <Link to="/contacto" className="bt o">
              {t('nav.cta')}
            </Link>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="sec wrap">
          <div className="eb">{t('about.skillsEyebrow')}</div>
          <h2 className="mb">{t('about.skills')}</h2>
          <Status loading={skills.loading} error={skills.error}>
            <div className="g3">
              {groupSkills(skills.data ?? [], pick).map(([group, names]) => (
                <div className="card" key={group}>
                  <div className="cb">
                    <h3>{group}</h3>
                    <Chips items={names} />
                  </div>
                </div>
              ))}
            </div>
          </Status>
        </div>
      </section>

      <section className="sec wrap g2">
        <Status loading={experience.loading} error={experience.error}>
          <div className="col">
            <h2 className="mb">{t('about.experience')}</h2>
            <Timeline items={items.filter((i) => i.kind === 'work')} />
          </div>
          <div className="col">
            <h2 className="mb">{t('about.education')}</h2>
            <Timeline items={items.filter((i) => i.kind === 'education')} />
          </div>
        </Status>
      </section>
    </>
  )
}
