import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../lib/app'
import { list, newId, remove, save, upload } from '../lib/db'
import type { Project } from '../lib/types'
import { ConfirmButton } from '../components/ui'
import { PageHead } from './AdminLayout'

const blank = (sort: number): Project => ({
  id: newId(),
  slug: '',
  title_pt: '',
  title_en: '',
  summary_pt: '',
  summary_en: '',
  challenge_pt: '',
  challenge_en: '',
  solution_pt: '',
  solution_en: '',
  category: '',
  technologies: [],
  client: '',
  year: new Date().getFullYear(),
  role_pt: '',
  role_en: '',
  cover_url: '',
  gallery: [],
  live_url: '',
  repo_url: '',
  featured: false,
  published: false,
  sort,
  created_at: new Date().toISOString(),
})

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export default function AdminProjects() {
  const { data, loading, error, reload } = useData(() => list('projects', { column: 'sort' }))
  const [params, setParams] = useSearchParams()
  const [editing, setEditing] = useState<Project | null>(null)
  const [lang, setLang] = useState<'pt' | 'en'>('pt')
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)

  const projects = data ?? []

  // "+ Novo projeto" on the dashboard links here with ?novo=1
  useEffect(() => {
    if (params.get('novo') && data) {
      setEditing(blank(data.length))
      setParams({}, { replace: true })
    }
  }, [params, data, setParams])

  const set = <K extends keyof Project>(key: K, value: Project[K]) => editing && setEditing({ ...editing, [key]: value })
  const flash = (type: string, text: string) => setMsg({ type, text })

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    if (!editing.title_pt.trim()) return flash('fail', 'O título em português é obrigatório.')
    const slug = slugify(editing.slug || editing.title_pt)
    if (projects.some((p) => p.slug === slug && p.id !== editing.id)) return flash('fail', 'Já existe um projeto com este endereço (slug).')
    setBusy(true)
    try {
      await save('projects', { ...editing, slug })
      flash('ok', 'Projeto guardado.')
      setEditing(null)
      reload()
    } catch (err) {
      flash('fail', `Não foi possível guardar: ${(err as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  async function del(project: Project) {
    try {
      await remove('projects', project.id)
      if (editing?.id === project.id) setEditing(null)
      flash('ok', 'Projeto eliminado.')
      reload()
    } catch (err) {
      flash('fail', `Não foi possível eliminar: ${(err as Error).message}`)
    }
  }

  async function pickFile(file: File | undefined, target: 'cover' | 'gallery') {
    if (!file || !editing) return
    setBusy(true)
    try {
      const url = await upload(file)
      if (target === 'cover') set('cover_url', url)
      else set('gallery', [...editing.gallery, url])
    } catch (err) {
      flash('fail', `Falha no carregamento: ${(err as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  const query = search.trim().toLowerCase()
  const shown = projects.filter((p) => !query || `${p.title_pt} ${p.category}`.toLowerCase().includes(query))

  return (
    <>
      <PageHead title="Projetos" sub="Cria, edita e publica os projetos do portefólio">
        <button className="bt s" onClick={() => setEditing(blank(projects.length))}>
          + Novo projeto
        </button>
      </PageHead>
      {msg.text && <div className={msg.type}>{msg.text}</div>}

      <div className="split top">
        <div className="pn grow3">
          <input className="in" type="search" placeholder="Pesquisar projetos…" aria-label="Pesquisar projetos" value={search} onChange={(e) => setSearch(e.target.value)} />
          {loading && <p className="mu">A carregar…</p>}
          {error && <div className="fail">{error}</div>}
          {!loading && shown.length === 0 && <p className="mu">Sem projetos.</p>}
          {shown.length > 0 && (
            <table className="tb">
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Categoria</th>
                  <th>Estado</th>
                  <th className="right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id} className={editing?.id === p.id ? 'sel' : ''}>
                    <td>
                      <b>{p.title_pt}</b>
                      {p.featured && <span className="bdg star">Destaque</span>}
                    </td>
                    <td>{p.category}</td>
                    <td>
                      <span className={p.published ? 'bdg g' : 'bdg n'}>{p.published ? 'Publicado' : 'Rascunho'}</span>
                    </td>
                    <td className="right actions">
                      <button className="lk" onClick={() => setEditing(p)}>
                        Editar
                      </button>
                      <ConfirmButton className="lk danger" onConfirm={() => del(p)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {editing && (
          <form className="pn grow2" onSubmit={submit}>
            <div className="pn-head">
              <h3>{projects.some((p) => p.id === editing.id) ? 'Editar projeto' : 'Novo projeto'}</h3>
              <span className="lang">
                <button type="button" className={lang === 'pt' ? 'on' : ''} onClick={() => setLang('pt')}>
                  PT
                </button>
                <span>·</span>
                <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>
                  EN
                </button>
              </span>
            </div>

            {(
              [
                ['title', 'Título', false],
                ['summary', 'Resumo', true],
                ['role', 'Função', false],
                ['challenge', 'O desafio', true],
                ['solution', 'A solução', true],
              ] as const
            ).map(([base, label, multi]) => {
              const key = `${base}_${lang}` as keyof Project
              return (
                <div className="field" key={key}>
                  <label htmlFor={key}>
                    {label} <span className="bdg n">{lang.toUpperCase()}</span>
                  </label>
                  {multi ? (
                    <textarea id={key} className="in" rows={3} value={editing[key] as string} onChange={(e) => set(key, e.target.value)} />
                  ) : (
                    <input id={key} className="in" value={editing[key] as string} onChange={(e) => set(key, e.target.value)} />
                  )}
                </div>
              )
            })}

            <div className="row2">
              <div className="field">
                <label htmlFor="category">Categoria</label>
                <input id="category" className="in" list="cats" value={editing.category} onChange={(e) => set('category', e.target.value)} />
                <datalist id="cats">
                  {[...new Set(projects.map((p) => p.category).filter(Boolean))].map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div className="field">
                <label htmlFor="year">Ano</label>
                <input id="year" className="in" type="number" value={editing.year ?? ''} onChange={(e) => set('year', e.target.value ? Number(e.target.value) : null)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="tech">Tecnologias (separadas por vírgulas)</label>
              <input
                id="tech"
                className="in"
                defaultValue={editing.technologies.join(', ')}
                key={editing.id}
                onChange={(e) => set('technologies', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              />
            </div>
            <div className="field">
              <label htmlFor="client">Cliente</label>
              <input id="client" className="in" value={editing.client} onChange={(e) => set('client', e.target.value)} />
            </div>
            <div className="row2">
              <div className="field">
                <label htmlFor="live">Ligação do projeto</label>
                <input id="live" className="in" type="url" placeholder="https://" value={editing.live_url} onChange={(e) => set('live_url', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="repo">Código-fonte</label>
                <input id="repo" className="in" type="url" placeholder="https://" value={editing.repo_url} onChange={(e) => set('repo_url', e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="slug">Endereço (slug)</label>
              <input id="slug" className="in" placeholder={slugify(editing.title_pt) || 'gerado a partir do título'} value={editing.slug} onChange={(e) => set('slug', e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="cover">Imagem de capa</label>
              {editing.cover_url && <img src={editing.cover_url} alt="" className="thumb" />}
              <input id="cover" type="file" accept="image/*" onChange={(e) => pickFile(e.target.files?.[0], 'cover')} />
            </div>
            <div className="field">
              <label htmlFor="gallery">Galeria</label>
              <div className="thumbs">
                {editing.gallery.map((url) => (
                  <button type="button" key={url} title="Remover imagem" onClick={() => set('gallery', editing.gallery.filter((g) => g !== url))}>
                    <img src={url} alt="" className="thumb" />
                  </button>
                ))}
              </div>
              <input id="gallery" type="file" accept="image/*" onChange={(e) => pickFile(e.target.files?.[0], 'gallery')} />
            </div>

            <label className="check">
              <input type="checkbox" checked={editing.published} onChange={(e) => set('published', e.target.checked)} /> Publicado (visível no site)
            </label>
            <label className="check">
              <input type="checkbox" checked={editing.featured} onChange={(e) => set('featured', e.target.checked)} /> Em destaque na Home
            </label>

            <div className="btns">
              <button className="bt" type="submit" disabled={busy}>
                {busy ? 'A guardar…' : 'Guardar'}
              </button>
              <button className="bt o" type="button" onClick={() => setEditing(null)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
