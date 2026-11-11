import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata, Viewport } from 'next'
import { getPortfolio, mediaUrl } from '@/lib/portfolio'
import { alternatesFor, absoluteUrl, langQuery, pageLocale, personJsonLd, plainText } from '@/lib/seo'
import { portfolioName, portfolioTitle } from '@/lib/title'
import Analytics from '@/components/portfolio/Analytics'
import StudioPortfolio from '@/components/studio/StudioPortfolio'
import ScrollMemory from '@/components/portfolio/ScrollMemory'
import { buildStudioData } from '@/lib/studio-data'
import TrackVisit from '@/components/portfolio/TrackVisit'
import InstallApp from '@/components/portfolio/InstallApp'

type Params = {
  params: Promise<{ username: string }>
  searchParams?: Promise<{ lang?: string; preview?: string }>
}

/** Paint the phone's browser/status bar in the portfolio's own background colour. */
export async function generateViewport({ params, searchParams }: Params): Promise<Viewport> {
  const { username } = await params
  const { lang } = (await searchParams) ?? {}
  // Same arguments as the page's own call, so the cached read is shared.
  const data = await getPortfolio(username, await pageLocale(lang))
  return {
    themeColor: [
      { media: '(prefers-color-scheme: dark)', color: data?.settings?.colors?.bg || '#0A0A0A' },
      { media: '(prefers-color-scheme: light)', color: data?.settings?.colors?.bgLight || '#FFFFFF' },
    ],
  }
}

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const { username } = await params
  const { lang, preview } = (await searchParams) ?? {}
  // In the page's own language: the English page's title and description
  // were read from the Arabic texts.
  const data = await getPortfolio(username, await pageLocale(lang))
  if (!data) return { title: 'Not found' }
  // The dashboard's framed copy is not a page of its own.
  if (preview === '1') return { title: data.tenant.name, robots: { index: false, follow: false } }
  const heroName = data.settings?.content?.hero?.name || data.tenant.name
  const heroTitle = data.settings?.content?.hero?.title || ''
  // The tab and the search result read the hero, which is written as a design
  // rather than as a title: line breaks in it, and the name in whichever of the
  // two boxes suited the layout. `portfolioTitle` puts the name first and takes
  // the breaks out; `plainText` does the same for the bio behind the snippet.
  const description = plainText(data.settings?.content?.about?.text, 160)
  const cover = mediaUrl(data.settings?.brand?.heroCover, 'card')
  const full = portfolioTitle(heroName, heroTitle, data.tenant.name)
  // iOS ignores manifest icons — it reads apple-touch-icon — so point it at the
  // same rendered PNG the manifest uses.
  const appIcon = `/${username}/icon-512.png`
  return {
    title: full,
    description,
    manifest: `/${username}/manifest.webmanifest`,
    icons: { icon: appIcon, apple: appIcon },
    appleWebApp: {
      capable: true,
      // The home-screen label sits under an icon: a sentence does not fit.
      title: portfolioName(heroName, heroTitle, data.tenant.name),
      statusBarStyle: 'black-translucent',
    },
    // Next emits the modern `mobile-web-app-capable`; older iOS Safari still
    // only understands the apple-prefixed one.
    other: { 'apple-mobile-web-app-capable': 'yes' },
    // One address per page. Without this the same portfolio counted as two
    // pages (www and bare) and its ranking was split between them. On a client's
    // own domain the canonical is that domain, so the address they pay for is
    // the one that ranks.
    // The token Search Console hands you. Next renders it as the meta tag
    // Google looks for.
    verification: data.settings?.seoTools?.searchConsole
      ? { google: data.settings.seoTools.searchConsole }
      : undefined,
    alternates: await alternatesFor(`/${username}`, {
      tenantSlug: username,
      locale: await pageLocale(lang),
    }),
    openGraph: {
      title: full,
      description,
      images: cover ? [cover] : undefined,
      type: 'profile',
    },
    twitter: { card: 'summary_large_image', title: full, description },
  }
}

export default async function PortfolioPage({ params, searchParams }: Params) {
  const { username } = await params
  const { lang, preview } = (await searchParams) ?? {}
  // Framed in the dashboard: not a visit, and not for Google Analytics.
  const isPreview = preview === '1'
  const locale = await pageLocale(lang)
  const data = await getPortfolio(username, locale)
  if (!data) notFound()
  // Suspended clients: hide the public site.
  if ((data.tenant as { suspended?: boolean }).suspended) notFound()

  const { tenant, settings } = data
  const content = settings?.content ?? {}
  const brand = settings?.brand ?? {}
  const q = await langQuery(locale)

  const sharedHead = (
    <>
      <InstallApp
        label={
          locale === 'en'
            ? `Add ${content.hero?.name || tenant.name} to your home screen`
            : `ثبّت ${content.hero?.name || tenant.name} على شاشتك`
        }
      />
      {/* The portfolio as a person: the name, the job title, the photo and the
          accounts are all on the page already — this is what ties them
          together for a search engine. Articles have declared themselves as
          BlogPosting all along; the portfolio itself declared nothing.
          eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            personJsonLd({
              name: content.hero?.name || tenant.name,
              jobTitle: content.hero?.title || null,
              description: content.hero?.desc || content.about?.text || null,
              image: mediaUrl(brand.avatar, 'card') || mediaUrl(brand.photo, 'card'),
              url: await absoluteUrl(`/${tenant.slug}`, tenant.slug),
              email: content.contact?.email || null,
              sameAs: [
                settings?.social?.behance,
                settings?.social?.instagram,
                settings?.social?.linkedin,
                settings?.social?.facebook,
                settings?.social?.vimeo,
              ].filter((u): u is string => typeof u === 'string' && /^https?:\/\//.test(u)),
            }),
          ),
        }}
      />
    </>
  )

  return (
    <>
      {!isPreview && <Analytics id={settings?.seoTools?.analyticsId} />}
      {!isPreview && <TrackVisit tenant={tenant.id} page="home" />}
      {sharedHead}
      <ScrollMemory />
      <StudioPortfolio d={buildStudioData(data, locale, q)} />
    </>
  )
}
