import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { LANDING_COPY } from '@/lib/landing-copy'
import { mediaUrl } from '@/lib/portfolio'
import SectionBg, { type SectionBgConfig } from '@/components/portfolio/SectionBg'
import LandingThemeToggle from '@/components/portfolio/LandingThemeToggle'
import Analytics from '@/components/portfolio/Analytics'
import { DEFAULT_LOOK, landingTokensCss, setOnly, type LandingLook } from '@/lib/landing-look'
import './landing.css'


/** Copy plus the owner-set colours and imagery, merged over the code defaults. */
async function getLanding(locale: 'ar' | 'en') {
  const base = LANDING_COPY[locale]
  try {
    const payload = await getPayload({ config })
    const g = (await payload.findGlobal({ slug: 'landing', locale, depth: 1 })) as {
      content?: Record<string, unknown>
      theme?: Partial<LandingLook>
      images?: Record<string, unknown>
      sectionBg?: Record<string, unknown>[]
      style?: { showcase?: string | null; card?: string | null }
      seoTools?: { searchConsole?: string | null; analyticsId?: string | null }
    }
    const saved = g?.content
    const im = g?.images ?? {}
    // Keyed by section: the page asks for one by id while it renders, and only
    // the last row for a section can win anyway.
    const sections: Record<string, SectionBgConfig> = {}
    for (const r of g?.sectionBg ?? []) {
      const id = r.section as string
      if (!id) continue
      sections[id] = {
        mode: (r.mode as string) || 'color',
        color: (r.color as string) || null,
        imageUrl: mediaUrl((r.image as never) ?? null, 'card'),
        videoUrl: (r.videoUrl as string) || null,
        fixed: Boolean(r.fixed),
        dim: (r.dim as number) ?? 45,
        posX: (r.posX as number) ?? 50,
        posY: (r.posY as number) ?? 50,
      }
    }
    return {
      copy: saved && typeof saved === 'object' ? { ...base, ...saved } : base,
      tools: g?.seoTools ?? {},
      sections,
      look: {
        ...DEFAULT_LOOK,
        ...setOnly<LandingLook>(g?.theme),
        logoUrl: mediaUrl((im.logo as never) ?? null, 'thumb'),
        heroUrl: mediaUrl((im.hero as never) ?? null, 'card'),
        heroDim: (im.heroDim as number) ?? DEFAULT_LOOK.heroDim,
        ogUrl: mediaUrl((im.ogImage as never) ?? null, 'card'),
        showcaseStyle: g?.style?.showcase || DEFAULT_LOOK.showcaseStyle,
        cardStyle: g?.style?.card || DEFAULT_LOOK.cardStyle,
      } as LandingLook,
    }
  } catch {
    return {
      copy: base,
      tools: {} as { searchConsole?: string | null; analyticsId?: string | null },
      sections: {} as Record<string, SectionBgConfig>,
      look: DEFAULT_LOOK,
    }
  }
}

// Touches the DB → render per-request.
export const dynamic = 'force-dynamic'

type Params = { searchParams?: Promise<{ lang?: string }> }

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || ''

export async function generateMetadata({ searchParams }: Params): Promise<Metadata> {
  const { lang } = (await searchParams) ?? {}
  const en = lang !== 'ar'
  const landing = await getLanding(en ? 'en' : 'ar')
  const look = landing.look
  // Falls back to the hero picture when no share image has been set, so a
  // shared link is never a bare grey card.
  const og = look.ogUrl || look.heroUrl
  const title = 'ViralPX — بورتفوليو احترافي في دقائق'
  const description = en
    ? 'ViralPX is a multi-tenant portfolio builder: launch a hosted portfolio with projects, reels, articles and a contact form — on your own domain.'
    : 'ViralPX منصة بناء بورتفوليو احترافي: أطلق موقعك بمشاريعك وريلزك ومقالاتك ونموذج تواصل — على دومينك الخاص.'
  return {
    title,
    description,
    verification: landing.tools?.searchConsole
      ? { google: landing.tools.searchConsole }
      : undefined,
    alternates: {
      canonical: SITE || undefined,
      // The landing is the one page that never carried these.
      languages: SITE
        ? { ar: `${SITE}/?lang=ar`, en: `${SITE}/?lang=en`, 'x-default': SITE }
        : undefined,
    },
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


type ShowcaseItem = {
  name: string
  slug: string
  title: string | null
  avatarUrl: string | null
  coverUrl: string | null
}

/**
 * The portfolios shown on the landing page, with the face and the one-line
 * title each of them already publishes.
 *
 * The card used to have nothing but a name and the first letter of it in a
 * coloured square — six identical squares said nothing about the work behind
 * them. Their settings are fetched in one query, not one per tenant.
 */
async function getShowcase(): Promise<ShowcaseItem[]> {
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({ collection: 'tenants', limit: 6, depth: 0, sort: '-createdAt' })
    const tenants = res.docs
    if (!tenants.length) return []

    const settings = await payload.find({
      collection: 'site-settings',
      where: { tenant: { in: tenants.map((t) => t.id) } },
      limit: tenants.length,
      depth: 1,
    })
    const byTenant = new Map<number, (typeof settings.docs)[number]>()
    for (const doc of settings.docs) {
      const owner = doc.tenant
      const id = typeof owner === 'object' ? owner?.id : owner
      if (typeof id === 'number') byTenant.set(id, doc)
    }

    return tenants.map((t) => {
      const st = byTenant.get(t.id)
      const brand = (st?.brand ?? {}) as Record<string, unknown>
      const hero = ((st?.content as Record<string, unknown>)?.hero ?? {}) as Record<string, unknown>
      return {
        name: t.name,
        slug: t.slug,
        title: (hero.title as string) || null,
        // Whichever picture of themselves they have set, in the order a person
        // would expect to be recognised by.
        avatarUrl:
          mediaUrl((brand.avatar as never) ?? null, 'thumb') ||
          mediaUrl((brand.photo as never) ?? null, 'thumb') ||
          mediaUrl((brand.brandLogo as never) ?? null, 'thumb'),
        coverUrl:
          mediaUrl((brand.heroCover as never) ?? null, 'card') ||
          mediaUrl((brand.photo as never) ?? null, 'card'),
      }
    })
  } catch {
    return []
  }
}

export default async function HomePage({ searchParams }: Params) {
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const { copy, look, sections, tools } = await getLanding(locale)
  const c = copy as (typeof LANDING_COPY)['ar']
  const q = locale === 'en' ? '?lang=en' : ''
  const showcase = await getShowcase()
  const showcaseStyle = look.showcaseStyle
  const cardStyle = look.cardStyle

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
    <div className="lp" data-card={cardStyle} dir={locale === 'en' ? 'ltr' : 'rtl'} lang={locale}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Analytics id={tools?.analyticsId} />
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
          {/* The blog is the only part of this site that can rank for anything
              other than the product's own name. */}
          <a href={`/blog?lang=${locale}`}>{locale === 'en' ? 'Blog' : 'المدوّنة'}</a>
        </nav>
        <div className="lp-nav-actions">
          <a className="lp-lang" href={locale === 'en' ? '/?lang=ar' : '/'}>
            {locale === 'en' ? 'ع' : 'EN'}
          </a>
          <LandingThemeToggle />
          <a className="lp-btn lp-btn-ghost" href="/login">
            {c.login}
          </a>
        </div>
      </header>

      <SectionBg config={sections.hero}>
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
      </SectionBg>

      <SectionBg config={sections.features}>
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
      </SectionBg>

      <SectionBg config={sections.how}>
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
      </SectionBg>

      <SectionBg config={sections.showcase}>
        <section className="lp-sec" id="showcase">
          <h2 className="lp-h2">{c.showcaseTitle}</h2>
          {showcase.length === 0 ? (
            <p className="lp-empty">{c.showcaseEmpty}</p>
          ) : (
            <div className={`lp-grid lp-grid-3 lp-showcase sc-${showcaseStyle}`}>
              {showcase.map((s) => (
                <a className="lp-tenant" href={`/${s.slug}${q}`} key={s.slug}>
                  <span className="lp-tenant-badge">
                    {(showcaseStyle === 'cover' ? s.coverUrl : s.avatarUrl) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={(showcaseStyle === 'cover' ? s.coverUrl : s.avatarUrl) as string}
                        alt={s.name}
                      />
                    ) : (
                      // No picture set — the initial, as before.
                      s.name?.[0]?.toUpperCase() || 'V'
                    )}
                  </span>
                  <span className="lp-tenant-body">
                    <strong>{s.name}</strong>
                    <span>{s.title || `/${s.slug}`}</span>
                  </span>
                  <span className="lp-tenant-go">{c.visit} →</span>
                </a>
              ))}
            </div>
          )}
        </section>
      </SectionBg>

      <SectionBg config={sections.pricing}>
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
      </SectionBg>

      <SectionBg config={sections.faq}>
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
      </SectionBg>

      <SectionBg config={sections.cta}>
        <section className="lp-cta">
          <div className="lp-cta-inner">
            <h2 className="lp-h2">{c.ctaTitle}</h2>
            <p>{c.ctaSub}</p>
            <a className="lp-btn lp-btn-primary lp-btn-lg" href="/login">
              {c.ctaBtn}
            </a>
          </div>
        </section>
      </SectionBg>

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
          <a href={`/blog?lang=${locale}`} style={{ marginInlineEnd: 14 }}>
            {locale === 'en' ? 'Blog' : 'المدوّنة'}
          </a>
          © {new Date().getFullYear()} ViralPX — {c.rights}
        </span>
      </footer>

      <style>{landingTokensCss(look)}</style>
    </div>
  )
}
