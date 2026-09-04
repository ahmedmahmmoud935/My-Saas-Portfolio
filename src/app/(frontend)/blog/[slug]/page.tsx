import React from 'react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mediaUrl } from '@/lib/portfolio'
import { alternatesFor, absoluteUrl } from '@/lib/seo'
import { getLandingLook, landingTokensCss } from '@/lib/landing-look'
import '../../landing.css'

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
  const look = await getLandingLook()

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
        <a href={`/?lang=${locale}`} className="lp-logo">
          Viral<span>PX</span>
        </a>
        <nav className="lp-nav-links">
          <a href={`/blog?lang=${locale}`}>{locale === 'en' ? 'Blog' : 'المدوّنة'}</a>
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
        {/* Prose written in the dashboard, not a pasted standalone page:
            HtmlEmbed's white canvas is for the latter, and it put the whole
            article on a white slab in a dark theme. Rendered plainly, the way
            tenant articles already are. */}
        {/* eslint-disable-next-line react/no-danger */}
        <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.contentHtml ?? '' }} />
      </article>

      <style>{landingTokensCss(look)}</style>
    </div>
  )
}
