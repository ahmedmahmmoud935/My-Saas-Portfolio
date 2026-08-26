'use client'

import React from 'react'

type T = {
  title: string
  namePh: string
  rolePh: string
  companyPh: string
  contentPh: string
  ratingLabel: string
  photoLabel: string
  photoHint: string
  photoChange: string
  submit: string
  sending: string
  success: string
  error: string
}

export default function TestimonialForm({ username, t }: { username: string; t: T }) {
  const [rating, setRating] = React.useState(5)
  const [state, setState] = React.useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  // Shown back to the person so they can see what they attached.
  const [photo, setPhoto] = React.useState<string | null>(null)
  const photoInput = React.useRef<HTMLInputElement>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const form = e.currentTarget
    const fd = new FormData(form)
    setState('sending')
    try {
      // Sent as multipart so the photo can travel with it; the endpoint takes
      // either shape.
      fd.set('username', username)
      fd.set('rating', String(rating))
      const res = await fetch('/api/testimonial', { method: 'POST', body: fd })
      const data = (await res.json()) as { ok?: boolean }
      if (res.ok && data.ok) {
        setState('ok')
        form.reset()
        setRating(5)
        setPhoto(null)
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
      {/* Optional photo. A face makes a testimonial land; asking for one at
          the moment someone is already writing is the only time they'll add it. */}
      <div className="tf-photo">
        <button type="button" className="tf-photo-btn" onClick={() => photoInput.current?.click()}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" />
          ) : (
            <span className="tf-photo-plus">+</span>
          )}
        </button>
        <div className="tf-photo-text">
          <strong>{photo ? t.photoChange : t.photoLabel}</strong>
          <span>{t.photoHint}</span>
        </div>
        <input
          ref={photoInput}
          type="file"
          name="photo"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            setPhoto(f ? URL.createObjectURL(f) : null)
          }}
        />
      </div>

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
