'use client'

import React, { useState } from 'react'

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
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-sub">{subtitle}</p>}
        </div>
        <form className="contact-form" onSubmit={submit}>
          <div className="contact-row">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <textarea
            placeholder="Message"
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
            {status === 'sending' ? '...' : 'Send message'}
          </button>
          {status === 'ok' && (
            <p style={{ textAlign: 'center', color: '#22c55e' }}>تم الإرسال ✓ شكرًا لتواصلك.</p>
          )}
          {status === 'err' && (
            <p style={{ textAlign: 'center', color: '#ef4444' }}>حصل خطأ، حاول تاني.</p>
          )}
          {(email || phone) && (
            <p style={{ textAlign: 'center', color: 'var(--sub)', fontSize: 14 }}>
              {[email, phone].filter(Boolean).join('  ·  ')}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
