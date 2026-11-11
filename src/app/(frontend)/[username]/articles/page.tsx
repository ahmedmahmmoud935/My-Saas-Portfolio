import StudioShell from '@/components/studio/StudioShell'
import { buildStudioData } from '@/lib/studio-data'
import Analytics from '@/components/portfolio/Analytics'
import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPortfolio, mediaUrl } from '@/lib/portfolio'
import { alternatesFor, langQuery, pageLocale } from '@/lib/seo'
import { liveWhere } from '@/lib/publish'
import { readingMinutes } from '@/lib/reading-time'

type Params = { params: Promise<{ username: string }>; searchParams?: Promise<{ lang?: string }> }

async function load(username: string, locale: 'ar' | 'en') {
  const payload = await getPayload({ config })
  const t = await payload.find({ collection: 'tenants', where: { slug: { equals: username } }, limit: 1, depth: 0 })
  const tenant = t.docs[0]
  // A suspended client's whole site is off, not just its home page.
  if (!tenant || (tenant as { suspended?: boolean }).suspended) return null
  const [settingsRes, articlesRes] = await Promise.all([
    payload.find({ collection: 'site-settings', where: { tenant: { equals: tenant.id } }, limit: 1, depth: 0, locale, fallbackLocale: locale === 'ar' ? 'en' : 'ar' }),
    payload.find({
      collection: 'articles',
      where: { and: [{ tenant: { equals: tenant.id } }, liveWhere()] },
      sort: '-createdAt',
      limit: 100,
      depth: 1,
      locale,
      fallbackLocale: locale === 'ar' ? 'en' : 'ar',
    }),
  ])
  return { tenant, settings: settingsRes.docs[0] ?? null, articles: articlesRes.docs }
}

/**
 * The index carried a title built from the slug and nothing else, so it fell
 * back to the app's own description and shared with no image.
 */
export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const { username } = await params
  const { lang } = (await searchParams) ?? {}
  const locale = await pageLocale(lang)
  const alternates = await alternatesFor(`/${username}/articles`, { tenantSlug: username, locale })
  const data = await load(username, locale)
  const name = data?.tenant.name ?? username
  const title = locale === 'en' ? `Articles — ${name}` : `مقالات — ${name}`
  const description =
    locale === 'en'
      ? `Articles and writing by ${name}.`
      : `مقالات وكتابات ${name}.`
  const cover = data?.articles.map((a) => mediaUrl(a.cover, 'card')).find(Boolean) ?? null
  return {
    title,
    description,
    alternates,
    openGraph: { title, description, images: cover ? [cover] : undefined, type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: cover ? [cover] : undefined },
  }
}

export default async function ArticlesListPage({ params, searchParams }: Params) {
  const { username } = await params
  const { lang } = (await searchParams) ?? {}
  const locale = await pageLocale(lang)
  const data = await load(username, locale)
  if (!data) notFound()
  const { tenant, settings, articles } = data
  const q = await langQuery(locale)
  const portfolio = await getPortfolio(username, locale)
  if (!portfolio) notFound()
  const d = buildStudioData(portfolio, locale, q)

  return (
    <StudioShell d={d} base={d.homeHref} hasArticles={articles.length > 0} langHref={`?lang=${locale === 'en' ? 'ar' : 'en'}`}>
      <Analytics id={settings?.seoTools?.analyticsId} />

      <section className="st-section">
        <div className="st-shell">
          <div className="st-page-heading">
            <h1 className="st-page-title">{locale === 'en' ? 'Articles' : 'المقالات'}</h1>
          </div>
          {articles.length === 0 ? (
            <p className="st-empty">
              {locale === 'en' ? 'No articles yet.' : 'لا توجد مقالات بعد.'}
            </p>
          ) : (
            <div className="st-article-grid">
              {articles.map((a) => (
                <a key={a.id} href={`/${tenant.slug}/articles/${a.slug}${q}`} className="st-article-card">
                  {mediaUrl(a.cover, 'card') && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(a.cover, 'card')!} alt={a.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                  )}
                  <div className="st-article-card-body">
                    <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{a.title}</h3>
                    {a.excerpt && <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>{a.excerpt}</p>}
                    <div style={{ color: 'var(--accent)', fontSize: 12, marginTop: 10 }}>
                      <time dateTime={a.createdAt}>{new Date(a.createdAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar')}</time>{' · '}
                      {(() => {
                        const min = readingMinutes(a.contentHtml, locale)
                        return min ? (locale === 'en' ? `${min} min read` : `${min} دقيقة قراءة`) : ''
                      })()}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </StudioShell>
  )
}
