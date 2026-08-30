import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { LANDING_COPY } from '@/lib/landing-copy'
import { mediaUrl } from '@/lib/portfolio'

// Owner-edited landing copy merged over the defaults (per locale).
type LandingLook = {
  accent: string
  bg: string
  bg2: string
  text: string
  subtext: string
  logoUrl: string | null
  heroUrl: string | null
  heroDim: number
  ogUrl: string | null
}

const DEFAULT_LOOK: LandingLook = {
  accent: '#F97316',
  bg: '#0A0A0A',
  bg2: '#111111',
  text: '#FFFFFF',
  subtext: '#9AA0AA',
  logoUrl: null,
  heroUrl: null,
  heroDim: 40,
  ogUrl: null,
}


/**
 * Black or white on top of the owner's accent, whichever stays readable.
 *
 * The accent is a free colour picker, so the label on an accent-filled button
 * can't be a fixed white: a yellow or mint accent leaves it barely visible.
 * Perceived luminance decides, with the threshold where the two contrast
 * ratios cross.
 */
function onAccent(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#FFFFFF'
  const n = parseInt(m[1], 16)
  const lin = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const L = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
  return L > 0.36 ? '#0A0A0A' : '#FFFFFF'
}

/** Saved colours, minus the blanks — a null column must not beat the default. */
function setOnly<T extends object>(o: unknown): Partial<T> {
  if (!o || typeof o !== 'object') return {}
  return Object.fromEntries(
    Object.entries(o as Record<string, unknown>).filter(([, v]) => v !== null && v !== ''),
  ) as Partial<T>
}

/** Copy plus the owner-set colours and imagery, merged over the code defaults. */
async function getLanding(locale: 'ar' | 'en') {
  const base = LANDING_COPY[locale]
  try {
    const payload = await getPayload({ config })
    const g = (await payload.findGlobal({ slug: 'landing', locale, depth: 1 })) as {
      content?: Record<string, unknown>
      theme?: Partial<LandingLook>
      images?: Record<string, unknown>
    }
    const saved = g?.content
    const im = g?.images ?? {}
    return {
      copy: saved && typeof saved === 'object' ? { ...base, ...saved } : base,
      look: {
        ...DEFAULT_LOOK,
        ...setOnly<LandingLook>(g?.theme),
        logoUrl: mediaUrl((im.logo as never) ?? null, 'thumb'),
        heroUrl: mediaUrl((im.hero as never) ?? null, 'card'),
        heroDim: (im.heroDim as number) ?? DEFAULT_LOOK.heroDim,
        ogUrl: mediaUrl((im.ogImage as never) ?? null, 'card'),
      } as LandingLook,
    }
  } catch {
    return { copy: base, look: DEFAULT_LOOK }
  }
}

// Touches the DB → render per-request.
export const dynamic = 'force-dynamic'

type Params = { searchParams?: Promise<{ lang?: string }> }

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || ''

export async function generateMetadata({ searchParams }: Params): Promise<Metadata> {
  const { lang } = (await searchParams) ?? {}
  const en = lang !== 'ar'
  const og = (await getLanding(en ? 'en' : 'ar')).look.ogUrl
  const title = 'ViralPX — بورتفوليو احترافي في دقائق'
  const description = en
    ? 'ViralPX is a multi-tenant portfolio builder: launch a hosted portfolio with projects, reels, articles and a contact form — on your own domain.'
    : 'ViralPX منصة بناء بورتفوليو احترافي: أطلق موقعك بمشاريعك وريلزك ومقالاتك ونموذج تواصل — على دومينك الخاص.'
  return {
    title,
    description,
    alternates: { canonical: SITE || undefined },
    openGraph: {
      title,
      description,
      type: 'website',
      url: SITE || undefined,
      images: og ? [og] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description, images: og ? [og] : undefined },
  }
}


async function getShowcase(): Promise<{ name: string; slug: string }[]> {
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({ collection: 'tenants', limit: 6, depth: 0, sort: '-createdAt' })
    return res.docs.map((t) => ({ name: t.name, slug: t.slug }))
  } catch {
    return []
  }
}

export default async function HomePage({ searchParams }: Params) {
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const { copy, look } = await getLanding(locale)
  const c = copy as (typeof LANDING_COPY)['ar']
  const q = locale === 'en' ? '?lang=en' : ''
  const showcase = await getShowcase()

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="lp" dir={locale === 'en' ? 'ltr' : 'rtl'} lang={locale}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="lp-nav">
        <a href={`/${q}`} className="lp-logo">
          {look.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={look.logoUrl} alt="ViralPX" className="lp-logo-img" />
          ) : (
            <>
              Viral<span>PX</span>
            </>
          )}
        </a>
        <nav className="lp-nav-links">
          <a href="#features">{c.nav.features}</a>
          <a href="#how">{c.nav.how}</a>
          <a href="#showcase">{c.nav.showcase}</a>
          <a href="#pricing">{c.nav.pricing}</a>
          <a href="#faq">{c.nav.faq}</a>
        </nav>
        <div className="lp-nav-actions">
          <a className="lp-lang" href={locale === 'en' ? '/?lang=ar' : '/'}>
            {locale === 'en' ? 'ع' : 'EN'}
          </a>
          <a className="lp-btn lp-btn-ghost" href="/login">
            {c.login}
          </a>
        </div>
      </header>

      <section className={`lp-hero${look.heroUrl ? ' has-image' : ''}`}>
        {look.heroUrl ? (
          <>
            <span className="lp-hero-img" style={{ backgroundImage: `url(${JSON.stringify(look.heroUrl)})` }} />
            <span className="lp-hero-dim" style={{ opacity: look.heroDim / 100 }} />
          </>
        ) : (
          <div className="lp-hero-glow" />
        )}
        <span className="lp-eyebrow">{c.heroEyebrow}</span>
        <h1 className="lp-h1">
          {c.heroTitle} <span className="lp-accent">{c.heroTitleAccent}</span>
        </h1>
        <p className="lp-lead">{c.heroSub}</p>
        <div className="lp-hero-btns">
          <a className="lp-btn lp-btn-primary" href="/login">
            {c.heroBtn1}
          </a>
          {showcase[0] && (
            <a className="lp-btn lp-btn-ghost" href={`/${showcase[0].slug}${q}`}>
              {c.heroBtn2}
            </a>
          )}
        </div>
      </section>

      <section className="lp-sec" id="features">
        <h2 className="lp-h2">{c.featuresTitle}</h2>
        <div className="lp-grid lp-grid-3">
          {c.features.map((f) => (
            <div className="lp-card" key={f.t}>
              <div className="lp-card-icon">{f.icon}</div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-sec" id="how">
        <h2 className="lp-h2">{c.howTitle}</h2>
        <div className="lp-grid lp-grid-3">
          {c.how.map((s) => (
            <div className="lp-step" key={s.n}>
              <div className="lp-step-n">{s.n}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-sec" id="showcase">
        <h2 className="lp-h2">{c.showcaseTitle}</h2>
        {showcase.length === 0 ? (
          <p className="lp-empty">{c.showcaseEmpty}</p>
        ) : (
          <div className="lp-grid lp-grid-3">
            {showcase.map((s) => (
              <a className="lp-tenant" href={`/${s.slug}${q}`} key={s.slug}>
                <div className="lp-tenant-badge">{s.name?.[0]?.toUpperCase() || 'V'}</div>
                <div className="lp-tenant-body">
                  <strong>{s.name}</strong>
                  <span>/{s.slug}</span>
                </div>
                <span className="lp-tenant-go">{c.visit} →</span>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="lp-sec" id="pricing">
        <h2 className="lp-h2">{c.pricingTitle}</h2>
        <div className="lp-grid lp-grid-2 lp-pricing">
          {c.plans.map((p) => (
            <div className={`lp-plan${p.hi ? ' lp-plan-hi' : ''}`} key={p.name}>
              <div className="lp-plan-name">{p.name}</div>
              <div className="lp-plan-price">
                <span>{p.price}</span>
                <small>{p.per}</small>
              </div>
              <ul>
                {p.feats.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <a className={`lp-btn ${p.hi ? 'lp-btn-primary' : 'lp-btn-ghost'}`} href="/login">
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-sec" id="faq">
        <h2 className="lp-h2">{c.faqTitle}</h2>
        <div className="lp-faq">
          {c.faqs.map((f) => (
            <details className="lp-faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="lp-cta">
        <div className="lp-cta-inner">
          <h2 className="lp-h2">{c.ctaTitle}</h2>
          <p>{c.ctaSub}</p>
          <a className="lp-btn lp-btn-primary lp-btn-lg" href="/login">
            {c.ctaBtn}
          </a>
        </div>
      </section>

      <footer className="lp-footer">
        <a href={`/${q}`} className="lp-logo">
          {look.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={look.logoUrl} alt="ViralPX" className="lp-logo-img" />
          ) : (
            <>
              Viral<span>PX</span>
            </>
          )}
        </a>
        <span>
          © {new Date().getFullYear()} ViralPX — {c.rights}
        </span>
      </footer>

      <style>{`
        .lp { --o: ${look.accent}; --lp-on-o: ${onAccent(look.accent)};
          --lp-bg: ${look.bg}; --lp-bg2: ${look.bg2};
          --lp-text: ${look.text}; --lp-sub: ${look.subtext};
          /* Hairlines and tints are derived, never fixed: a chosen background
             can be dark or light, and a fixed white hairline vanishes on one
             of them. */
          --lp-line: color-mix(in srgb, var(--lp-text) 9%, transparent);
          --lp-line-2: color-mix(in srgb, var(--lp-text) 20%, transparent);
          background: var(--lp-bg); color: var(--lp-text); overflow-x: hidden;
          font-family: var(--font-cairo), system-ui, sans-serif; }
        .lp a { text-decoration: none; color: inherit; }
        .lp-nav { position: sticky; top: 0; z-index: 20; display: flex; align-items: center;
          justify-content: space-between; gap: 16px; padding: 16px 24px;
          background: color-mix(in srgb, var(--lp-bg) 78%, transparent); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--lp-line); }
        .lp-logo { font-family: var(--font-montserrat), sans-serif; font-weight: 900; font-size: 22px; letter-spacing: -.5px; }
        .lp-logo span { color: var(--o); }
        .lp-logo-img { height: 34px; width: auto; display: block; }

        /* Hero image backdrop (falls back to the orange glow when unset). */
        .lp-hero.has-image { max-width: none; padding-inline: 24px; isolation: isolate; }
        .lp-hero-img { position: absolute; inset: 0; z-index: -2; background-size: cover;
          background-position: center; }
        .lp-hero-dim { position: absolute; inset: 0; z-index: -1; background: #000; }
        .lp-nav-links { display: flex; gap: 22px; font-size: 15px; }
        .lp-nav-links a { color: var(--lp-sub); }
        .lp-nav-links a:hover { color: var(--lp-text); }
        .lp-nav-actions { display: flex; align-items: center; gap: 10px; }
        .lp-lang { font-size: 13px; color: var(--lp-sub); border: 1px solid var(--lp-line-2);
          border-radius: 8px; padding: 6px 10px; }
        .lp-lang:hover { color: var(--lp-text); border-color: var(--o); }
        .lp-btn { display: inline-block; border-radius: 12px; padding: 11px 20px; font-weight: 700;
          font-size: 15px; cursor: pointer; transition: transform .12s, filter .12s, background .2s; }
        .lp-btn:hover { transform: translateY(-1px); }
        .lp-btn-primary { background: var(--o); color: var(--lp-on-o); }
        .lp-btn-primary:hover { filter: brightness(1.08); }
        .lp-btn-ghost { border: 1px solid var(--lp-line-2); color: var(--lp-text); }
        .lp-btn-ghost:hover { border-color: var(--o); color: var(--o); }
        .lp-btn-lg { padding: 15px 34px; font-size: 17px; }

        .lp-hero { position: relative; text-align: center; padding: 100px 24px 90px; max-width: 860px; margin: 0 auto; }
        .lp-hero-glow { position: absolute; inset: -10% 20% auto; height: 340px; z-index: 0;
          background: radial-gradient(closest-side, color-mix(in srgb, var(--o) 28%, transparent), transparent 70%); filter: blur(10px); }
        .lp-eyebrow, .lp-h1, .lp-lead, .lp-hero-btns { position: relative; z-index: 1; }
        .lp-eyebrow { display: inline-block; font-size: 13px; letter-spacing: 1px; color: var(--o);
          background: color-mix(in srgb, var(--o) 11%, transparent);
          border: 1px solid color-mix(in srgb, var(--o) 32%, transparent); padding: 6px 14px; border-radius: 999px; }
        .lp-h1 { font-size: clamp(38px, 8vw, 68px); line-height: 1.08; margin: 22px 0 0; font-weight: 900;
          font-family: var(--font-montserrat), var(--font-cairo), sans-serif; }
        .lp-accent { color: var(--o); }
        .lp-lead { font-size: clamp(16px, 2.6vw, 20px); color: var(--lp-sub); max-width: 620px; margin: 20px auto 0; line-height: 1.7; }
        .lp-hero-btns { display: flex; gap: 12px; justify-content: center; margin-top: 34px; flex-wrap: wrap; }

        .lp-sec { max-width: 1080px; margin: 0 auto; padding: 64px 24px; }
        .lp-h2 { text-align: center; font-size: clamp(26px, 5vw, 40px); font-weight: 900; margin: 0 0 44px;
          font-family: var(--font-montserrat), var(--font-cairo), sans-serif; }
        .lp-grid { display: grid; gap: 20px; }
        .lp-grid-3 { grid-template-columns: repeat(3, 1fr); }
        .lp-grid-2 { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 820px) { .lp-grid-3 { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .lp-grid-3, .lp-grid-2 { grid-template-columns: 1fr; } }

        .lp-card { background: var(--lp-bg2); border: 1px solid var(--lp-line); border-radius: 18px; padding: 26px; transition: border-color .2s, transform .2s; }
        .lp-card:hover { border-color: color-mix(in srgb, var(--o) 45%, transparent); transform: translateY(-3px); }
        .lp-card-icon { font-size: 30px; }
        .lp-card h3 { margin: 14px 0 8px; font-size: 19px; }
        .lp-card p, .lp-step p { color: var(--lp-sub); line-height: 1.7; margin: 0; font-size: 15px; }

        .lp-step { text-align: center; padding: 10px; }
        .lp-step-n { width: 52px; height: 52px; margin: 0 auto 14px; border-radius: 50%;
          display: grid; place-items: center; font-weight: 900; font-size: 22px; color: var(--o);
          background: color-mix(in srgb, var(--o) 13%, transparent);
          border: 1px solid color-mix(in srgb, var(--o) 36%, transparent); }
        .lp-step h3 { margin: 0 0 8px; font-size: 19px; }

        .lp-empty { text-align: center; color: var(--lp-sub); }
        .lp-tenant { display: flex; align-items: center; gap: 14px; background: var(--lp-bg2);
          border: 1px solid var(--lp-line); border-radius: 16px; padding: 18px; transition: border-color .2s, transform .2s; }
        .lp-tenant:hover { border-color: color-mix(in srgb, var(--o) 45%, transparent); transform: translateY(-3px); }
        .lp-tenant-badge { width: 46px; height: 46px; border-radius: 12px; flex: 0 0 auto;
          display: grid; place-items: center; font-weight: 900; font-size: 20px; color: var(--lp-on-o);
          background: linear-gradient(135deg, var(--o), color-mix(in srgb, var(--o) 55%, #000)); }
        .lp-tenant-body { display: flex; flex-direction: column; flex: 1 1 auto; min-width: 0; }
        .lp-tenant-body strong { font-size: 16px; }
        .lp-tenant-body span { color: var(--lp-sub); font-size: 13px; }
        .lp-tenant-go { color: var(--o); font-size: 13px; font-weight: 700; white-space: nowrap; }

        .lp-pricing { max-width: 760px; margin: 0 auto; }
        .lp-plan { background: var(--lp-bg2); border: 1px solid var(--lp-line); border-radius: 20px; padding: 30px; }
        .lp-plan-hi { border-color: var(--o); box-shadow: 0 0 0 1px var(--o), 0 20px 60px -30px color-mix(in srgb, var(--o) 60%, transparent); }
        .lp-plan-name { font-weight: 800; color: var(--o); letter-spacing: .5px; }
        .lp-plan-price { display: flex; align-items: baseline; gap: 8px; margin: 12px 0 20px; }
        .lp-plan-price span { font-size: 48px; font-weight: 900; }
        .lp-plan-price small { color: var(--lp-sub); font-size: 15px; }
        .lp-plan ul { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 12px; }
        .lp-plan li { color: color-mix(in srgb, var(--lp-text) 72%, var(--lp-sub)); font-size: 15px; }
        .lp-plan .lp-btn { width: 100%; text-align: center; }

        .lp-faq { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
        .lp-faq-item { background: var(--lp-bg2); border: 1px solid var(--lp-line); border-radius: 14px; padding: 4px 20px; }
        .lp-faq-item summary { cursor: pointer; padding: 16px 0; font-weight: 700; font-size: 16px; list-style: none; }
        .lp-faq-item summary::-webkit-details-marker { display: none; }
        .lp-faq-item summary::after { content: '+'; float: inline-end; color: var(--o); font-size: 22px; }
        .lp-faq-item[open] summary::after { content: '–'; }
        .lp-faq-item p { color: var(--lp-sub); line-height: 1.75; margin: 0 0 16px; }

        .lp-cta { padding: 24px; }
        .lp-cta-inner { max-width: 900px; margin: 0 auto; text-align: center; border-radius: 28px; padding: 64px 24px;
          background: radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--o) 19%, transparent), transparent 60%), var(--lp-bg2);
          border: 1px solid color-mix(in srgb, var(--o) 26%, transparent); }
        .lp-cta-inner p { color: var(--lp-sub); margin: 0 0 26px; font-size: 17px; }
        .lp-cta-inner .lp-h2 { margin-bottom: 14px; }

        .lp-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
          max-width: 1080px; margin: 0 auto; padding: 30px 24px 50px; color: var(--lp-sub); font-size: 14px;
          border-top: 1px solid var(--lp-line); }

        @media (max-width: 720px) { .lp-nav-links { display: none; } }
      `}</style>
    </div>
  )
}
