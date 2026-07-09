import React from 'react'

export default function Testimonials({
  title,
  items,
  submitHref,
  submitLabel,
}: {
  title: string
  items: {
    id: number
    name: string
    role?: string | null
    company?: string | null
    content: string
    avatarUrl?: string | null
    rating?: number | null
  }[]
  submitHref?: string
  submitLabel?: string
}) {
  // Hide the whole section only when there's nothing to show AND no way to add one.
  if (items.length === 0 && !submitHref) return null
  return (
    <section className="section" id="testimonials">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="tst-grid">
          {items.map((t) => (
            <div className="tst" key={t.id}>
              <div style={{ color: 'var(--accent)', letterSpacing: 2 }}>
                {'★'.repeat(t.rating ?? 5)}
              </div>
              <p style={{ color: 'var(--text)', lineHeight: 1.8, margin: '10px 0 0' }}>
                {t.content}
              </p>
              <div className="tst-head">
                {t.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.avatarUrl} alt={t.name} />
                )}
                <div>
                  <strong style={{ fontSize: 14 }}>{t.name}</strong>
                  <div style={{ color: 'var(--sub)', fontSize: 12 }}>
                    {[t.role, t.company].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {submitHref && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <a
              href={submitHref}
              style={{
                display: 'inline-block',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                borderRadius: 12,
                padding: '11px 22px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {submitLabel || '+ أضف رأيك'}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
