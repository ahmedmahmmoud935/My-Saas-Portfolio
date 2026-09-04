import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mediaUrl } from '@/lib/portfolio'
import { alternatesFor } from '@/lib/seo'
import { LANDING_COPY } from '@/lib/landing-copy'
import { getLandingLook, landingTokensCss } from '@/lib/landing-look'
import '../landing.css'

export const dynamic = 'force-dynamic'

type Params = { searchParams?: Promise<{ lang?: string }> }

async function load(locale: 'ar' | 'en') {
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'posts',
      where: { published: { equals: true } },
      sort: '-createdAt',
      limit: 100,
      depth: 1,
      locale,
      fallbackLocale: locale === 'ar' ? 'en' : 'ar',
    })
    return res.docs
  } catch {
    return []
  }
}

export async function generateMetadata({ searchParams }: Params): Promise<Metadata> {
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const title = locale === 'en' ? 'Blog — ViralPX' : 'المدوّنة — ViralPX'
  const description =
    locale === 'en'
      ? 'Writing about portfolios, presenting creative work, and being found online.'
      : 'مقالات عن البورتفوليو وعرض الشغل الإبداعي والظهور في نتائج البحث.'
  return {
    title,
    description,
    alternates: await alternatesFor('/blog', { locale }),
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function BlogIndex({ searchParams }: Params) {
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const posts = await load(locale)
  const c = LANDING_COPY[locale]
  // The same palette the landing page is wearing — the blog is the same site,
  // so a hard-coded dark theme here would break the moment the owner picks
  // their own colours or the reader switches to light.
  const look = await getLandingLook()

  return (
    <div className="lp blog" dir={locale === 'en' ? 'ltr' : 'rtl'} lang={locale}>
      <header className="lp-nav">
        <a href={`/?lang=${locale}`} className="lp-logo">
          Viral<span>PX</span>
        </a>
        <nav className="lp-nav-links">
          <a href={`/?lang=${locale}#features`}>{c.nav.features}</a>
          <a href={`/?lang=${locale}#pricing`}>{c.nav.pricing}</a>
        </nav>
        <div className="lp-nav-actions">
          <a className="lp-lang" href={locale === 'en' ? '/blog?lang=ar' : '/blog?lang=en'}>
            {locale === 'en' ? 'ع' : 'EN'}
          </a>
          <a className="lp-btn lp-btn-ghost" href="/login">
            {c.login}
          </a>
        </div>
      </header>

      <section className="lp-sec">
        <h1 className="lp-h2" style={{ marginBottom: 12 }}>
          {locale === 'en' ? 'Blog' : 'المدوّنة'}
        </h1>
        <p className="lp-lead" style={{ margin: '0 auto 44px', textAlign: 'center' }}>
          {locale === 'en'
            ? 'On portfolios, showing your work, and being found.'
            : 'عن البورتفوليو وعرض شغلك والظهور في البحث.'}
        </p>

        {posts.length === 0 ? (
          <p className="lp-empty">{locale === 'en' ? 'Nothing published yet.' : 'لسه مفيش مقالات.'}</p>
        ) : (
          <div className="lp-grid lp-grid-3">
            {posts.map((p) => (
              <a className="lp-card blog-card" key={p.id} href={`/blog/${p.slug}?lang=${locale}`}>
                {mediaUrl(p.cover, 'card') && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(p.cover, 'card')!} alt={p.title} loading="lazy" />
                )}
                <h3>{p.title}</h3>
                {p.excerpt && <p>{p.excerpt}</p>}
              </a>
            ))}
          </div>
        )}
      </section>

      <style>{landingTokensCss(look)}</style>
    </div>
  )
}
