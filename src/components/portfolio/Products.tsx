import React from 'react'
import { safeHref } from '@/lib/safe-url'

export type ProductCard = {
  id: number
  title: string
  tag?: string | null
  description?: string | null
  details?: string | null
  imageUrl?: string | null
  url?: string | null
  btnLabel?: string | null
}

/**
 * "Beyond the image": the digital products a creative has built, a card each.
 *
 * A picture of the product on a soft panel, the kind of thing it is, what it
 * does, details that open in place, and a button to the live product in a new
 * tab. The details are a native <details>, so the section needs no script.
 */
export default function Products({
  title,
  subtitle,
  items,
  locale,
}: {
  title: string
  subtitle?: string | null
  items: ProductCard[]
  locale: 'ar' | 'en'
}) {
  if (!items.length) return null
  const en = locale === 'en'

  return (
    <section className="section" id="products">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-sub">{subtitle}</p>}
        </div>
        <div className={`prod-grid${items.length === 1 ? ' one' : ''}`}>
          {items.map((p) => {
            const href = p.url ? safeHref(p.url, '') : ''
            return (
              <article className="prod-card" key={p.id}>
                <div className="prod-shot">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.title} loading="lazy" />
                  ) : (
                    <span aria-hidden="true">{p.title?.[0] || '•'}</span>
                  )}
                </div>
                <div className="prod-body">
                  {p.tag && <span className="prod-tag">{p.tag}</span>}
                  <h3 className="prod-title">{p.title}</h3>
                  {p.description && <p className="prod-desc">{p.description}</p>}
                  {p.details && (
                    <details className="prod-more">
                      <summary>
                        <span>{en ? 'Details' : 'التفاصيل'}</span>
                        <i aria-hidden="true">↓</i>
                      </summary>
                      <p>{p.details}</p>
                    </details>
                  )}
                  {href && (
                    <a className="prod-btn" href={href} target="_blank" rel="noopener noreferrer">
                      <span>{p.btnLabel || (en ? 'Visit the site' : 'زور الموقع')}</span>
                      <i aria-hidden="true">↗</i>
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
