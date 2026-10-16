import { seed } from './seed'
import { supabase } from './supabase'
import type { Message, PageView, Table, TableMap } from './types'

// Single data layer for the whole app. With Supabase configured it talks to the
// database; otherwise it runs in demo mode and keeps everything in localStorage.
export const isDemo = !supabase

// Demo-mode login only. Real logins are checked by Supabase Auth.
export const DEMO_EMAIL = 'admin@example.com'
export const DEMO_PASSWORD = 'demo1234'

const pk = (table: Table) => (table === 'content' ? 'key' : 'id')

function localRead<T extends Table>(table: T): TableMap[T][] {
  const raw = localStorage.getItem(`pf:${table}`)
  if (raw) {
    try {
      return JSON.parse(raw) as TableMap[T][]
    } catch {
      // corrupted entry: fall through and reseed
    }
  }
  const initial = seed[table]
  localStorage.setItem(`pf:${table}`, JSON.stringify(initial))
  return initial
}

function localWrite<T extends Table>(table: T, rows: TableMap[T][]) {
  localStorage.setItem(`pf:${table}`, JSON.stringify(rows))
}

const field = (row: object, column: string) => (row as Record<string, unknown>)[column]

export async function list<T extends Table>(
  table: T,
  order?: { column: string; ascending?: boolean },
): Promise<TableMap[T][]> {
  const ascending = order?.ascending ?? true
  if (supabase) {
    let query = supabase.from(table).select('*')
    if (order) query = query.order(order.column, { ascending })
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data as TableMap[T][]
  }
  const rows = [...localRead(table)]
  if (order) {
    rows.sort((a, b) => {
      const x = field(a, order.column) as string | number
      const y = field(b, order.column) as string | number
      return (x < y ? -1 : x > y ? 1 : 0) * (ascending ? 1 : -1)
    })
  }
  return rows
}

export async function save<T extends Table>(table: T, row: TableMap[T]): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from(table).upsert(row)
    if (error) throw new Error(error.message)
    return
  }
  const key = pk(table)
  const rows = localRead(table)
  const index = rows.findIndex((r) => field(r, key) === field(row, key))
  if (index >= 0) rows[index] = row
  else rows.push(row)
  localWrite(table, rows)
}

export async function remove(table: Table, id: string): Promise<void> {
  const key = pk(table)
  if (supabase) {
    const { error } = await supabase.from(table).delete().eq(key, id)
    if (error) throw new Error(error.message)
    return
  }
  localWrite(table, localRead(table).filter((r) => field(r, key) !== id) as never)
}

export const newId = () => crypto.randomUUID()

// ---------- authentication ----------

export interface SessionUser {
  email: string
}

const demoListeners = new Set<(user: SessionUser | null) => void>()

function demoUser(): SessionUser | null {
  const email = sessionStorage.getItem('pf:session')
  return email ? { email } : null
}

export async function getUser(): Promise<SessionUser | null> {
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    const email = data.session?.user.email
    return email ? { email } : null
  }
  return demoUser()
}

export async function signIn(email: string, password: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    return
  }
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw new Error('Invalid login credentials')
  }
  sessionStorage.setItem('pf:session', DEMO_EMAIL)
  demoListeners.forEach((cb) => cb(demoUser()))
}

export async function signOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut()
    return
  }
  sessionStorage.removeItem('pf:session')
  demoListeners.forEach((cb) => cb(null))
}

export function onAuthChange(cb: (user: SessionUser | null) => void): () => void {
  if (supabase) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user.email
      cb(email ? { email } : null)
    })
    return () => data.subscription.unsubscribe()
  }
  demoListeners.add(cb)
  return () => demoListeners.delete(cb)
}

// ---------- contact form ----------

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
  website: string // honeypot: real visitors leave it empty
}

// With Supabase the message goes to the "contact" edge function, which stores it
// and calls Brevo with a key kept on the server. Nothing secret runs in the browser.
export async function sendContact(payload: ContactPayload): Promise<void> {
  if (supabase) {
    const { data, error } = await supabase.functions.invoke('contact', { body: payload })
    if (error) throw new Error(error.message)
    if (data && data.ok === false) throw new Error(data.error ?? 'send failed')
    return
  }
  const message: Message = {
    id: newId(),
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
    read: false,
    created_at: new Date().toISOString(),
  }
  await save('messages', message)
}

// ---------- visit statistics ----------

export async function track(path: string, kind: PageView['kind'] = 'view'): Promise<void> {
  try {
    if (supabase) {
      await supabase.from('page_views').insert({ path, kind })
      return
    }
    const rows = localRead('page_views')
    rows.push({ id: newId(), path, kind, created_at: new Date().toISOString() })
    localWrite('page_views', rows.slice(-2000))
  } catch {
    // statistics must never break the page
  }
}

// ---------- file uploads ----------

export async function upload(file: File): Promise<string> {
  if (supabase) {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
    const path = `${Date.now()}-${safeName}`
    const { error } = await supabase.storage.from('media').upload(path, file)
    if (error) throw new Error(error.message)
    return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
  }
  if (file.size > 1_000_000) throw new Error('Demo mode: file must be under 1 MB')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}
