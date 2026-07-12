'use client'

import React, { useState } from 'react'

const IconMail = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
)
const IconPhone = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.8 9.8a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
  </svg>
)

export default function Contact({
  title,
  subtitle,
  email,
  phone,
  tenant,
}: {
  title: string
  subtitle?: string
  email?: string
  phone?: string
  tenant: number
}) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant, ...form }),
      })
      if (res.ok) {
        setStatus('ok')
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus('err')
      }
    } catch {
      setStatus('err')
    }
  }

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="contact-grid">
          {/* ── Left: info ─────────────────────────────────────────── */}
          <div className="contact-info">
            <span className="contact-eyebrow">Contact</span>
            <h2 className="contact-title">{title}</h2>
            {subtitle && <p className="contact-lead">{subtitle}</p>}

            <div className="contact-lines">
              {email && (
                <a className="contact-line" href={`mailto:${email}`}>
                  <span className="contact-ic">{IconMail}</span>
                  <span className="contact-line-txt">
                    <strong>Email</strong>
                    <em dir="ltr">{email}</em>
                  </span>
                </a>
              )}
              {phone && (
                <a className="contact-line" href={`tel:${phone.replace(/\s+/g, '')}`}>
                  <span className="contact-ic">{IconPhone}</span>
                  <span className="contact-line-txt">
                    <strong>Phone</strong>
                    <em dir="ltr">{phone}</em>
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* ── Right: form card ───────────────────────────────────── */}
          <form className="contact-card" onSubmit={submit}>
            <h3 className="contact-card-title">Send a message</h3>
            <p className="contact-card-sub">املأ النموذج وهنرد عليك في أقرب وقت.</p>

            <div className="contact-row">
              <input
                placeholder="الاسم"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                placeholder="البريد الإلكتروني"
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <input
              placeholder="الموضوع"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <textarea
              placeholder="رسالتك"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={status === 'sending'}
              style={{ justifyContent: 'center' }}
            >
              {status === 'sending' ? '...' : 'إرسال الرسالة'}
            </button>
            {status === 'ok' && (
              <p className="contact-note" style={{ color: '#22c55e' }}>تم الإرسال ✓ شكرًا لتواصلك.</p>
            )}
            {status === 'err' && (
              <p className="contact-note" style={{ color: '#ef4444' }}>حصل خطأ، حاول تاني.</p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
