import React from 'react'

export default function About({
  title,
  photoUrl,
  text,
  tags,
}: {
  title: string
  photoUrl?: string | null
  text?: string
  tags?: string[]
}) {
  return (
    <section className="section" id="about">
      <div className="container about">
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="about-photo" src={photoUrl} alt={title} />
        )}
        <div>
          <h2 className="section-title" style={{ textAlign: 'start', marginBottom: 16 }}>
            {title}
          </h2>
          {text && <p style={{ color: 'var(--sub)', lineHeight: 1.9, margin: 0 }}>{text}</p>}
          {tags && tags.length > 0 && (
            <div className="about-tags">
              {tags.map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
