import { headers } from 'next/headers'

const APP_ORIGIN = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')

/** The app's own host, so a request on it isn't mistaken for a client domain. */
const appHost = APP_ORIGIN.replace(/^https?:\/\//, '').toLowerCase()

/**
 * The origin this page should call its own.
 *
 * A client on a custom domain was being given a canonical on the platform's
 * domain, which tells a search engine the real page lives there — so the
 * domain they pay for could never rank for their own work. When the request
 * arrives on a mapped custom domain, that domain is the canonical one.
 */
export async function siteOrigin(): Promise<string> {
  const host = (await headers()).get('x-pf-host') || ''
  if (!host || host === appHost || host === 'localhost' || host === '127.0.0.1') return APP_ORIGIN
  return `https://${host}`
}

/**
 * Canonical + hreflang for one page.
 *
 * `path` is the path on the platform (/ahmed/project/3). On a custom domain the
 * tenant prefix is dropped, because there the portfolio is the site root.
 */
export async function alternatesFor(
  path: string,
  opts?: { tenantSlug?: string; locale?: 'ar' | 'en' },
): Promise<{ canonical: string; languages: Record<string, string> }> {
  const origin = await siteOrigin()
  const onCustomDomain = origin !== APP_ORIGIN
  const slug = opts?.tenantSlug
  const localPath =
    onCustomDomain && slug ? path.replace(new RegExp(`^/${slug}`), '') || '/' : path
  const url = `${origin}${localPath === '/' ? '' : localPath}`
  const sep = localPath.includes('?') ? '&' : '?'
  const ar = `${url}${sep}lang=ar`
  const en = `${url}${sep}lang=en`

  // Each language is its own page and says so.
  //
  // Pointing both languages at the bare URL looked tidy and quietly disabled
  // the hreflang set: an hreflang annotation is only honoured on a page whose
  // canonical is itself, and here the Arabic page's canonical named a
  // different address. So the two versions were declared duplicates of one
  // page and the alternates were dropped.
  const canonical = opts?.locale === 'ar' ? ar : opts?.locale === 'en' ? en : url || origin

  return {
    canonical,
    languages: {
      ar,
      en,
      // Which one a search engine should show when it has no better idea.
      'x-default': url || origin,
    },
  }
}

/** Absolute URL for a path on this site (structured data needs absolute ids). */
export async function absoluteUrl(path: string): Promise<string> {
  const origin = await siteOrigin()
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

type PersonInput = {
  name: string
  jobTitle?: string | null
  description?: string | null
  image?: string | null
  url: string
  /** Profile links — schema.org uses these to tie the page to known accounts. */
  sameAs?: string[]
  email?: string | null
}

/**
 * The portfolio as a person, not just a page.
 *
 * Articles already declared themselves as BlogPosting; a portfolio declared
 * nothing at all, so nothing connected the name, the photo, the job title and
 * the social accounts that are all sitting on the page in plain sight.
 */
export function personJsonLd(p: PersonInput) {
  const person: Record<string, unknown> = {
    '@type': 'Person',
    name: p.name,
    url: p.url,
  }
  if (p.jobTitle) person.jobTitle = p.jobTitle
  if (p.description) person.description = p.description
  if (p.image) person.image = p.image
  if (p.email) person.email = p.email
  const links = (p.sameAs ?? []).filter(Boolean)
  if (links.length) person.sameAs = links

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: p.url,
    name: p.name,
    mainEntity: person,
  }
}

/** One project as a piece of work, credited to its author. */
export function creativeWorkJsonLd(w: {
  name: string
  description?: string | null
  image?: string | null
  url: string
  authorName: string
  authorUrl: string
  datePublished?: string | null
  genre?: string | null
}) {
  const out: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: w.name,
    url: w.url,
    author: { '@type': 'Person', name: w.authorName, url: w.authorUrl },
  }
  if (w.description) out.description = w.description
  if (w.image) out.image = w.image
  if (w.datePublished) out.datePublished = w.datePublished
  if (w.genre) out.genre = w.genre
  return out
}
