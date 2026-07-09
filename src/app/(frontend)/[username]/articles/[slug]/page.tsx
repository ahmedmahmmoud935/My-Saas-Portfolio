import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mediaUrl, tenantCssVars } from '@/lib/portfolio'
import Navbar from '@/components/portfolio/Navbar'
import Footer from '@/components/portfolio/Footer'

type Params = { params: Promise<{ username: string; slug: string }> }

async function load(username: string, slug: string) {
  const payload = await getPayload({ config })
  const t = await payload.find({ collection: 'tenants', where: { slug: { equals: username } }, limit: 1, depth: 0 })
  const tenant = t.docs[0]
  if (!tenant) return null
  const [settingsRes, articleRes] = await Promise.all([
    payload.find({ collection: 'site-settings', where: { tenant: { equals: tenant.id } }, limit: 1, depth: 0, locale: 'ar' }),
    payload.find({
      collection: 'articles',
      where: { and: [{ tenant: { equals: tenant.id } }, { slug: { equals: slug } }] },
      limit: 1,
      depth: 1,
      locale: 'ar',
    }),
  ])
  const article = articleRes.docs[0]
  if (!article || article.published !== true) return null
  return { tenant, settings: settingsRes.docs[0] ?? null, article }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username, slug } = await params
  const data = await load(username, slug)
  if (!data) return { title: 'غير موجود' }
  const cover = mediaUrl(data.article.cover, 'card')
  return {
    title: data.article.title,
    description: data.article.excerpt || undefined,
    openGraph: {
      title: data.article.title,
      description: data.article.excerpt || undefined,
      images: cover ? [cover] : undefined,
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }: Params) {
  const { username, slug } = await params
  const data = await load(username, slug)
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
    <div style={tenantCssVars(settings) as React.CSSProperties}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar logo={logo} links={[{ label: 'المقالات', href: `/${tenant.slug}/articles` }, { label: 'الرئيسية', href: `/${tenant.slug}` }]} />
      <article className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, lineHeight: 1.2 }}>{article.title}</h1>
          <div style={{ color: 'var(--sub)', fontSize: 13, marginBottom: 20 }}>
            {new Date(article.createdAt).toLocaleDateString('ar')} {article.readMin ? `· ${article.readMin} دقيقة` : ''}
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
    </div>
  )
}
