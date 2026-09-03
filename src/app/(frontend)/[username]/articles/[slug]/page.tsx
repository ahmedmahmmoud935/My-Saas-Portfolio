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
  const [settingsRes, articleRes] = await Promise.all([
    payload.find({ collection: 'site-settings', where: { tenant: { equals: tenant.id } }, limit: 1, depth: 0, locale, fallbackLocale: locale === 'ar' ? 'en' : 'ar' }),
    payload.find({
      collection: 'articles',
      where: { and: [{ tenant: { equals: tenant.id } }, { slug: { equals: slug } }] },
      limit: 1,
      depth: 1,
      locale,
      fallbackLocale: locale === 'ar' ? 'en' : 'ar',
    }),
  ])
  const article = articleRes.docs[0]
  if (!article || article.published !== true) return null
  return { tenant, settings: settingsRes.docs[0] ?? null, article }
}

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const { username, slug } = await params
  const { lang } = (await searchParams) ?? {}
  const data = await load(username, slug, lang === 'ar' ? 'ar' : 'en')
  if (!data) return { title: 'غير موجود' }
  const cover = mediaUrl(data.article.cover, 'card')
  return {
    title: data.article.title,
    description: data.article.excerpt || undefined,
    alternates: await alternatesFor(`/${username}/articles/${slug}`, {
      tenantSlug: username,
      locale: lang === 'ar' ? 'ar' : 'en',
    }),
    openGraph: {
      title: data.article.title,
      description: data.article.excerpt || undefined,
      images: cover ? [cover] : undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.article.title,
      description: data.article.excerpt || undefined,
      images: cover ? [cover] : undefined,
    },
  }
}

export default async function ArticlePage({ params, searchParams }: Params) {
  const { username, slug } = await params
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const data = await load(username, slug, locale)
  if (!data) notFound()
  const { tenant, settings, article } = data
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

  return (
    <PageShell settings={settings} locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar
        logo={logo}
        links={[
          { label: locale === 'en' ? 'Articles' : 'المقالات', href: `/${tenant.slug}/articles?lang=${locale}` },
          { label: locale === 'en' ? 'Home' : 'الرئيسية', href: `/${tenant.slug}?lang=${locale}` },
        ]}
        langHref={`?lang=${locale === 'en' ? 'ar' : 'en'}`}
        langLabel={locale === 'en' ? 'ع' : 'EN'}
      />
      <article className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, lineHeight: 1.2 }}>{article.title}</h1>
          <div style={{ color: 'var(--sub)', fontSize: 13, marginBottom: 20 }}>
            {new Date(article.createdAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar')} {article.readMin ? `· ${article.readMin} ${locale === 'en' ? 'min read' : 'دقيقة'}` : ''}
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
        </div>
      </article>
      <Footer logo={logo} name={tenant.name} />
    </PageShell>
  )
}
