'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [useCode, setUseCode] = useState(false)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token')
    setToken(t)
    if (!t) setUseCode(true) // no link → default to the code form
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (pw.length < 8) return setErr('كلمة السر لازم تكون 8 أحرف على الأقل')
    if (pw !== pw2) return setErr('كلمتا السر مش متطابقتين')
    if (useCode && (!email || code.length !== 6)) return setErr('اكتب إيميلك والكود المكوّن من 6 أرقام')
    setBusy(true)
    try {
      const body = useCode ? { email, code, password: pw } : { token, password: pw }
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        setErr('البيانات غير صحيحة أو انتهت صلاحيتها. اطلب رابطًا/كودًا جديدًا.')
        setBusy(false)
        return
      }
      setDone(true)
      setTimeout(() => {
        router.push('/login')
        router.refresh()
      }, 1400)
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
          <p>تم ✓ دلوقتي سجّل دخولك بكلمة السر الجديدة.</p>
        ) : (
          <>
            <p>{useCode ? 'اكتب إيميلك والكود اللي وصلك، واختر كلمة سر جديدة.' : 'اختر كلمة سر جديدة للوحة التحكم.'}</p>

            {useCode && (
              <>
                <input className="field" dir="ltr" style={{ textAlign: 'start' }} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="field" dir="ltr" style={{ textAlign: 'center', letterSpacing: 6, fontSize: 18 }} inputMode="numeric" maxLength={6} placeholder="الكود (6 أرقام)" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
              </>
            )}

            <input className="field" type="password" placeholder="كلمة السر الجديدة" value={pw} onChange={(e) => setPw(e.target.value)} required />
            <input className="field" type="password" placeholder="تأكيد كلمة السر" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
            <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
              {busy ? '...' : 'حفظ والدخول'}
            </button>
            {err && <div className="login-err">{err}</div>}

            <button type="button" className="login-link" onClick={() => setUseCode((v) => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
              {useCode ? (token ? 'استخدام الرابط بدل الكود' : '') : 'معنديش الرابط — عندي كود'}
            </button>
            <Link href="/login" className="login-link">رجوع لتسجيل الدخول</Link>
          </>
        )}
      </form>
    </div>
  )
}
