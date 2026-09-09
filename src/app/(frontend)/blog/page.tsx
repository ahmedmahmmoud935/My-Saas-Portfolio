import React from 'react'
import type { Metadata } from 'next'
import { mediaUrl } from '@/lib/portfolio'
import { livePosts } from '@/lib/posts'
import { alternatesFor } from '@/lib/seo'
import { getLandingChrome, landingTokensCss } from '@/lib/landing-look'
import { LandingNav, LandingFooter } from '@/components/portfolio/LandingChrome'
import Analytics from '@/components/portfolio/Analytics'
import '../landing.css'

export const dynamic = 'force-dynamic'

type Params = { searchParams?: Promise<{ lang?: string }> }

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
  const posts = await livePosts(locale)
  // The same palette AND the same nav and footer the landing page wears. The
  // blog is not a second site, and it used to arrive looking like one.
  const { look, copy: c, analyticsId } = await getLandingChrome(locale)

  return (
    <div
      className="lp blog"
      data-card={look.cardStyle}
      data-font-ar={look.fontAr}
      data-font-latin={look.fontLatin}
      dir={locale === 'en' ? 'ltr' : 'rtl'}
      lang={locale}
    >
      <Analytics id={analyticsId} />
      <LandingNav
        look={look}
        copy={c}
        locale={locale}
        otherLang={locale === 'en' ? '/blog?lang=ar' : '/blog?lang=en'}
      />

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
              <a className="lp-card blog-card" key={p.id} href={`/blog/${p.slug}?lang=${p.locale}`}>
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

      <LandingFooter look={look} copy={c} locale={locale} />

      <style>{landingTokensCss(look)}</style>
    </div>
  )
}
