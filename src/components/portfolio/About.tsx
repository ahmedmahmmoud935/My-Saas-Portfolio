import React from 'react'

export default function About({
  title,
  photoUrl,
  text,
  tags,
  variant = 'classic',
}: {
  title: string
  photoUrl?: string | null
  text?: string
  tags?: string[]
  variant?: string
}) {
  return (
    <section className="section" id="about">
      <div className={`container about about-${variant}`}>
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="about-photo" src={photoUrl} alt={title} />
        )}
        <div>
          {/* Alignment comes from the layout's stylesheet. Set inline, `start`
              outranked it, and the centred layouts centred everything but
              their own heading. */}
          <h2 className="section-title about-title">{title}</h2>
          {text && <p style={{ color: 'var(--sub)', lineHeight: 1.9, margin: 0 }}>{text}</p>}
          {tags && tags.length > 0 && (
            <div className="about-tags">
              {tags.map((t) => (
                <span className="chip" key={t}>
                  <span className="chip-label">{t}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
