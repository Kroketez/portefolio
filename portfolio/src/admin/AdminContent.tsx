import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp, useData } from '../lib/app'
import { contentGroups, contentKeys } from '../lib/contentKeys'
import { list, newId, remove, save, upload } from '../lib/db'
import type { ContentRow, Experience, Skill } from '../lib/types'
import { ConfirmButton } from '../components/ui'
import { PageHead } from './AdminLayout'

const tabs = [...contentGroups, 'Competências', 'Experiência e formação'] as const
type Tab = (typeof tabs)[number]

export default function AdminContent() {
  const [params, setParams] = useSearchParams()
  const requested = params.get('tab') as Tab | null
  const tab: Tab = requested && tabs.includes(requested) ? requested : 'Home'

  return (
    <>
      <PageHead title="Conteúdos" sub="Edita os textos do website em português e em inglês" />
      <div className="tabs" role="tablist">
        {tabs.map((name) => (
          <button key={name} role="tab" aria-selected={tab === name} className={tab === name ? 'on' : ''} onClick={() => setParams({ tab: name })}>
            {name}
          </button>
        ))}
      </div>
      {tab === 'Competências' ? <SkillsEditor /> : tab === 'Experiência e formação' ? <ExperienceEditor /> : <TextsEditor group={tab} key={tab} />}
    </>
  )
}

function TextsEditor({ group }: { group: string }) {
  const { reloadContent } = useApp()
  const { data, loading, error, reload } = useData(() => list('content'))
  const [rows, setRows] = useState<Record<string, ContentRow>>({})
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)
  const keys = contentKeys.filter((k) => k.group === group)

  useEffect(() => {
    if (data) setRows(Object.fromEntries(data.map((r) => [r.key, r])))
  }, [data])

  const get = (key: string): ContentRow => rows[key] ?? { key, pt: '', en: '' }
  const set = (key: string, lang: 'pt' | 'en', value: string) => setRows({ ...rows, [key]: { ...get(key), [lang]: value } })

  async function saveAll() {
    setBusy(true)
    try {
      for (const k of keys) await save('content', get(k.key))
      await reloadContent()
      reload()
      setMsg({ type: 'ok', text: '✓ Alterações guardadas com sucesso.' })
    } catch (err) {
      setMsg({ type: 'fail', text: `Não foi possível guardar: ${(err as Error).message}` })
    } finally {
      setBusy(false)
    }
  }

  async function pickFile(key: string, file: File | undefined) {
    if (!file) return
    setBusy(true)
    try {
      set(key, 'pt', await upload(file))
      setMsg({ type: 'ok', text: 'Ficheiro carregado. Carrega em "Guardar alterações" para confirmar.' })
    } catch (err) {
      setMsg({ type: 'fail', text: `Falha no carregamento: ${(err as Error).message}` })
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="mu">A carregar…</p>
  if (error) return <div className="fail">{error}</div>

  return (
    <div className="pn">
      {keys.map((k) => {
        const row = get(k.key)
        if (k.upload) {
          return (
            <div className="field" key={k.key}>
              <label htmlFor={k.key}>{k.label}</label>
              {row.pt && k.upload === 'image' && <img src={row.pt} alt="" className="thumb" />}
              {row.pt && k.upload === 'pdf' && (
                <a href={row.pt} target="_blank" rel="noreferrer" className="lk">
                  Ver PDF atual ↗
                </a>
              )}
              <div className="btns">
                <input id={k.key} type="file" accept={k.upload === 'pdf' ? 'application/pdf' : 'image/*'} onChange={(e) => pickFile(k.key, e.target.files?.[0])} />
                {row.pt && (
                  <button type="button" className="lk danger" onClick={() => set(k.key, 'pt', '')}>
                    Remover
                  </button>
                )}
              </div>
            </div>
          )
        }
        const langs = k.bilingual ? (['pt', 'en'] as const) : (['pt'] as const)
        return (
          <div className={k.bilingual ? 'row2' : ''} key={k.key}>
            {langs.map((lang) => {
              const id = `${k.key}-${lang}`
              return (
                <div className="field" key={id}>
                  <label htmlFor={id}>
                    {k.label} {k.bilingual && <span className="bdg n">{lang.toUpperCase()}</span>}
                  </label>
                  {k.multiline ? (
                    <textarea id={id} className="in" rows={4} value={row[lang]} onChange={(e) => set(k.key, lang, e.target.value)} />
                  ) : (
                    <input id={id} className="in" value={row[lang]} onChange={(e) => set(k.key, lang, e.target.value)} />
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
      <div className="btns">
        <button className="bt" onClick={saveAll} disabled={busy}>
          {busy ? 'A guardar…' : 'Guardar alterações'}
        </button>
      </div>
      {msg.text && <div className={msg.type}>{msg.text}</div>}
    </div>
  )
}

/** Small inline editor shared by skills and experience: a list of rows, each saved on its own. */
function useRows<T extends { id: string; sort: number }>(table: 'skills' | 'experience') {
  const { data, loading, error, reload } = useData(() => list(table, { column: 'sort' }) as Promise<unknown> as Promise<T[]>)
  const [rows, setRows] = useState<T[]>([])
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    if (data) setRows(data)
  }, [data])

  const change = (id: string, patch: Partial<T>) => setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const add = (row: T) => setRows([...rows, row])

  async function saveAll() {
    try {
      for (const [i, row] of rows.entries()) await save(table, { ...row, sort: i } as never)
      setMsg({ type: 'ok', text: '✓ Alterações guardadas com sucesso.' })
      reload()
    } catch (err) {
      setMsg({ type: 'fail', text: `Não foi possível guardar: ${(err as Error).message}` })
    }
  }

  async function del(id: string) {
    try {
      if (data?.some((r) => r.id === id)) await remove(table, id)
      setRows(rows.filter((r) => r.id !== id))
    } catch (err) {
      setMsg({ type: 'fail', text: `Não foi possível eliminar: ${(err as Error).message}` })
    }
  }

  return { rows, loading, error, msg, change, add, saveAll, del }
}

function SkillsEditor() {
  const { rows, loading, error, msg, change, add, saveAll, del } = useRows<Skill>('skills')
  if (loading) return <p className="mu">A carregar…</p>
  if (error) return <div className="fail">{error}</div>
  const last = rows[rows.length - 1]

  return (
    <div className="pn">
      <p className="mu">As competências com o mesmo nome de grupo aparecem juntas no site.</p>
      <table className="tb edit">
        <thead>
          <tr>
            <th>Competência</th>
            <th>Grupo (PT)</th>
            <th>Grupo (EN)</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              <td>
                <input className="in" aria-label="Competência" value={s.name} onChange={(e) => change(s.id, { name: e.target.value })} />
              </td>
              <td>
                <input className="in" aria-label="Grupo em português" value={s.group_pt} onChange={(e) => change(s.id, { group_pt: e.target.value })} />
              </td>
              <td>
                <input className="in" aria-label="Grupo em inglês" value={s.group_en} onChange={(e) => change(s.id, { group_en: e.target.value })} />
              </td>
              <td className="right">
                <ConfirmButton className="lk danger" onConfirm={() => del(s.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="btns">
        <button className="bt" onClick={saveAll}>
          Guardar alterações
        </button>
        <button className="bt o" onClick={() => add({ id: newId(), name: '', group_pt: last?.group_pt ?? '', group_en: last?.group_en ?? '', sort: rows.length })}>
          + Adicionar competência
        </button>
      </div>
      {msg.text && <div className={msg.type}>{msg.text}</div>}
    </div>
  )
}

function ExperienceEditor() {
  const { rows, loading, error, msg, change, add, saveAll, del } = useRows<Experience>('experience')
  if (loading) return <p className="mu">A carregar…</p>
  if (error) return <div className="fail">{error}</div>

  const blank = (kind: Experience['kind']): Experience => ({
    id: newId(),
    kind,
    title_pt: '',
    title_en: '',
    org: '',
    location: '',
    period: '',
    description_pt: '',
    description_en: '',
    sort: rows.length,
  })

  return (
    <>
      {rows.map((x) => (
        <div className="pn" key={x.id}>
          <div className="pn-head">
            <select className="in sel" aria-label="Tipo" value={x.kind} onChange={(e) => change(x.id, { kind: e.target.value as Experience['kind'] })}>
              <option value="work">Experiência</option>
              <option value="education">Formação</option>
            </select>
            <ConfirmButton className="lk danger" onConfirm={() => del(x.id)} />
          </div>
          <div className="row2">
            <div className="field">
              <label>
                {x.kind === 'work' ? 'Cargo' : 'Curso'} <span className="bdg n">PT</span>
                <input className="in" value={x.title_pt} onChange={(e) => change(x.id, { title_pt: e.target.value })} />
              </label>
            </div>
            <div className="field">
              <label>
                {x.kind === 'work' ? 'Cargo' : 'Curso'} <span className="bdg n">EN</span>
                <input className="in" value={x.title_en} onChange={(e) => change(x.id, { title_en: e.target.value })} />
              </label>
            </div>
          </div>
          <div className="row3">
            <div className="field">
              <label>
                {x.kind === 'work' ? 'Empresa' : 'Instituição'}
                <input className="in" value={x.org} onChange={(e) => change(x.id, { org: e.target.value })} />
              </label>
            </div>
            <div className="field">
              <label>
                Local
                <input className="in" value={x.location} onChange={(e) => change(x.id, { location: e.target.value })} />
              </label>
            </div>
            <div className="field">
              <label>
                Período
                <input className="in" placeholder="2024 — Presente" value={x.period} onChange={(e) => change(x.id, { period: e.target.value })} />
              </label>
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>
                Descrição <span className="bdg n">PT</span>
                <textarea className="in" rows={3} value={x.description_pt} onChange={(e) => change(x.id, { description_pt: e.target.value })} />
              </label>
            </div>
            <div className="field">
              <label>
                Descrição <span className="bdg n">EN</span>
                <textarea className="in" rows={3} value={x.description_en} onChange={(e) => change(x.id, { description_en: e.target.value })} />
              </label>
            </div>
          </div>
        </div>
      ))}
      <div className="btns">
        <button className="bt" onClick={saveAll}>
          Guardar alterações
        </button>
        <button className="bt o" onClick={() => add(blank('work'))}>
          + Experiência
        </button>
        <button className="bt o" onClick={() => add(blank('education'))}>
          + Formação
        </button>
      </div>
      {msg.text && <div className={msg.type}>{msg.text}</div>}
    </>
  )
}
