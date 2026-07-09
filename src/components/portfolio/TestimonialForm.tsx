'use client'

import React from 'react'

type T = {
  title: string
  namePh: string
  rolePh: string
  companyPh: string
  contentPh: string
  ratingLabel: string
  submit: string
  sending: string
  success: string
  error: string
}

export default function TestimonialForm({ username, t }: { username: string; t: T }) {
  const [rating, setRating] = React.useState(5)
  const [state, setState] = React.useState<'idle' | 'sending' | 'ok' | 'err'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const form = e.currentTarget
    const fd = new FormData(form)
    setState('sending')
    try {
      const res = await fetch('/api/testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          name: fd.get('name'),
          role: fd.get('role'),
          company: fd.get('company'),
          content: fd.get('content'),
          rating,
        }),
      })
      const data = (await res.json()) as { ok?: boolean }
      if (res.ok && data.ok) {
        setState('ok')
        form.reset()
        setRating(5)
      } else {
        setState('err')
      }
    } catch {
      setState('err')
    }
  }

  if (state === 'ok') {
    return (
      <div className="tf-done" role="status">
        <div style={{ fontSize: 44, color: 'var(--accent)' }}>★</div>
        <p>{t.success}</p>
      </div>
    )
  }

  return (
    <form className="tf" onSubmit={onSubmit}>
      <input className="tf-in" name="name" placeholder={t.namePh} required maxLength={120} />
      <div className="tf-row">
        <input className="tf-in" name="role" placeholder={t.rolePh} maxLength={120} />
        <input className="tf-in" name="company" placeholder={t.companyPh} maxLength={120} />
      </div>
      <textarea
        className="tf-in"
        name="content"
        placeholder={t.contentPh}
        required
        rows={5}
        maxLength={2000}
      />
      <div className="tf-stars" aria-label={t.ratingLabel}>
        <span className="tf-stars-label">{t.ratingLabel}</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            className="tf-star"
            aria-pressed={n <= rating}
            onClick={() => setRating(n)}
            style={{ color: n <= rating ? 'var(--accent)' : 'var(--sub)' }}
          >
            ★
          </button>
        ))}
      </div>
      {state === 'err' && <p className="tf-err">{t.error}</p>}
      <button className="tf-btn" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? t.sending : t.submit}
      </button>
    </form>
  )
}
