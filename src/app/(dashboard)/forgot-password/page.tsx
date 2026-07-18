'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      /* ignore — we always show the same message so we don't leak which emails exist */
    }
    setBusy(false)
    setSent(true)
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>نسيت كلمة السر؟</h1>
        {sent ? (
          <>
            <p>لو الإيميل ده مسجّل عندنا، هيوصلك رابط لتعيين كلمة سر جديدة خلال دقائق.</p>
            <Link className="btn btn-primary" href="/login" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
              رجوع لتسجيل الدخول
            </Link>
          </>
        ) : (
          <>
            <p>اكتب إيميلك وهنبعتلك رابط تعيين كلمة سر جديدة.</p>
            <input
              className="field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
              {busy ? '...' : 'إرسال الرابط'}
            </button>
            <Link href="/login" className="login-link">
              رجوع لتسجيل الدخول
            </Link>
          </>
        )}
      </form>
    </div>
  )
}
