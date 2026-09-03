import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mediaUrl } from '@/lib/portfolio'
import { alternatesFor } from '@/lib/seo'
import Navbar from '@/components/portfolio/Navbar'
import PageShell from '@/components/portfolio/PageShell'
import Footer from '@/components/portfolio/Footer'

type Params = { params: Promise<{ username: string }>; searchParams?: Promise<{ lang?: string }> }

async function load(username: string, locale: 'ar' | 'en') {
  const payload = await getPayload({ config })
  const t = await payload.find({ collection: 'tenants', where: { slug: { equals: username } }, limit: 1, depth: 0 })
  const tenant = t.docs[0]
  if (!tenant) return null
  const [settingsRes, articlesRes] = await Promise.all([
    payload.find({ collection: 'site-settings', where: { tenant: { equals: tenant.id } }, limit: 1, depth: 0, locale, fallbackLocale: locale === 'ar' ? 'en' : 'ar' }),
    payload.find({
      collection: 'articles',
      where: { and: [{ tenant: { equals: tenant.id } }, { published: { equals: true } }] },
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
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
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
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const data = await load(username, locale)
  if (!data) notFound()
  const { tenant, settings, articles } = data
  const logo = tenant.name?.[0]?.toUpperCase() || 'V'
  return (
    <PageShell settings={settings} locale={locale}>
      <Navbar
        logo={logo}
        links={[{ label: locale === 'en' ? 'Home' : 'الرئيسية', href: `/${tenant.slug}?lang=${locale}` }]}
        langHref={`?lang=${locale === 'en' ? 'ar' : 'en'}`}
        langLabel={locale === 'en' ? 'ع' : 'EN'}
      />
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h1 className="section-title">{locale === 'en' ? 'Articles' : 'المقالات'}</h1>
          </div>
          {articles.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--sub)' }}>لا توجد مقالات بعد.</p>
          ) : (
            <div className="tst-grid">
              {articles.map((a) => (
                <a key={a.id} href={`/${tenant.slug}/articles/${a.slug}?lang=${locale}`} className="tst" style={{ padding: 0, overflow: 'hidden', display: 'block' }}>
                  {mediaUrl(a.cover, 'card') && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(a.cover, 'card')!} alt={a.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: 18 }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{a.title}</h3>
                    {a.excerpt && <p style={{ color: 'var(--sub)', fontSize: 14, margin: 0 }}>{a.excerpt}</p>}
                    <div style={{ color: 'var(--accent)', fontSize: 12, marginTop: 10 }}>
                      {a.readMin ? `${a.readMin} دقيقة قراءة` : ''}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer logo={logo} name={tenant.name} />
    </PageShell>
  )
}
