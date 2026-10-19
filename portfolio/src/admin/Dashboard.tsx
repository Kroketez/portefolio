import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useData } from '../lib/app'
import { list } from '../lib/db'
import type { PageView } from '../lib/types'
import { PageHead } from './AdminLayout'

const DAY = 86_400_000

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-PT')

/** Visits per day for the last `days` days, oldest first. */
export function viewsByDay(views: PageView[], days: number) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const buckets = Array.from({ length: days }, (_, i) => ({ day: new Date(start.getTime() - (days - 1 - i) * DAY), count: 0 }))
  for (const v of views) {
    if (v.kind !== 'view') continue
    const index = days - 1 - Math.floor((start.getTime() + DAY - 1 - new Date(v.created_at).getTime()) / DAY)
    if (index >= 0 && index < days) buckets[index].count++
  }
  return buckets
}

export const within = (views: PageView[], days: number) => {
  const since = Date.now() - days * DAY
  return views.filter((v) => new Date(v.created_at).getTime() >= since)
}

export function Bars({ data }: { data: { day: Date; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="bars" role="img" aria-label="Gráfico de visitas por dia">
      {data.map((d, i) => (
        <i
          key={i}
          className={i === data.length - 1 ? 'on' : ''}
          style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
          title={`${d.day.toLocaleDateString('pt-PT')}: ${d.count}`}
        />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const projects = useData(() => list('projects'))
  const messages = useData(() => list('messages', { column: 'created_at', ascending: false }))
  const views = useData(() => list('page_views'))

  const all = views.data ?? []
  const recent = within(all, 30)
  const msgs = messages.data ?? []
  const projs = projects.data ?? []
  // Show a dash, not a misleading 0, until every count has loaded.
  const loadingAll = projects.loading || messages.loading || views.loading

  const cards = [
    { label: 'Projetos', value: projs.length, note: `${projs.filter((p) => !p.published).length} em rascunho` },
    { label: 'Mensagens novas', value: msgs.filter((m) => !m.read).length, note: `${msgs.length} no total` },
    { label: 'Visitas (30 dias)', value: recent.filter((v) => v.kind === 'view').length, note: `${all.filter((v) => v.kind === 'view').length} no total` },
    { label: 'Downloads do CV', value: recent.filter((v) => v.kind === 'cv_download').length, note: 'últimos 30 dias' },
  ]

  return (
    <>
      <PageHead title="Dashboard" sub="Resumo do teu website" />
      <div className="g4">
        {cards.map((card) => (
          <div className="st" key={card.label}>
            <div className="lb">{card.label}</div>
            <div className="v">{loadingAll ? '—' : card.value}</div>
            <div className="mu">{loadingAll ? ' ' : card.note}</div>
          </div>
        ))}
      </div>

      <div className="split">
        <div className="pn grow2">
          <div className="pn-head">
            <h3>Últimas mensagens</h3>
            <Link to="/admin/contactos" className="lk">
              Ver todas
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
          {msgs.length === 0 ? (
            <p className="mu">Ainda não recebeste mensagens.</p>
          ) : (
            <table className="tb">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Assunto</th>
                  <th>Data</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {msgs.slice(0, 5).map((m) => (
                  <tr key={m.id} className={m.read ? '' : 'unread'}>
                    <td>{m.name}</td>
                    <td>{m.subject}</td>
                    <td className="mu">{fmtDate(m.created_at)}</td>
                    <td>
                      <span className={m.read ? 'bdg n' : 'bdg'}>{m.read ? 'Lida' : 'Nova'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="pn grow1">
          <h3>Ações rápidas</h3>
          <Link to="/admin/projetos?novo=1" className="bt block">
            <Icon name="plus" />
            Novo projeto
          </Link>
          <Link to="/admin/conteudos" className="bt o block">
            Editar conteúdos
          </Link>
          <Link to="/admin/conteudos?tab=CV" className="bt o block">
            Atualizar CV (PDF)
          </Link>
        </div>
      </div>

      <div className="pn">
        <div className="pn-head">
          <h3>Visitas ao website</h3>
          <span className="mu">Últimos 14 dias</span>
        </div>
        <Bars data={viewsByDay(all, 14)} />
      </div>
    </>
  )
}
