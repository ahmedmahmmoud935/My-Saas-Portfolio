'use client'

import React from 'react'

export default function Contact({
  title,
  subtitle,
  email,
  phone,
}: {
  title: string
  subtitle?: string
  email?: string
  phone?: string
}) {
  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-sub">{subtitle}</p>}
        </div>
        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault()
            // Wired to /api/contact (Resend) in Phase 4.
          }}
        >
          <div className="contact-row">
            <input placeholder="Name" name="name" required />
            <input placeholder="Email" name="email" type="email" required />
          </div>
          <input placeholder="Subject" name="subject" />
          <textarea placeholder="Message" name="message" rows={5} required />
          <button className="btn btn-primary" type="submit" style={{ justifyContent: 'center' }}>
            Send message
          </button>
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
