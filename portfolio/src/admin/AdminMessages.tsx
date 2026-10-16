import { useState } from 'react'
import { useData } from '../lib/app'
import { list, remove, save } from '../lib/db'
import type { Message, PageView } from '../lib/types'
import { ConfirmButton } from '../components/ui'
import { PageHead } from './AdminLayout'
import { Bars, fmtDate, viewsByDay, within } from './Dashboard'

export function AdminMessages() {
  const { data, loading, error, reload } = useData(() => list('messages', { column: 'created_at', ascending: false }))
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState('')
  const [fail, setFail] = useState('')

  const messages = data ?? []
  const query = search.trim().toLowerCase()
  const shown = messages.filter((m) => {
    if (filter === 'unread' && m.read) return false
    if (filter === 'read' && !m.read) return false
    return !query || `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase().includes(query)
  })
  const open = messages.find((m) => m.id === openId)

  async function run(action: () => Promise<void>) {
    try {
      setFail('')
      await action()
      reload()
    } catch (err) {
      setFail((err as Error).message)
    }
  }

  const setRead = (m: Message, read: boolean) => run(() => save('messages', { ...m, read }))

  function select(m: Message) {
    setOpenId(m.id)
    if (!m.read) void setRead(m, true)
  }

  function del(m: Message) {
    setOpenId('')
    void run(() => remove('messages', m.id))
  }

  return (
    <>
      <PageHead title="Contactos" sub="Mensagens recebidas pelo formulário de contacto" />
      {fail && <div className="fail">{fail}</div>}
      <div className="split top">
        <div className="pn grow3">
          <div className="filters">
            <input className="in" type="search" placeholder="Pesquisar mensagens…" aria-label="Pesquisar mensagens" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="chips">
              {(
                [
                  ['all', 'Todas'],
                  ['unread', 'Não lidas'],
                  ['read', 'Lidas'],
                ] as const
              ).map(([value, label]) => (
                <button key={value} className={filter === value ? 'chip on' : 'chip'} onClick={() => setFilter(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {loading && <p className="mu">A carregar…</p>}
          {error && <div className="fail">{error}</div>}
          {!loading && shown.length === 0 && <p className="mu">Sem mensagens.</p>}
          {shown.length > 0 && (
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
                {shown.map((m) => (
                  <tr key={m.id} className={`${m.read ? '' : 'unread'} ${m.id === openId ? 'sel' : ''} click`} onClick={() => select(m)}>
                    <td>
                      <button className="row-btn">{m.name}</button>
                    </td>
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
          <div className="mu foot">
            A mostrar {shown.length} de {messages.length} mensagens
          </div>
        </div>

        {open && (
          <div className="pn grow2">
            <div className="pn-head">
              <h3>{open.subject}</h3>
            </div>
            <div className="sender">
              <div className="av">{open.name.slice(0, 2).toUpperCase()}</div>
              <div>
                <b>{open.name}</b>
                <div className="mu">
                  {open.email} · {new Date(open.created_at).toLocaleString('pt-PT')}
                </div>
              </div>
            </div>
            <p className="msg-body">{open.message}</p>
            <a className="bt block" href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject}`)}`}>
              Responder por email ↗
            </a>
            <div className="btns">
              <button className="bt o" onClick={() => setRead(open, !open.read)}>
                {open.read ? 'Marcar como não lida' : 'Marcar como lida'}
              </button>
              <ConfirmButton className="bt o danger" onConfirm={() => del(open)} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const pageNames: Record<string, string> = { '/': 'Home', '/sobre': 'Sobre mim', '/projetos': 'Projetos', '/cv': 'CV', '/contacto': 'Contacto' }

function top(views: PageView[], filter: (path: string) => boolean, limit = 6) {
  const counts = new Map<string, number>()
  for (const v of views) if (v.kind === 'view' && filter(v.path)) counts.set(v.path, (counts.get(v.path) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
}

function Ranking({ title, rows, label }: { title: string; rows: [string, number][]; label: (path: string) => string }) {
  const max = Math.max(1, ...rows.map((r) => r[1]))
  return (
    <div className="pn grow1">
      <h3>{title}</h3>
      {rows.length === 0 && <p className="mu">Ainda sem dados.</p>}
      {rows.map(([path, count]) => (
        <div className="rank" key={path}>
          <span>{label(path)}</span>
          <div className="pb">
            <i style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <b>{count}</b>
        </div>
      ))}
    </div>
  )
}

export function AdminStats() {
  const views = useData(() => list('page_views'))
  const projects = useData(() => list('projects'))
  const messages = useData(() => list('messages'))
  const [days, setDays] = useState(30)

  const recent = within(views.data ?? [], days)
  const visits = recent.filter((v) => v.kind === 'view')
  const titles = new Map((projects.data ?? []).map((p) => [`/projetos/${p.slug}`, p.title_pt]))
  const isProject = (path: string) => path.startsWith('/projetos/')

  const cards = [
    { label: 'Visitas', value: visits.length },
    { label: 'Páginas diferentes', value: new Set(visits.map((v) => v.path)).size },
    { label: 'Downloads do CV', value: recent.filter((v) => v.kind === 'cv_download').length },
    { label: 'Mensagens recebidas', value: (messages.data ?? []).filter((m) => Date.now() - new Date(m.created_at).getTime() <= days * 86_400_000).length },
  ]

  return (
    <>
      <PageHead title="Estatísticas" sub="Visitas ao website">
        <div className="chips">
          {[7, 30, 90].map((n) => (
            <button key={n} className={days === n ? 'chip on' : 'chip'} onClick={() => setDays(n)}>
              {n} dias
            </button>
          ))}
        </div>
      </PageHead>
      {views.error && <div className="fail">{views.error}</div>}
      <div className="g4">
        {cards.map((card) => (
          <div className="st" key={card.label}>
            <div className="lb">{card.label}</div>
            <div className="v">{card.value}</div>
            <div className="mu">últimos {days} dias</div>
          </div>
        ))}
      </div>
      <div className="pn">
        <div className="pn-head">
          <h3>Visitas por dia</h3>
          <span className="mu">Últimos {days} dias</span>
        </div>
        <Bars data={viewsByDay(views.data ?? [], days)} />
      </div>
      <div className="split">
        <Ranking title="Páginas mais visitadas" rows={top(recent, (p) => !isProject(p))} label={(p) => pageNames[p] ?? p} />
        <Ranking title="Projetos mais vistos" rows={top(recent, isProject)} label={(p) => titles.get(p) ?? p} />
      </div>
    </>
  )
}
