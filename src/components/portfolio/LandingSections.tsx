import React from 'react'
import { resolveLink, type LandingCopy } from '@/lib/landing-copy'
import type { LandingLook } from '@/lib/landing-look'
import { frameStyle } from '@/lib/frame-style'
import { LineIcon, lineIconName } from '@/lib/line-icons'
import LandingStudio from './LandingStudio'
export type LandingShowcase = {
  name: string
  slug: string
  url: string
  title: string | null
  avatarUrl: string | null
  coverUrl: string | null
  frame: { zoom: number; x: number; y: number }
}
export function landingSections(
  c: LandingCopy,
  look: LandingLook,
  showcase: LandingShowcase[],
  locale: 'ar' | 'en',
) {
  const to = (url?: string) => resolveLink(url, resolveLink(c.ctaUrl))
  return {
    hero: (
      <section
        className="hero shell"
        style={
          {
            '--lp-h1-scale': (c.heroScale ?? 100) / 100,
            '--lp-h1-leading': (c.heroLeading ?? 100) / 100,
          } as React.CSSProperties
        }
        id="hero"
      >
        <div className="hero-copy">
          <p className="eyebrow">{c.heroEyebrow}</p>
          <h1>
            {c.heroTitle}
            {c.heroTitleBreak ? <br /> : ' '}
            <em>{c.heroTitleAccent}</em>
          </h1>
          <p className="lead">{c.heroSub}</p>
          <div className="actions">
            <a className="button primary" href={to(c.heroBtn1Url)}>
              {c.heroBtn1}
            </a>
            <a
              className="button outline"
              href={resolveLink(c.heroBtn2Url, showcase[0]?.url || '#showcase')}
            >
              {c.heroBtn2}
            </a>
          </div>
          <p className="trial-note">{c.heroNote}</p>
        </div>
        <div className="hero-art" aria-label={c.design.hero1}>
          <span className="orbit" aria-hidden="true">
            {'✳︎'}
          </span>
          <div className="mini-site">
            <div className="window-bar">
              <span dir="ltr">{c.design.hero2}</span>
              <i aria-hidden="true">{'● ● ●'}</i>
            </div>
            <div className="mini-body">
              <div className="mini-nav">
                <strong dir="ltr">{c.design.hero3}</strong>
                <span>{c.design.hero4}</span>
              </div>
              <div className="mini-title">
                <h2>
                  {c.design.hero5}
                  <br />
                  <em>{c.design.hero6}</em>
                </h2>
                <img
                  src={look.heroUrl || c.design.heroPortraitUrl}
                  style={
                    look.heroUrl
                      ? { filter: `brightness(${1 - look.heroDim / 100})` }
                      : undefined
                  }
                  alt={c.design.hero7}
                  width="90"
                  height="110"
                />
              </div>
              <div className="art-grid">
                <div className="art-tile violet">
                  <span>{c.design.hero8}</span>
                  <strong dir="ltr">
                    {c.design.hero9}
                    <br />
                    {c.design.hero10}
                  </strong>
                  <div className="tile-circle"></div>
                </div>
                <div className="art-tile apricot">
                  <span>{c.design.hero11}</span>
                  <strong>
                    {c.design.hero12}
                    <br />
                    {c.design.hero13}
                  </strong>
                  <b aria-hidden="true">{'✳︎'}</b>
                </div>
                <div className="art-tile olive">
                  <strong dir="ltr">
                    {c.design.hero14}
                    <br />
                    {c.design.hero15}
                  </strong>
                  <span>{c.design.hero16}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="floating-label">
            <span className="check">{'✓'}</span>
            <div>
              <strong>{c.design.hero17}</strong>
              <span>{c.design.hero18}</span>
            </div>
          </div>
          <div className="tiny-phone" aria-hidden="true">
            <div className="phone-notch"></div>
            <strong dir="ltr">
              {c.design.hero19}
              <br />
              {c.design.hero20}
              <br />
              <em>
                {c.design.hero21}
                <br />
                {c.design.hero22}
              </em>
            </strong>
            <img src={c.design.heroPhoneImageUrl} alt="" />
          </div>
        </div>
      </section>
    ),
    compare: (
      <section className="section shell compare" id="compare">
        <div className="section-heading">
          <p className="eyebrow">{c.compareEyebrow}</p>
          <h2>
            {c.compareTitle}
            <br />
            <em>{c.compareAccent}</em>
          </h2>
          <p>{c.compareSub}</p>
        </div>
        <div className="comparison">
          <div className="scattered">
            <span className="muted">{c.compareOldTitle}</span>
            {c.compareOld.map((text, i) => (
              <div
                className={`scrap scrap-${['one', 'two', 'three'][i % 3]}`}
                key={i}
              >
                {text}
                <span>
                  {
                    [
                      c.design.compareLabel1,
                      c.design.compareLabel2,
                      c.design.compareLabel3,
                    ][i]
                  }
                </span>
              </div>
            ))}
            <p>{c.design.compare1}</p>
          </div>
          <div className="together">
            <span className="logo" dir="ltr">
              {c.design.compare2}
              <span>{c.design.compare3}</span>
            </span>
            <h3>{c.compareNewTitle}</h3>
            <ul>
              {c.compareNew.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
            <span className="url-chip" dir="ltr">
              {c.design.compare4}
            </span>
          </div>
        </div>
        {c.compareLink && (
          <p className="center-heading">
            <a className="text-link" href={to(c.compareLinkUrl)}>
              {c.compareLink}
            </a>
          </p>
        )}
      </section>
    ),
    features: (
      <section className="section shell" id="features">
        <div className="center-heading">
          <p className="eyebrow">{c.featuresEyebrow}</p>
          <h2>
            {c.featuresTitle}
            <br />
            <em>{c.featuresAccent}</em>
          </h2>
          {c.featuresSub && <p>{c.featuresSub}</p>}
        </div>
        <div className="feature-grid">
          {c.features.map((f, i) => (
            <article
              key={i}
              style={
                f.bgUrl
                  ? { backgroundImage: `url(${JSON.stringify(f.bgUrl)})` }
                  : undefined
              }
            >
              <span className="feature-icon">
                {f.iconUrl ? (
                  f.iconTint !== false ? (
                    <span
                      className="reference-icon-tint"
                      style={{
                        maskImage: `url(${JSON.stringify(f.iconUrl)})`,
                        WebkitMaskImage: `url(${JSON.stringify(f.iconUrl)})`,
                      }}
                    />
                  ) : (
                    <img src={f.iconUrl} alt="" />
                  )
                ) : lineIconName(f.icon) ? (
                  <LineIcon name={lineIconName(f.icon)!} />
                ) : (
                  f.icon
                )}
              </span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </article>
          ))}
        </div>
        <div className="blog-line">
          <strong>{c.design.features1}</strong>
          <p>{c.design.features2}</p>
          <a href={c.design.features3}>{c.design.features4}</a>
        </div>
      </section>
    ),
    showcase: (
      <section className="showcase section" id="showcase">
        <div className="shell">
          <div className="split-heading">
            <div>
              <p className="eyebrow">{c.showcaseEyebrow}</p>
              <h2>
                {c.showcaseTitle}
                <br />
                <em>{c.showcaseAccent}</em>
              </h2>
            </div>
            <p>{c.showcaseSub}</p>
          </div>
          <div
            className={`showcase-grid ${look.showcaseLayout === 'slider' ? 'showcase-slider' : ''} sc-${look.showcaseStyle}`}
          >
            {showcase.length ? (
              showcase.map((s, i) => (
                <a className="showcase-card" key={s.slug} href={s.url}>
                  <div
                    className={`profile-preview ${i % 2 ? 'kamal-preview' : 'ahmed-preview'}`}
                  >
                    <div className="profile-text">
                      <span dir="ltr">{s.slug}</span>
                      <h3>{s.name}</h3>
                      <span>{s.title}</span>
                    </div>
                    {(look.showcaseStyle === 'cover'
                      ? s.coverUrl
                      : s.avatarUrl) && (
                      <div className="showcase-image">
                        <img
                          src={
                            (look.showcaseStyle === 'cover'
                              ? s.coverUrl
                              : s.avatarUrl)!
                          }
                          alt={s.name}
                          style={frameStyle(s.frame)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="showcase-caption">
                    <h3>{s.name}</h3>
                    <span>{c.visit}</span>
                  </div>
                </a>
              ))
            ) : (
              <p>{c.showcaseEmpty}</p>
            )}
          </div>
          <p className="visual-note">{c.design.showcase1}</p>
        </div>
      </section>
    ),
    how: (
      <section className="steps section shell" id="how">
        <div className="center-heading">
          <p className="eyebrow">{c.howEyebrow}</p>
          <h2>
            {c.howTitle}
            <br />
            <em>{c.howAccent}</em>
          </h2>
        </div>
        <div className="steps-grid">
          {c.how.map((s, i) => (
            <article key={i}>
              <span>{s.iconUrl ? <img src={s.iconUrl} alt="" /> : s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </article>
          ))}
        </div>
        {c.howBtn && (
          <p className="center-heading">
            <a className="button primary" href={to(c.howBtnUrl)}>
              {c.howBtn}
            </a>
          </p>
        )}
      </section>
    ),
    pricing: (
      <section className="pricing section" id="pricing">
        <div className="shell">
          <div className="center-heading">
            <p className="eyebrow">{c.pricingEyebrow}</p>
            <h2>
              {c.pricingTitle} <em>{c.pricingAccent}</em>
            </h2>
            <p>{c.pricingSub}</p>
          </div>
          <div className="price-grid">
            {c.plans.map((p, i) => (
              <article
                className={`price-card ${p.hi ? 'featured' : ''}`}
                key={i}
                style={
                  p.color
                    ? ({ '--accent': p.color } as React.CSSProperties)
                    : undefined
                }
              >
                {p.badge && <span className="best-value">{p.badge}</span>}
                <h3>{p.name}</h3>
                <div className="price">
                  <strong dir="ltr">{p.price}</strong>
                  <span>{p.per}</span>
                </div>
                <p>{p.note}</p>
                <a
                  className={`button ${p.hi ? 'primary' : 'outline'}`}
                  href={to(p.url)}
                >
                  {p.cta}
                </a>
                <ul>
                  {p.feats.map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="pricing-notes">
            {c.pricingIncludedTitle && (
              <strong>{c.pricingIncludedTitle}</strong>
            )}
            {c.pricingIncluded.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
            <p>{c.pricingNote}</p>
            <p>{c.design.pricingPaymentNote}</p>
          </div>
        </div>
      </section>
    ),
    faq: (
      <section className="faq section shell" id="faq">
        <div>
          <p className="eyebrow">{c.faqEyebrow}</p>
          <h2>
            {c.faqTitle} <em>{c.faqAccent}</em>
          </h2>
          <p>{c.design.faq1}</p>
          <a className="text-link" href={c.design.faq2}>
            {c.design.faq3}
          </a>
        </div>
        <div className="faq-list">
          {c.faqs.map((f, i) => (
            <details key={i} open={i === 0 ? true : undefined}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    ),
    cta: (
      <section className="final-cta" id="cta">
        <div className="shell">
          <span className="cta-star" aria-hidden="true">
            {'✳︎'}
          </span>
          <p className="eyebrow">{c.design.ctaEyebrow}</p>
          <h2>
            {c.ctaTitle} <em>{c.ctaAccent}</em>
          </h2>
          <p>{c.ctaSub}</p>
          <a className="button cream" href={to(c.ctaBtnUrl)}>
            {c.ctaBtn}
          </a>
          <span className="cta-note">{c.design.cta1}</span>
        </div>
      </section>
    ),
    studio: <LandingStudio c={c} locale={locale} />,
  }
}
export function LandingMobileTrial({ c }: { c: LandingCopy }) {
  return (
    <div className="mobile-trial">
      <span>{c.design.mobile1}</span>
      <a className="button primary" href={c.design.mobile2}>
        {c.design.mobile3}
      </a>
    </div>
  )
}
