import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { SocialLinks } from '../components/Layout'
import { useApp, useSeo } from '../lib/app'
import { sendContact } from '../lib/db'
import type { ContactPayload } from '../lib/db'
import type { TKey } from '../lib/i18n'

type Field = 'name' | 'email' | 'subject' | 'message'
type Errors = Partial<Record<Field, { key: TKey; n?: number }>>

const empty: ContactPayload = { name: '', email: '', subject: '', message: '', website: '' }
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// The same rules are enforced again on the server (supabase/functions/contact).
export function validate(values: ContactPayload): Errors {
  const errors: Errors = {}
  const check = (field: Field, min: number, max: number) => {
    const value = values[field].trim()
    if (!value) errors[field] = { key: 'err.required' }
    else if (value.length < min) errors[field] = { key: 'err.min', n: min }
    else if (value.length > max) errors[field] = { key: 'err.max', n: max }
  }
  check('name', 2, 100)
  check('subject', 3, 150)
  check('message', 10, 5000)
  if (!values.email.trim()) errors.email = { key: 'err.required' }
  else if (!emailPattern.test(values.email.trim())) errors.email = { key: 'err.email' }
  return errors
}

export default function Contact() {
  const { t, c } = useApp()
  useSeo(t('nav.contact'), t('contact.lead'))
  const [values, setValues] = useState(empty)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'fail'>('idle')

  const errors = validate(values)
  const show = (field: Field) => (touched[field] ? errors[field] : undefined)
  const set = (field: keyof ContactPayload, value: string) => {
    setValues({ ...values, [field]: value })
    if (state !== 'sending') setState('idle')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, subject: true, message: true })
    if (Object.keys(errors).length) return
    setState('sending')
    try {
      await sendContact({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        website: values.website,
      })
      setValues(empty)
      setTouched({})
      setState('ok')
    } catch {
      setState('fail')
    }
  }

  const input = (field: Field, type: string, placeholder: string, autoComplete?: string) => {
    const error = show(field)
    const common = {
      id: field,
      name: field,
      className: error ? 'in er' : 'in',
      placeholder,
      value: values[field],
      'aria-invalid': !!error,
      'aria-describedby': error ? `${field}-error` : undefined,
      onBlur: () => setTouched({ ...touched, [field]: true }),
    }
    return (
      <div className="field">
        <label htmlFor={field}>
          {t(`f.${field}` as TKey)} <span className="req">*</span>
        </label>
        {type === 'textarea' ? (
          <textarea {...common} rows={6} onChange={(e) => set(field, e.target.value)} />
        ) : (
          <input {...common} type={type} autoComplete={autoComplete} onChange={(e) => set(field, e.target.value)} />
        )}
        {error && (
          <div className="em" id={`${field}-error`}>
            {t(error.key, { n: error.n ?? 0 })}
          </div>
        )}
      </div>
    )
  }

  return (
    <section className="sec wrap g2">
      <div className="col">
        <h1 className="h1s">{t('contact.title')}</h1>
        <p className="lead">{t('contact.lead')}</p>
        {c('email') && (
          <div className="info">
            <div className="lb">{t('contact.email')}</div>
            <a href={`mailto:${c('email')}`}>{c('email')}</a>
          </div>
        )}
        {c('location') && (
          <div className="info">
            <div className="lb">{t('contact.location')}</div>
            <span>{c('location')}</span>
          </div>
        )}
        {(c('linkedin') || c('github') || c('behance')) && (
          <div className="info">
            <div className="lb">{t('contact.social')}</div>
            <div className="chips">
              <SocialLinks className="chip ln" />
            </div>
          </div>
        )}
      </div>

      <div className="col">
        <form className="card form" onSubmit={submit} noValidate>
          {input('name', 'text', t('f.namePh'), 'name')}
          {input('email', 'email', 'nome@email.com', 'email')}
          {input('subject', 'text', t('f.subjectPh'))}
          {input('message', 'textarea', t('f.messagePh'))}
          {/* Honeypot: hidden from people, filled in by spam bots. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set('website', e.target.value)} />
          </div>
          <button className="bt block" type="submit" disabled={state === 'sending'}>
            {state === 'sending' ? t('f.sending') : t('f.send')}
          </button>
          <div aria-live="polite">
            {state === 'ok' && (
              <div className="ok">
                <Icon name="check" />
                {t('f.ok')}
              </div>
            )}
            {state === 'fail' && (
              <div className="fail" role="alert">
                <Icon name="alert" />
                {t('f.fail')}
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}

export function NotFound() {
  const { t } = useApp()
  useSeo(t('notfound.title'))
  return (
    <section className="sec wrap center">
      <h1 className="h1s">{t('notfound.title')}</h1>
      <div className="btns center">
        <Link to="/" className="bt">
          {t('notfound.back')}
        </Link>
      </div>
    </section>
  )
}
