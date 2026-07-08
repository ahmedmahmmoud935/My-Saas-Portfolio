import React from 'react'

export default function Logos({
  title,
  items,
}: {
  title: string
  items: { id: number; name: string; logoUrl?: string | null; websiteUrl?: string | null }[]
}) {
  if (items.length === 0) return null
  return (
    <section className="section" id="logos">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="logo-strip">
          {items.map((l) => {
            const box = (
              <div className="logo-box">
                {l.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.logoUrl} alt={l.name} />
                ) : (
                  <span style={{ color: '#111', fontWeight: 700 }}>{l.name}</span>
                )}
              </div>
            )
            return l.websiteUrl ? (
              <a key={l.id} href={l.websiteUrl} target="_blank" rel="noopener noreferrer">
                {box}
              </a>
            ) : (
              <div key={l.id}>{box}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
