import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mediaUrl, tenantCssVars } from '@/lib/portfolio'
import Navbar from '@/components/portfolio/Navbar'
import Footer from '@/components/portfolio/Footer'

type Params = { params: Promise<{ username: string }> }

async function load(username: string) {
  const payload = await getPayload({ config })
  const t = await payload.find({ collection: 'tenants', where: { slug: { equals: username } }, limit: 1, depth: 0 })
  const tenant = t.docs[0]
  if (!tenant) return null
  const [settingsRes, articlesRes] = await Promise.all([
    payload.find({ collection: 'site-settings', where: { tenant: { equals: tenant.id } }, limit: 1, depth: 0, locale: 'ar' }),
    payload.find({
      collection: 'articles',
      where: { and: [{ tenant: { equals: tenant.id } }, { published: { equals: true } }] },
      sort: '-createdAt',
      limit: 100,
      depth: 1,
      locale: 'ar',
    }),
  ])
  return { tenant, settings: settingsRes.docs[0] ?? null, articles: articlesRes.docs }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params
  return { title: `مقالات ${username}` }
}

export default async function ArticlesListPage({ params }: Params) {
  const { username } = await params
  const data = await load(username)
  if (!data) notFound()
  const { tenant, settings, articles } = data
  const logo = tenant.name?.[0]?.toUpperCase() || 'V'

  return (
    <div style={tenantCssVars(settings) as React.CSSProperties}>
      <Navbar logo={logo} links={[{ label: 'الرئيسية', href: `/${tenant.slug}` }]} />
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">المقالات</h2>
          </div>
          {articles.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--sub)' }}>لا توجد مقالات بعد.</p>
          ) : (
            <div className="tst-grid">
              {articles.map((a) => (
                <a key={a.id} href={`/${tenant.slug}/articles/${a.slug}`} className="tst" style={{ padding: 0, overflow: 'hidden', display: 'block' }}>
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
    </div>
  )
}
