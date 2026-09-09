import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { LANDING_COPY, mergeCopy } from '@/lib/landing-copy'
import { resolveVideoUrl } from '@/lib/video'
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
      style?: {
        showcase?: string | null
        card?: string | null
        fontAr?: string | null
        fontLatin?: string | null
      }
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
      copy: mergeCopy(base, saved),
      tools: g?.seoTools ?? {},
      sections,
      look: {
        ...DEFAULT_LOOK,
        ...setOnly<LandingLook>(g?.theme),
        logoUrl: mediaUrl((im.logo as never) ?? null, 'thumb'),
        heroUrl: mediaUrl((im.hero as never) ?? null, 'card'),
        heroDim: (im.heroDim as number) ?? DEFAULT_LOOK.heroDim,
        ogUrl: mediaUrl((im.ogImage as never) ?? null, 'card'),
        // The original: this one is looked at, and a video has no 'card' size.
        panelUrl: mediaUrl((im.panel as never) ?? null),
        panelKind: im.panel
          ? ((im.panel as { mimeType?: string | null }).mimeType?.startsWith('video/')
              ? 'video'
              : 'image')
          : null,
        panelVideoUrl: (im.panelVideoUrl as string) || null,
        showcaseStyle: g?.style?.showcase || DEFAULT_LOOK.showcaseStyle,
        cardStyle: g?.style?.card || DEFAULT_LOOK.cardStyle,
        fontAr: g?.style?.fontAr || DEFAULT_LOOK.fontAr,
        fontLatin: g?.style?.fontLatin || DEFAULT_LOOK.fontLatin,
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

/**
 * The three numbers on the page, counted rather than typed.
 *
 * A landing page is the worst place to keep a figure that has stopped being
 * true, and a hand-written one goes stale the day after it is written. These
 * come from the same tables the product runs on.
 *
 * Below a floor they are hidden entirely: a bar announcing five portfolios
 * argues against the product it is meant to sell, and an empty section is the
 * more honest of the two.
 */
async function getStats(): Promise<{ sites: number; projects: number; visits: number } | null> {
  try {
    const payload = await getPayload({ config })
    const count = async (collection: 'tenants' | 'projects' | 'visits', where?: object) =>
      (await payload.count({ collection, where: where as never })).totalDocs
    const [sites, projects, visits] = await Promise.all([
      count('tenants', { suspended: { not_equals: true } }),
      count('projects', { published: { equals: true } }),
      count('visits'),
    ])
    return sites >= STATS_FLOOR ? { sites, projects, visits } : null
  } catch {
    return null
  }
}

/** Portfolios needed before the numbers are worth showing. */
const STATS_FLOOR = 12

export default async function HomePage({ searchParams }: Params) {
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const { copy, look, sections, tools } = await getLanding(locale)
  const c = copy as (typeof LANDING_COPY)['ar']
  const q = locale === 'en' ? '?lang=en' : ''
  const [showcase, stats] = await Promise.all([getShowcase(), getStats()])
  const n = new Intl.NumberFormat(locale === 'en' ? 'en' : 'ar-EG')
  // A link is the fallback for the panel, not a competitor: an uploaded file
  // is the more deliberate choice, so it wins whenever there is one.
  const panelLink = look.panelUrl ? null : resolveVideoUrl(look.panelVideoUrl)
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
    <div
      className="lp"
      data-card={cardStyle}
      data-font-ar={look.fontAr}
      data-font-latin={look.fontLatin}
      dir={locale === 'en' ? 'ltr' : 'rtl'}
      lang={locale}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Analytics id={tools?.analyticsId} />
      <SectionBg config={sections.header}>
      <header className="lp-nav">
        <a href={`/${q}`} className="lp-logo">
          {look.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={look.logoUrl} alt="ViralPX" className="lp-logo-img" />
          ) : (
            <>
              <span className="lp-logo-mark" aria-hidden="true">
                <i />
              </span>
              <span className="lp-logo-text">
                <span>
                  Viral<span>PX</span>
                </span>
                <span className="lp-tagline">{c.tagline}</span>
              </span>
            </>
          )}
        </a>
        <nav className="lp-nav-links">
          <a href="#features">{c.nav.features}</a>
          <a href="#showcase">{c.nav.showcase}</a>
          <a href="#compare">{c.nav.compare}</a>
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
          <a className="lp-nav-login" href="/login">
            {c.login}
          </a>
          <a className="lp-btn lp-btn-primary lp-arrow" href="/login">
            <span className="lp-btn-label">{c.cta}</span>
          </a>
        </div>
      </header>
      </SectionBg>

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
          <h1
            className="lp-h1"
            style={
              {
                '--lp-h1-scale': (c.heroScale ?? 100) / 100,
                '--lp-h1-leading': (c.heroLeading ?? 100) / 100,
              } as React.CSSProperties
            }
          >
            {c.heroTitle} <span className="lp-accent">{c.heroTitleAccent}</span>
          </h1>
          <p className="lp-lead">{c.heroSub}</p>
          <div className="lp-hero-btns">
            <a className="lp-btn lp-btn-primary lp-btn-lg lp-arrow" href="/login">
              <span className="lp-btn-label">{c.heroBtn1}</span>
            </a>
            {showcase[0] && (
              <a className="lp-btn lp-btn-ghost lp-btn-lg" href={`/${showcase[0].slug}${q}`}>
                <span className="lp-btn-label">{c.heroBtn2}</span>
              </a>
            )}
          </div>

        </section>
      </SectionBg>

      <SectionBg config={sections.panel}>
        <section className="lp-panel-sec" id="panel">
          <div className="lp-sec-head">
            <span className="lp-eyebrow-sm">{c.panelEyebrow}</span>
            <h2 className="lp-h2">{c.panelHeading}</h2>
          </div>

          {/* A band of its own, below the hero rather than inside it: on the
              hero's backdrop the panel read as a card dropped onto a
              photograph. Here it has its own ground, and its own entry in the
              section-backdrop list. Until something is uploaded it holds a
              drawing of the product, so the band is never an empty frame. */}
          <figure className="lp-mock">
            <figcaption className="lp-mock-bar">
              <span className="lp-mock-dots" aria-hidden="true" />
              {c.panelTitle}
            </figcaption>

            {look.panelUrl && look.panelKind === 'video' ? (
              <video
                className="lp-mock-media"
                src={look.panelUrl}
                poster={look.heroUrl ?? undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : !look.panelUrl && panelLink ? (
              panelLink.kind === 'file' ? (
                <video
                  className="lp-mock-media"
                  src={panelLink.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <iframe
                  className="lp-mock-media"
                  src={panelLink.url}
                  title={c.panelTitle}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : look.panelUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="lp-mock-media" src={look.panelUrl} alt={c.panelTitle} />
            ) : (
              <div className="lp-mock-frame" aria-hidden="true">
              <aside className="lp-mock-side">
                <div className="lp-mock-side-head">{c.mock.panel}</div>
                <ul>
                  {c.mock.items.map((it, i) => (
                    <li className={i === 0 ? 'on' : undefined} key={it}>
                      <span>{it}</span>
                      {i === 0 && <b>12</b>}
                    </li>
                  ))}
                </ul>
              </aside>
              <div className="lp-mock-main">
                <div className="lp-mock-circles">
                  {c.mock.circles.map((t) => (
                    <span key={t}>
                      <i />
                      {t}
                    </span>
                  ))}
                </div>
                <div className="lp-mock-cards">
                  {c.mock.cards.map((t, i) => (
                    <span className="lp-mock-card" key={t}>
                      <em>{i === 2 ? 'Brand' : 'Reel 9:16'}</em>
                      <b>{t}</b>
                    </span>
                  ))}
                </div>
              </div>
              </div>
            )}
          </figure>
        </section>
      </SectionBg>

      {stats && (
        <section className="lp-metrics">
          <div className="lp-metrics-in">
            <div className="lp-metric">
              <b>{n.format(stats.sites)}</b>
              <span>{c.metricsLabels.sites}</span>
            </div>
            <div className="lp-metric">
              <b>{n.format(stats.projects)}</b>
              <span>{c.metricsLabels.projects}</span>
            </div>
            <div className="lp-metric">
              <b>{n.format(stats.visits)}</b>
              <span>{c.metricsLabels.visits}</span>
            </div>
          </div>
        </section>
      )}

      <SectionBg config={sections.features}>
        <section className="lp-sec" id="features">
          <div className="lp-sec-head">
            <span className="lp-eyebrow-sm">{c.featuresEyebrow}</span>
            <h2 className="lp-h2">{c.featuresTitle}</h2>
          </div>
          {/* Two of the six get a double-width card. Six equal rectangles gave
              the eye nowhere to land first; which two is a property of the
              layout, so it is decided here and not in the copy. */}
          <div className="lp-bento">
            {c.features.map((f, i) => (
              <div className={`lp-card${i === 0 || i === 3 ? ' wide' : ''}`} key={f.t}>
                <div className="lp-card-icon">
                  {f.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.iconUrl} alt="" />
                  ) : (
                    f.icon
                  )}
                </div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </section>
      </SectionBg>

      <SectionBg config={sections.how}>
        <section className="lp-sec" id="how">
          <div className="lp-sec-head">
            <span className="lp-eyebrow-sm">{c.howEyebrow}</span>
            <h2 className="lp-h2">{c.howTitle}</h2>
          </div>
          <div className="lp-grid lp-grid-3">
            {c.how.map((s) => (
              <div className="lp-step" key={s.n}>
                <div className="lp-step-n">
                  {s.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.iconUrl} alt="" />
                  ) : (
                    s.n
                  )}
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      </SectionBg>

      <SectionBg config={sections.showcase}>
        <section className="lp-sec" id="showcase">
          <div className="lp-sec-head">
            <span className="lp-eyebrow-sm">{c.showcaseEyebrow}</span>
            <h2 className="lp-h2">{c.showcaseTitle}</h2>
          </div>
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

      <SectionBg config={sections.compare}>
        <section className="lp-sec" id="compare">
          <div className="lp-sec-head">
            <span className="lp-eyebrow-sm">{c.compareEyebrow}</span>
            <h2 className="lp-h2">{c.compareTitle}</h2>
          </div>
          <div className="lp-vs">
            <div className="lp-vs-col lp-vs-good">
              <span className="lp-vs-tag">ViralPX</span>
              <h3>✓ {c.compareNewTitle}</h3>
              <ul>
                {c.compareNew.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="lp-vs-col lp-vs-bad">
              <h3>✕ {c.compareOldTitle}</h3>
              <ul>
                {c.compareOld.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </SectionBg>

      <SectionBg config={sections.pricing}>
        <section className="lp-sec" id="pricing">
          <div className="lp-sec-head">
            <span className="lp-eyebrow-sm">{c.pricingEyebrow}</span>
            <h2 className="lp-h2">{c.pricingTitle}</h2>
          </div>
          <div className="lp-grid lp-grid-2 lp-pricing">
            {c.plans.map((p) => (
              <div className={`lp-plan${p.hi ? ' lp-plan-hi' : ''}`} key={p.name}>
                {p.hi && <span className="lp-plan-tag">{locale === 'en' ? 'Most popular' : 'الأكثر طلباً'}</span>}
                <div className="lp-plan-name">{p.name}</div>
                <div className="lp-plan-price">
                  <span>{p.price}</span>
                  <small>{p.per}</small>
                </div>
                <ul>
                  {p.feats.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a className={`lp-btn lp-btn-lg ${p.hi ? 'lp-btn-primary lp-arrow' : 'lp-btn-ghost'}`} href="/login">
                  <span className="lp-btn-label">{p.cta}</span>
                </a>
              </div>
            ))}
          </div>
        </section>
      </SectionBg>

      <SectionBg config={sections.faq}>
        <section className="lp-sec" id="faq">
          <div className="lp-sec-head">
            <span className="lp-eyebrow-sm">{c.faqEyebrow}</span>
            <h2 className="lp-h2">{c.faqTitle}</h2>
          </div>
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
            <a className="lp-btn lp-btn-primary lp-btn-lg lp-arrow" href="/login">
              <span className="lp-btn-label">{c.ctaBtn}</span>
            </a>
          </div>
        </section>
      </SectionBg>

      <SectionBg config={sections.footer}>
        <footer className="lp-footer">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <a href={`/${q}`} className="lp-logo">
                {look.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={look.logoUrl} alt="ViralPX" className="lp-logo-img" />
                ) : (
                  <>
                    <span className="lp-logo-mark" aria-hidden="true">
                      <i />
                    </span>
                    <span className="lp-logo-text">
                      <span>
                        Viral<span>PX</span>
                      </span>
                      <span className="lp-tagline">{c.tagline}</span>
                    </span>
                  </>
                )}
              </a>
              {c.footerNote && <p>{c.footerNote}</p>}
            </div>

            <nav className="lp-footer-links">
              <strong>{c.footerLinksTitle}</strong>
              {/* The blog is listed by the page rather than by the owner: it is
                  the one part of this site that can rank for something other
                  than the product's own name, so it should not be one edit away
                  from having no link into it. */}
              <a href={`/blog?lang=${locale}`}>{locale === 'en' ? 'Blog' : 'المدوّنة'}</a>
              {c.footerLinks
                .filter((l) => l.label && l.url)
                .map((l) => (
                  <a key={l.url + l.label} href={l.url.startsWith('#') ? `/${q}${l.url}` : l.url}>
                    {l.label}
                  </a>
                ))}
            </nav>
          </div>

          <div className="lp-footer-base">
            © {new Date().getFullYear()} ViralPX — {c.rights}
          </div>
        </footer>
      </SectionBg>

      <style>{landingTokensCss(look)}</style>
    </div>
  )
}
