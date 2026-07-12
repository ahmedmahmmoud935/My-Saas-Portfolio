import React from 'react'
import CardStack from './CardStack'

export function Expertise({
  title,
  items,
  layout = 'grid',
}: {
  title: string
  items: {
    title: string
    description?: string | null
    iconUrl?: string | null
    imageUrl?: string | null
    bgZoom?: number
    bgOverlay?: number
    bgPosX?: number
    bgPosY?: number
  }[]
  layout?: string
}) {
  if (items.length === 0) return null
  return (
    <section className="section" id="expertise">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
        </div>
        {layout === 'stack' ? (
          <CardStack items={items} />
        ) : (
          <div className="card-grid">
            {items.map((it, i) => (
              <div className="card" key={i}>
                <div className="ic">
                  {it.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.iconUrl} alt="" width={22} height={22} />
                  ) : (
                    <span>◆</span>
                  )}
                </div>
                <h4>{it.title}</h4>
                {it.description && <p>{it.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function Experience({
  title,
  items,
}: {
  title: string
  items: {
    company?: string | null
    role?: string | null
    period?: string | null
    description?: string | null
  }[]
}) {
  if (items.length === 0) return null
  return (
    <section className="section" id="experience">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
        </div>
        {items.map((it, i) => (
          <div className="exp-item" key={i}>
            <div>
              <strong style={{ fontSize: 16 }}>{it.company}</strong>
              <div className="role">
                {[it.role, it.description].filter(Boolean).join(' — ')}
              </div>
            </div>
            {it.period && <span className="period">{it.period}</span>}
          </div>
        ))}
      </div>
    </section>
  )
}

export function Tools({
  title,
  items,
}: {
  title: string
  items: { name?: string | null; iconUrl?: string | null }[]
}) {
  if (items.length === 0) return null
  return (
    <section className="section" id="tools">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="tools-grid">
          {items.map((it, i) => (
            <div className="tool" key={i} title={it.name || ''}>
              <span className="tool-idx">{String(i + 1).padStart(2, '0')}</span>
              {it.iconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="tool-ic" src={it.iconUrl} alt="" />
              )}
              <span className="tool-name">{it.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Education({
  title,
  items,
}: {
  title: string
  items: {
    title?: string | null
    org?: string | null
    period?: string | null
    description?: string | null
  }[]
}) {
  if (items.length === 0) return null
  return (
    <section className="section" id="education">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
        </div>
        {items.map((it, i) => (
          <div className="exp-item" key={i}>
            <div>
              <strong style={{ fontSize: 16 }}>{it.title}</strong>
              <div className="role">{[it.org, it.description].filter(Boolean).join(' — ')}</div>
            </div>
            {it.period && <span className="period">{it.period}</span>}
          </div>
        ))}
      </div>
    </section>
  )
}

export function Skills({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <section className="section" id="skills">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="chips-center">
          {items.map((s) => (
            <span className="chip" key={s}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
