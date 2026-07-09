import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]!)

// Public contact form → email via Resend to the tenant's contact address.
export async function POST(req: Request) {
  try {
    const { tenant, name, email, subject, message } = (await req.json()) as {
      tenant?: number
      name?: string
      email?: string
      subject?: string
      message?: string
    }
    if (!tenant || !name || !email || !message) {
      return Response.json({ ok: false, error: 'missing fields' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const s = await payload.find({
      collection: 'site-settings',
      where: { tenant: { equals: tenant } },
      limit: 1,
      depth: 0,
      locale: 'ar',
    })
    const to = (s.docs[0]?.content as { contact?: { email?: string } })?.contact?.email
    if (!to) return Response.json({ ok: false, error: 'no recipient configured' }, { status: 400 })

    const key = process.env.RESEND_API_KEY
    if (!key) {
      // Email not configured — accept gracefully so the form still "works".
      return Response.json({ ok: true, note: 'email not configured' })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'ViralPX <onboarding@resend.dev>',
        to: [to],
        reply_to: email,
        subject: subject ? `[ViralPX] ${esc(subject)}` : `رسالة جديدة من ${esc(name)}`,
        html: `<div style="font-family:sans-serif">
          <p><strong>${esc(name)}</strong> &lt;${esc(email)}&gt;</p>
          ${subject ? `<p><em>${esc(subject)}</em></p>` : ''}
          <p style="white-space:pre-wrap">${esc(message)}</p>
        </div>`,
      }),
    })
    if (!res.ok) {
      return Response.json({ ok: false, error: 'send failed' }, { status: 502 })
    }
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}
