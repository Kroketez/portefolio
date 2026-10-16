// Supabase Edge Function: receives the contact form, saves the message and
// sends it by email through Brevo.
//
// It runs on Supabase's servers, so the Brevo API key stays out of the browser.
// Secrets it needs (set with `supabase secrets set NAME=value`):
//   BREVO_API_KEY        Brevo API key (Brevo > SMTP & API > API keys)
//   BREVO_SENDER_EMAIL   a sender address verified in Brevo
//   CONTACT_TO_EMAIL     where the messages should arrive (your own email)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ ok: false, error: 'method not allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: 'invalid body' }, 400)
  }

  const text = (key: string) => (typeof body[key] === 'string' ? (body[key] as string).trim() : '')
  const name = text('name')
  const email = text('email')
  const subject = text('subject')
  const message = text('message')

  // Honeypot field: people never see it, bots fill it in. Pretend it worked.
  if (text('website')) return json({ ok: true })

  // Same rules as the browser form; never trust the client alone.
  const invalid =
    name.length < 2 || name.length > 100 ||
    !emailPattern.test(email) || email.length > 200 ||
    subject.length < 3 || subject.length > 150 ||
    message.length < 10 || message.length > 5000
  if (invalid) return json({ ok: false, error: 'validation failed' }, 400)

  // 1. Save the message so it shows up in the backoffice even if the email fails.
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { error: dbError } = await admin.from('messages').insert({ name, email, subject, message })
  if (dbError) {
    console.error('could not save message', dbError.message)
    return json({ ok: false, error: 'could not save message' }, 500)
  }

  // 2. Send the notification email through Brevo.
  const apiKey = Deno.env.get('BREVO_API_KEY')
  const sender = Deno.env.get('BREVO_SENDER_EMAIL')
  const to = Deno.env.get('CONTACT_TO_EMAIL')
  if (!apiKey || !sender || !to) {
    console.error('Brevo secrets are not configured; message saved without email')
    return json({ ok: true, emailed: false })
  }

  const brevo = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Portefólio', email: sender },
      to: [{ email: to }],
      replyTo: { email, name },
      subject: `[Portefólio] ${subject}`,
      htmlContent:
        `<p><strong>Nome:</strong> ${escapeHtml(name)}<br>` +
        `<strong>Email:</strong> ${escapeHtml(email)}<br>` +
        `<strong>Assunto:</strong> ${escapeHtml(subject)}</p>` +
        `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    }),
  })

  if (!brevo.ok) {
    console.error('Brevo error', brevo.status, await brevo.text())
    // The message is already saved, so the visitor still gets a success reply.
    return json({ ok: true, emailed: false })
  }
  return json({ ok: true, emailed: true })
})
