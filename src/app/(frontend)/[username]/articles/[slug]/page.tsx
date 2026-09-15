import React from 'react'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mediaUrl } from '@/lib/portfolio'
import { alternatesFor, langQuery, pageLocale, plainText } from '@/lib/seo'
import { isLive, liveWhere } from '@/lib/publish'
import { readingMinutes } from '@/lib/reading-time'
import Navbar from '@/components/portfolio/Navbar'
import PageShell from '@/components/portfolio/PageShell'
import Footer from '@/components/portfolio/Footer'

type Params = {
  params: Promise<{ username: string; slug: string }>
  searchParams?: Promise<{ lang?: string }>
}

async function load(username: string, slugRaw: string, locale: 'ar' | 'en') {
  // Next passes the raw (percent-encoded) URL segment; decode so non-ASCII
  // (Arabic) slugs match the stored value. Idempotent for already-decoded slugs.
  let slug = slugRaw
  try {
    slug = decodeURIComponent(slugRaw)
  } catch {
    /* keep raw */
  }
  const payload = await getPayload({ config })
  const t = await payload.find({ collection: 'tenants', where: { slug: { equals: username } }, limit: 1, depth: 0 })
  const tenant = t.docs[0]
  if (!tenant) return null
  const other = locale === 'ar' ? 'en' : 'ar'
  const bySlug = (l: 'ar' | 'en') =>
    payload.find({
      collection: 'articles',
      where: { and: [{ tenant: { equals: tenant.id } }, { slug: { equals: slug } }] },
      limit: 1,
      depth: 1,
      locale: l,
      fallbackLocale: l === 'ar' ? 'en' : 'ar',
    })

  const [settingsRes, articleRes] = await Promise.all([
    payload.find({ collection: 'site-settings', where: { tenant: { equals: tenant.id } }, limit: 1, depth: 0, locale, fallbackLocale: other }),
    bySlug(locale),
  ])

  // Slugs are per-language now, so an address written in one language will not
  // match a lookup in the other. Try the other language before giving up,
  // rather than 404ing a link that is perfectly valid.
  let article = articleRes.docs[0]
  if (!article) article = (await bySlug(other)).docs[0]

  if (!article || !isLive(article.published, article.publishAt)) return null
  return { tenant, settings: settingsRes.docs[0] ?? null, article }
}

/** The tags on a piece, compared the way a reader would: case and space blind. */
const tagsOf = (doc: { tags?: { tag?: string | null }[] | null }): string[] =>
  (doc.tags ?? []).map((t) => (t.tag ?? '').trim().toLowerCase()).filter(Boolean)

/**
 * Where to send a reader who reached the end.
 *
 * Ranked by the tags two pieces share — that is what tags are for, and until
 * now they were typed into the editor and used by nothing at all. A blog with
 * three articles and no tags in common still gets links, because the reader is
 * at the end of the page either way; the heading says which of the two this
 * is, rather than promising a relation that isn't there.
 */
async function related(
  payload: Awaited<ReturnType<typeof getPayload>>,
  tenantId: number,
  current: { id: number; tags?: { tag?: string | null }[] | null },
  locale: 'ar' | 'en',
) {
  const res = await payload.find({
    collection: 'articles',
    where: {
      and: [{ tenant: { equals: tenantId } }, { id: { not_equals: current.id } }, liveWhere()],
    },
    sort: '-createdAt',
    limit: 24,
    depth: 1,
    locale,
    fallbackLocale: locale === 'ar' ? 'en' : 'ar',
  })
  const mine = tagsOf(current)
  const scored = res.docs.map((d) => ({
    doc: d,
    shared: tagsOf(d).filter((t) => mine.includes(t)).length,
  }))
  const byTag = scored.filter((s) => s.shared > 0).sort((a, b) => b.shared - a.shared)
  const rest = scored.filter((s) => s.shared === 0)
  return {
    items: [...byTag, ...rest].slice(0, 3).map((s) => s.doc),
    /** Whether these are actually related, or simply the next thing to read. */
    related: byTag.length > 0,
  }
}

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const { username, slug } = await params
  const { lang } = (await searchParams) ?? {}
  const locale = await pageLocale(lang)
  const data = await load(username, slug, locale)
  if (!data) return { title: 'غير موجود' }
  const cover = mediaUrl(data.article.cover, 'card')
  const seo = (data.article as { seo?: { title?: string | null; description?: string | null; noindex?: boolean | null; nofollow?: boolean | null } }).seo
  // What a results page shows, when it should read differently from the
  // headline on the article itself.
  const title = seo?.title || data.article.title
  // Same rule as a project: an article that was written but never given a
  // summary still has its own opening to offer.
  const description =
    seo?.description || data.article.excerpt || plainText(data.article.contentHtml)
  return {
    title,
    description,
    robots: { index: !seo?.noindex, follow: !seo?.nofollow },
    alternates: await alternatesFor(`/${username}/articles/${slug}`, {
      tenantSlug: username,
      locale,
    }),
    openGraph: {
      title,
      description,
      images: cover ? [cover] : undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  }
}

/**
 * An address this article used to live at, if it has one.
 *
 * Checked only when the page is about to 404, so the ordinary path costs
 * nothing.
 */
async function movedTo(path: string): Promise<string | null> {
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'redirects',
      where: { from: { equals: path } },
      limit: 1,
      depth: 0,
    })
    return res.docs[0]?.to ?? null
  } catch {
    return null
  }
}

export default async function ArticlePage({ params, searchParams }: Params) {
  const { username, slug } = await params
  const { lang } = (await searchParams) ?? {}
  const locale = await pageLocale(lang)
  const data = await load(username, slug, locale)
  if (!data) {
    let decoded = slug
    try {
      decoded = decodeURIComponent(slug)
    } catch {
      /* keep raw */
    }
    const to = await movedTo(`/${username}/articles/${decoded}`)
    // A permanent redirect, so a search engine moves the ranking across rather
    // than treating the new address as an unrelated page.
    if (to) permanentRedirect(lang ? `${to}?lang=${locale}` : to)
    notFound()
  }
  const { tenant, settings, article } = data
  const minutes = readingMinutes(article.contentHtml, locale)
  const tags = (article.tags ?? []).map((t) => (t.tag ?? '').trim()).filter(Boolean)
  const more = await related(await getPayload({ config }), tenant.id, article, locale)
  const logo = tenant.name?.[0]?.toUpperCase() || 'V'
  const cover = mediaUrl(article.cover)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || undefined,
    image: cover || undefined,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Person', name: tenant.name },
  }

  const q = await langQuery(locale)

  return (
    <PageShell settings={settings} locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar
        logo={logo}
        links={[
          { label: locale === 'en' ? 'Articles' : 'المقالات', href: `/${tenant.slug}/articles${q}` },
          { label: locale === 'en' ? 'Home' : 'الرئيسية', href: `/${tenant.slug}${q}` },
        ]}
        langHref={`?lang=${locale === 'en' ? 'ar' : 'en'}`}
        langLabel={locale === 'en' ? 'ع' : 'EN'}
      />
      <article className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, lineHeight: 1.2 }}>{article.title}</h1>
          <div style={{ color: 'var(--sub)', fontSize: 13, marginBottom: 20 }}>
            {new Date(article.createdAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar')}{minutes ? ` · ${minutes} ${locale === 'en' ? 'min read' : 'دقيقة قراءة'}` : ''}
          </div>
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={article.title} style={{ width: '100%', borderRadius: 12, marginBottom: 24 }} />
          )}
          <div
            className="article-body"
            style={{ lineHeight: 1.9, color: 'var(--text)' }}
            dangerouslySetInnerHTML={{ __html: article.contentHtml || '' }}
          />

          {/* What this piece is about, in the author's own words. Not links:
              a tag page with two articles on it is a thin page, and a blog
              this size is better off without a dozen of them. */}
          {tags.length > 0 && (
            <div className="art-tags">
              {tags.map((tag) => (
                <span className="art-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* And where to go next. A reader at the end of a page either leaves
              or is given somewhere to go, and a link from one piece to another
              is the one kind of link this site can make for itself. */}
          {more.items.length > 0 && (
            <section className="rel">
              <h2 className="rel-title">
                {more.related
                  ? locale === 'en'
                    ? 'Related reading'
                    : 'مقالات ليها علاقة'
                  : locale === 'en'
                    ? 'More to read'
                    : 'اقرأ كمان'}
              </h2>
              <div className="rel-grid">
                {more.items.map((r) => {
                  const img = mediaUrl(r.cover, 'card')
                  return (
                    <a className="rel-card" key={r.id} href={`/${tenant.slug}/articles/${r.slug}${q}`}>
                      {img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" loading="lazy" />
                      )}
                      <div className="rel-body">
                        <strong>{r.title}</strong>
                        <span>
                          {readingMinutes(r.contentHtml, locale)}{' '}
                          {locale === 'en' ? 'min read' : 'دقيقة قراءة'}
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </article>
      <Footer logo={logo} name={tenant.name} />
    </PageShell>
  )
}
