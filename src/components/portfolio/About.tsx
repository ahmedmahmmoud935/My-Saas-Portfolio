import React from 'react'

export default function About({
  title,
  photoUrl,
  text,
  tags,
  variant = 'classic',
  frame,
  stat,
}: {
  title: string
  photoUrl?: string | null
  text?: string
  tags?: string[]
  variant?: string
  /** How the picture sits in its frame: filling or whole, and its focus. */
  frame?: { size?: string | null; posX?: number | null; posY?: number | null } | null
  /** A number laid on the photo ("6+") and what it counts — the studio look. */
  stat?: { value: string; label: string } | null
}) {
  const photo = photoUrl && (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="about-photo"
      src={photoUrl}
      alt={title}
      style={{
        objectFit: frame?.size === 'contain' ? 'contain' : 'cover',
        objectPosition: `${frame?.posX ?? 50}% ${frame?.posY ?? 50}%`,
      }}
    />
  )
  return (
    <section className="section" id="about">
      <div className={`container about about-${variant}`}>
        {photo && stat ? (
          <figure className="about-figure">
            {photo}
            <figcaption className="about-stat">
              <b dir="ltr">{stat.value}</b>
              {stat.label && <span>{stat.label}</span>}
            </figcaption>
          </figure>
        ) : (
          photo
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
