'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token') || ''
    setToken(t)
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (pw.length < 8) return setErr('كلمة السر لازم تكون 8 أحرف على الأقل')
    if (pw !== pw2) return setErr('كلمتا السر مش متطابقتين')
    setBusy(true)
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pw }),
      })
      if (!res.ok) {
        setErr('الرابط غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا.')
        setBusy(false)
        return
      }
      setDone(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1200)
    } catch {
      setErr('حصل خطأ، حاول تاني')
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>تعيين كلمة السر</h1>
        {done ? (
          <p>تم ✓ جاري تحويلك للوحة التحكم...</p>
        ) : !token ? (
          <>
            <p>الرابط ناقص أو غير صالح.</p>
            <Link href="/forgot-password" className="login-link">اطلب رابطًا جديدًا</Link>
          </>
        ) : (
          <>
            <p>اختر كلمة سر جديدة للوحة التحكم.</p>
            <input className="field" type="password" placeholder="كلمة السر الجديدة" value={pw} onChange={(e) => setPw(e.target.value)} required />
            <input className="field" type="password" placeholder="تأكيد كلمة السر" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
            <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
              {busy ? '...' : 'حفظ والدخول'}
            </button>
            {err && <div className="login-err">{err}</div>}
          </>
        )}
      </form>
    </div>
  )
}
