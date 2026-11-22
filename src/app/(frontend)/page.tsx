import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { LANDING_COPY, landingSeo, mergeCopy, resolveLink, type ShowcaseLook } from '@/lib/landing-copy'
import { orderShowcase, showcasePictures } from '@/lib/showcase'
import { resolveVideoUrl } from '@/lib/video'
import { mediaUrl } from '@/lib/portfolio'
import SectionBg, { type SectionBgConfig } from '@/components/portfolio/SectionBg'
import Analytics from '@/components/portfolio/Analytics'
import VideoFacade from '@/components/portfolio/VideoFacade'
import PlayVideoButton from '@/components/portfolio/PlayVideoButton'
import DashShowcase from '@/components/portfolio/DashShowcase'
import { LandingNav, LandingFooter } from '@/components/portfolio/LandingChrome'
import { DEFAULT_LOOK, landingTokensCss, setOnly, type LandingLook } from '@/lib/landing-look'
import { tenantUrl } from '@/lib/tenant-url'
import { resolveLandingOrder } from '@/lib/landing-order'
import ContactFabs from '@/components/portfolio/ContactFabs'
import { DASH_RATIOS } from '@/lib/landing-copy'
import { platformLocale } from '@/lib/seo'
import './landing.css'
import './landing-reference.css'
import { landingSections, LandingMobileTrial } from '@/components/portfolio/LandingSections'


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
        showcaseLayout?: string | null
        fontAr?: string | null
        fontLatin?: string | null
      }
      seoTools?: { searchConsole?: string | null; analyticsId?: string | null }
      sectionOrder?: unknown
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
        colorLight: (r.colorLight as string) || null,
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
      order: resolveLandingOrder(g?.sectionOrder),
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
        showcaseLayout: g?.style?.showcaseLayout || DEFAULT_LOOK.showcaseLayout,
        fontAr: g?.style?.fontAr || DEFAULT_LOOK.fontAr,
        fontLatin: g?.style?.fontLatin || DEFAULT_LOOK.fontLatin,
      } as LandingLook,
    }
  } catch {
    return {
      copy: base,
      tools: {} as { searchConsole?: string | null; analyticsId?: string | null },
      order: resolveLandingOrder(null),
      sections: {} as Record<string, SectionBgConfig>,
      look: DEFAULT_LOOK,
    }
  }
}

// Touches the DB → render per-request.
export const dynamic = 'force-dynamic'

type Params = { searchParams?: Promise<{ lang?: string; preview?: string }> }

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || ''

export async function generateMetadata({ searchParams }: Params): Promise<Metadata> {
  const { lang } = (await searchParams) ?? {}
  const locale = platformLocale(lang)
  const landing = await getLanding(locale)
  const look = landing.look
  // Falls back to the hero picture when no share image has been set, so a
  // shared link is never a bare grey card.
  const og = look.ogUrl || look.heroUrl
  const { title, description } = landingSeo(landing.copy)
  return {
    title,
    description,
    verification: landing.tools?.searchConsole
      ? { google: landing.tools.searchConsole }
      : undefined,
    alternates: {
      /* Arabic is the bare address — the one written on a card and pasted into
         a message — so that is what it canonicalises to, and `?lang=ar` folds
         into it. English is a page of its own and says so. */
      canonical: SITE ? (locale === 'en' ? `${SITE}/?lang=en` : SITE) : undefined,
      // The landing is the one page that never carried these.
      languages: SITE
        ? { ar: SITE, en: `${SITE}/?lang=en`, 'x-default': SITE }
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
  /** Where that portfolio is read — its own subdomain or domain. */
  url: string
  title: string | null
  avatarUrl: string | null
  coverUrl: string | null
  /** How the picture is framed in its card, set by hand in the dashboard. */
  frame: { zoom: number; x: number; y: number }
}

/**
 * The portfolios shown on the landing page, with the face and the one-line
 * title each of them already publishes.
 *
 * The card used to have nothing but a name and the first letter of it in a
 * coloured square — six identical squares said nothing about the work behind
 * them. Their settings are fetched in one query, not one per tenant.
 *
 * The ones the owner has taken off the page are left out of the query itself,
 * so hiding a test account lets the next real portfolio take its place rather
 * than leaving one card fewer.
 */
async function getShowcase(
  hidden: string[],
  order: string[] | undefined,
  look: Record<string, ShowcaseLook> | undefined,
): Promise<ShowcaseItem[]> {
  try {
    const payload = await getPayload({ config })
    // Everyone on show, so the owner's order can reach past the newest six.
    const res = await payload.find({
      collection: 'tenants',
      limit: 200,
      depth: 0,
      sort: '-createdAt',
      where: hidden.length ? { slug: { not_in: hidden } } : undefined,
    })
    const tenants = orderShowcase(res.docs, order).slice(0, 6)
    if (!tenants.length) return []
    const pics = await showcasePictures(payload, tenants.map((t) => t.id))

    return tenants.map((t) => {
      const p = pics.get(t.id)
      const own = look?.[t.slug]
      return {
        name: t.name,
        slug: t.slug,
        url: tenantUrl(t.slug, t.domain),
        title: p?.title ?? null,
        // A picture the owner chose wins over the one the portfolio supplies.
        avatarUrl: own?.imageUrl || p?.avatarUrl || null,
        coverUrl: own?.imageUrl || p?.coverUrl || null,
        frame: {
          zoom: own?.zoom ?? 100,
          x: own?.x ?? 50,
          y: own?.y ?? 50,
        },
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

/** A section's eyebrow, heading and the sentence under it. */
function Head({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="lp-sec-head">
      {eyebrow && <span className="lp-eyebrow-sm">{eyebrow}</span>}
      <h2 className="lp-h2">{title}</h2>
      {sub && <p className="lp-sec-sub">{sub}</p>}
    </div>
  )
}

export default async function HomePage({ searchParams }: Params) {
  const { lang, preview } = (await searchParams) ?? {}
  const locale = platformLocale(lang)
  /* The dashboard shows this page beside the editor. Those views are the
     owner looking at their own work, not visitors, and counting them would
     fill the analytics with one person. */
  const isPreview = preview === '1'
  const { copy, look, sections, tools, order } = await getLanding(locale)
  const c = copy as (typeof LANDING_COPY)['ar']
  const [showcase, stats] = await Promise.all([getShowcase(c.showcaseHidden ?? [], c.showcaseOrder, c.showcaseLook), getStats()])
  const n = new Intl.NumberFormat(locale === 'en' ? 'en' : 'ar-EG')
  // Every "start" button on the page asks for the same thing, so they all go
  // to the same place — one the owner sets, for as long as sign-up lives
  // somewhere other than the login page.
  const start = resolveLink(c.ctaUrl, '/login')
  /* A button's own address when it has been given one, and the shared start
     link when it has not — so pointing one button at WhatsApp does not mean
     repeating that address in the other five. */
  const to = (v?: string) => resolveLink(v, start)
  /* The second hero button: its own address, or the first portfolio on show. */
  const cardStyle = look.cardStyle
  const testimonials = (c.testimonials ?? []).filter((t) => t.quote?.trim())
  const dash = (c.dash ?? []).filter((d) => d.t?.trim())

  /* What the explainer frame holds. A link written for this language comes
     first — its subtitles are burned in, so the English page needs its own —
     then an uploaded file, then the link from before links were per language,
     and the drawn product when there is none of them. */
  const link = resolveVideoUrl(c.panelVideo)
  const legacy = resolveVideoUrl(look.panelVideoUrl)
  const media:
    | { type: 'video'; kind: 'file' | 'iframe'; src: string }
    | { type: 'image'; src: string }
    | null = link
    ? { type: 'video', kind: link.kind, src: link.url }
    : look.panelUrl
      ? look.panelKind === 'video'
        ? { type: 'video', kind: 'file', src: look.panelUrl }
        : { type: 'image', src: look.panelUrl }
      : legacy
        ? { type: 'video', kind: legacy.kind, src: legacy.url }
        : null
  // YouTube publishes a still for every video; used until a poster is set.
  const ytId =
    media?.type === 'video' && media.kind === 'iframe'
      ? media.src.match(/youtube\.com\/embed\/([\w-]{11})/)?.[1]
      : undefined
  const poster = c.panelPoster || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null)

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (order.some(b => b.id === "faq" && b.on) ? c.faqs : []).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  /* Every band the page can show, by name. Which of them appear and in what
     order is the owner's, so the sequence lives in the data rather than in
     the shape of this file. */
  const panelCustomized = (['panelEyebrow', 'panelHeading', 'panelSub', 'panelTitle', 'panelBtn', 'panelNote', 'panelBtnUrl', 'mock'] as const)
    .some(key => JSON.stringify(c[key]) !== JSON.stringify(LANDING_COPY[locale][key]))
  const dashboardCustomized = (['dash', 'dashEyebrow', 'dashTitle', 'dashSub'] as const)
    .some(key => JSON.stringify(c[key]) !== JSON.stringify(LANDING_COPY[locale][key]))
  const bands: Record<string, React.ReactNode> = {
    panel: (media || panelCustomized) && (
      <SectionBg config={sections.panel}>
              <section className="lp-panel-sec" id="panel">
                <Head eyebrow={c.panelEyebrow} title={c.panelHeading} sub={c.panelSub} />

                <figure className="lp-mock">
                  <figcaption className="lp-mock-bar">
                    <span className="lp-mock-dots" aria-hidden="true" />
                    {c.panelTitle}
                  </figcaption>

                  {media?.type === 'video' ? (
                    <VideoFacade
                      kind={media.kind}
                      src={media.src}
                      poster={poster}
                      title={c.panelTitle}
                      duration={c.panelDuration}
                      playLabel={c.design.playVideo}
                    closeLabel={c.design.closeVideo}
                      playEvent="lp-play-panel"
                    />
                  ) : media?.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="lp-mock-media" src={media.src} alt={c.panelTitle} />
                  ) : (
                    <div className="lp-mock-frame" aria-hidden="true">
                    <aside className="lp-mock-side">
                      <div className="lp-mock-side-head">{c.mock.panel}</div>
                      <ul>
                        {c.mock.items.map((it, i) => (
                          <li className={i === 0 ? 'on' : undefined} key={it}>
                            <span>{it}</span>

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
                            <em>{i === 2 ? c.design.studio31 : c.design.studio36}</em>
                            <b>{t}</b>
                          </span>
                        ))}
                      </div>
                    </div>
                    </div>
                  )}
                </figure>

                {((c.panelBtn && (c.panelBtnUrl?.trim() || media?.type === 'video')) || c.panelNote) && (
                  <div className="lp-sec-foot">
                    {/* With no destination of its own, the button plays the video
                        above it, and waits for one when there is none: a "watch"
                        button that opened WhatsApp would be a broken promise. */}
                    {c.panelBtn &&
                      (c.panelBtnUrl?.trim() ? (
                        <a className="lp-btn lp-btn-primary lp-btn-lg lp-arrow" href={to(c.panelBtnUrl)}>
                          <span className="lp-btn-label">{c.panelBtn}</span>
                        </a>
                      ) : media?.type === 'video' ? (
                        <PlayVideoButton event="lp-play-panel" label={c.panelBtn} />
                      ) : null)}
                    {c.panelNote && <small>{c.panelNote}</small>}
                  </div>
                )}
              </section>
            </SectionBg>
    ),
    dashboard: (
      (dash.some(d => d.imageUrl || d.videoUrl) || dashboardCustomized) && (
              <SectionBg config={sections.dashboard}>
                <section
                  className={[
                    'lp-sec lp-dash-sec',
                    `side-${c.dashSide === 'end' ? 'end' : 'start'}`,
                    c.dashFit === 'contain' ? 'fit-contain' : '',
                    c.dashAlign === 'center' ? 'align-center' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  id="dashboard"
                  /* The frame's own dials, read by the stylesheet. A height of
                     zero leaves the picture the shape it came in. */
                  style={
                    {
                      // A shape, not a height in pixels: a fixed height turned a
                      // wide screenshot into a near-square on a narrow column.
                      '--dash-ratio': DASH_RATIOS.includes(c.dashRatio) ? c.dashRatio : '16 / 9',
                      '--dash-pos': `${c.dashPosX ?? 50}% ${c.dashPosY ?? 50}%`,
                    } as React.CSSProperties
                  }
                >
                  <Head eyebrow={c.dashEyebrow} title={c.dashTitle} sub={c.dashSub} />
                  <DashShowcase items={dash} playLabel={c.design.playVideo}
                    closeLabel={c.design.closeVideo} />
                </section>
              </SectionBg>
            )
    ),
    metrics: (
      stats && (
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
            )
    ),
    testimonials: (
      /* Off the page until the first real quote is in. */
      testimonials.length > 0 && (
              <SectionBg config={sections.testimonials}>
                <section className="lp-sec" id="testimonials">
                  <Head eyebrow={c.testimonialsEyebrow} title={c.testimonialsTitle} />
                  <div className="lp-grid lp-quotes">
                    {testimonials.map((t, i) => {
                      const who = (
                        <>
                          <strong>{t.name}</strong>
                          {t.role && <span>{t.role}</span>}
                        </>
                      )
                      return (
                        <figure className="lp-card lp-quote" key={t.name + i}>
                          <blockquote>{t.quote}</blockquote>
                          <figcaption className="lp-quote-who">
                            {t.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={t.photoUrl} alt="" />
                            ) : (
                              <i aria-hidden="true">{t.name?.[0]?.toUpperCase() || '★'}</i>
                            )}
                            {t.url ? (
                              <a href={t.url} target="_blank" rel="noopener">
                                {who}
                              </a>
                            ) : (
                              <div>{who}</div>
                            )}
                          </figcaption>
                        </figure>
                      )
                    })}
                  </div>
                </section>
              </SectionBg>
      )
    ),
    ...Object.fromEntries(Object.entries(landingSections(c, look, showcase, locale)).map(([id, node]) => [id, <SectionBg key={id} config={sections[id === "studio" ? "panel" : id]}>{node}</SectionBg>])),
  }

  return (
    <div
      className="lp vpx"
      data-card={cardStyle}
      data-font-ar={look.fontAr}
      data-font-latin={look.fontLatin}
      dir={locale === 'en' ? 'ltr' : 'rtl'}
      lang={locale}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <a className="skip" href="#main">{c.design.skipLabel}</a>
      {!isPreview && <Analytics id={tools?.analyticsId} />}
      <SectionBg config={sections.header}>
        <LandingNav
          look={look}
          copy={c}
          locale={locale}
          atHome
          otherLang={locale === 'en' ? '/' : '/?lang=en'}
        />
      </SectionBg>

      <main id="main">
      {order
        .filter((b) => b.on)
        .map((b) => (
          <React.Fragment key={b.id}>{bands[b.id]}</React.Fragment>
        ))}

      </main>
      <LandingMobileTrial c={c}/>
      <SectionBg config={sections.footer}>
        <LandingFooter look={look} copy={c} locale={locale} atHome />
      </SectionBg>

      <ContactFabs
        whatsapp={c.waNumber}
        phone={c.phone}
        labels={
          { whatsapp: c.design.footerWhatsapp, call: c.design.callLabel }
        }
      />

      <style>{landingTokensCss(look)}</style>
    </div>
  )
}
