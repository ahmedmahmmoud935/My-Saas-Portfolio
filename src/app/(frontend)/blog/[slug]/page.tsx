import React from 'react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mediaUrl } from '@/lib/portfolio'
import { alternatesFor, absoluteUrl } from '@/lib/seo'
import HtmlEmbed from '@/components/shared/HtmlEmbed'

export const dynamic = 'force-dynamic'

type Params = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ lang?: string }>
}

async function load(slugRaw: string, locale: 'ar' | 'en') {
  let slug = slugRaw
  try {
    slug = decodeURIComponent(slugRaw)
  } catch {
    /* keep raw */
  }
  const payload = await getPayload({ config })
  const other = locale === 'ar' ? 'en' : 'ar'
  const find = (l: 'ar' | 'en') =>
    payload.find({
      collection: 'posts',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      locale: l,
      fallbackLocale: l === 'ar' ? 'en' : 'ar',
    })

  // Slugs are per language, so an address written in one will not match a
  // lookup in the other. Try both before giving up on a valid link.
  let post = (await find(locale)).docs[0]
  if (!post) post = (await find(other)).docs[0]
  if (!post || post.published !== true) return null
  return post
}

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const { slug } = await params
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const post = await load(slug, locale)
  const alternates = await alternatesFor(`/blog/${slug}`, { locale })
  if (!post) return { title: 'Not found', alternates }

  const seo = post.seo ?? {}
  const title = seo.title || post.title
  const description = seo.description || post.excerpt || undefined
  const cover = mediaUrl(post.cover, 'card')
  return {
    title,
    description,
    alternates,
    robots: { index: !seo.noindex, follow: !seo.nofollow },
    openGraph: { title, description, images: cover ? [cover] : undefined, type: 'article' },
    twitter: { card: 'summary_large_image', title, description, images: cover ? [cover] : undefined },
  }
}

/** An address this post used to live at, checked only on the way to a 404. */
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

export default async function BlogPost({ params, searchParams }: Params) {
  const { slug } = await params
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const post = await load(slug, locale)

  if (!post) {
    let decoded = slug
    try {
      decoded = decodeURIComponent(slug)
    } catch {
      /* keep raw */
    }
    const to = await movedTo(`/blog/${decoded}`)
    if (to) permanentRedirect(lang ? `${to}?lang=${locale}` : to)
    notFound()
  }

  const cover = mediaUrl(post.cover, 'card')
  const q = locale === 'en' ? '?lang=en' : ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    image: cover || undefined,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: await absoluteUrl(`/blog/${post.slug}`),
    author: { '@type': 'Organization', name: 'ViralPX', url: await absoluteUrl('/') },
    publisher: { '@type': 'Organization', name: 'ViralPX', url: await absoluteUrl('/') },
  }

  return (
    <div className="lp blog" dir={locale === 'en' ? 'ltr' : 'rtl'} lang={locale}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="lp-nav">
        <a href={`/${q}`} className="lp-logo">
          Viral<span>PX</span>
        </a>
        <nav className="lp-nav-links">
          <a href={`/blog${q}`}>{locale === 'en' ? 'Blog' : 'المدوّنة'}</a>
        </nav>
        <div className="lp-nav-actions">
          <a className="lp-lang" href={locale === 'en' ? `/blog/${slug}?lang=ar` : `/blog/${slug}?lang=en`}>
            {locale === 'en' ? 'ع' : 'EN'}
          </a>
        </div>
      </header>

      <article className="lp-sec blog-post">
        <h1 className="lp-h2" style={{ textAlign: 'start', marginBottom: 14 }}>
          {post.title}
        </h1>
        {post.excerpt && <p className="lp-lead" style={{ margin: '0 0 26px' }}>{post.excerpt}</p>}
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="blog-cover" src={cover} alt={post.title} />
        )}
        <HtmlEmbed value={post.contentHtml ?? ''} />
      </article>

      <style>{`
        .blog { background: #0A0A0A; color: #fff;
          --o: #F97316; --lp-bg: #0A0A0A; --lp-bg2: #111; --lp-text: #fff; --lp-sub: #9AA0AA;
          --lp-line: color-mix(in srgb, #fff 9%, transparent);
          --lp-line-2: color-mix(in srgb, #fff 20%, transparent);
          --lp-on-o: #0A0A0A;
          min-height: 100vh; font-family: var(--font-cairo), system-ui, sans-serif; }
        .blog a { text-decoration: none; color: inherit; }
        .blog-post { max-width: 760px; }
        .blog-cover { width: 100%; border-radius: 16px; margin-bottom: 28px; display: block; }
        .blog-post :where(h2, h3, h4) { margin: 32px 0 12px; line-height: 1.35; }
        .blog-post p { line-height: 1.9; color: #cfcfcf; }
        .blog-post img { max-width: 100%; height: auto; border-radius: 12px; }
      `}</style>
    </div>
  )
}
