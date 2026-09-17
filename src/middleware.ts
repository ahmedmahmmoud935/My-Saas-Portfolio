import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { RESERVED_SLUGS } from '@/lib/slug-rules'

// Hosts that are the app itself (not a client custom domain) → pass through.
const PRIMARY = new Set(['localhost', '127.0.0.1'])
const appHost = (process.env.NEXT_PUBLIC_SERVER_URL || '')
  .replace(/^https?:\/\//, '')
  .replace(/\/.*$/, '')
  .toLowerCase()
if (appHost) PRIMARY.add(appHost)

type SiteMap = {
  domains: Record<string, string>
  langs: Record<string, string>
  /** A username that was renamed → what it is called now. */
  slugs: Record<string, string>
  /** Every username in use. */
  live: string[]
  /** username → the one host that portfolio is read on. */
  hosts: Record<string, string>
}

/* The platform's own domain, without the www a browser drops anyway: a
   portfolio is served at <username> under it. */
const BASE = appHost.replace(/^www\./, '')

/** The username a platform subdomain names, e.g. kamal.viralpx.com → "kamal". */
function subdomainLabel(host: string): string | null {
  if (!BASE || !host.endsWith(`.${BASE}`)) return null
  const label = host.slice(0, -(BASE.length + 1))
  return label && label !== 'www' && !label.includes('.') ? label : null
}

// Cache the map (module scope survives across invocations per instance).
let cache: { at: number; map: SiteMap } = {
  at: 0,
  map: { domains: {}, langs: {}, slugs: {}, live: [], hosts: {} },
}

async function getMap(fallbackOrigin: string): Promise<SiteMap> {
  if (Date.now() - cache.at < 60_000) return cache.map
  // Prefer an internal origin so we don't depend on the request host resolving
  // back to this app (spoofed/unresolved hosts would otherwise break lookup).
  const internal = process.env.INTERNAL_ORIGIN || `http://127.0.0.1:${process.env.PORT || '3000'}`
  for (const base of [internal, fallbackOrigin]) {
    try {
      const res = await fetch(`${base}/api/domains`, { cache: 'no-store' })
      if (res.ok) {
        cache = { at: Date.now(), map: (await res.json()) as SiteMap }
        return cache.map
      }
    } catch {
      /* try next base */
    }
  }
  return cache.map
}

/**
 * The language and the host the page is really being served as, handed to the
 * server components as request headers.
 *
 * The root layout renders `<html lang dir>` and sits above every page, so it
 * cannot read the URL's `?lang` or know whose portfolio it is. It read neither
 * and hard-coded English, which told search engines that portfolios written
 * entirely in Arabic were English pages.
 *
 * `?lang` wins when it is there — those are the addresses hreflang points at.
 * Otherwise the portfolio's own pinned direction decides, and failing that the
 * app default.
 */
function localeHeaders(req: NextRequest, slug: string | null, map: SiteMap) {
  const asked = req.nextUrl.searchParams.get('lang')
  const site = siteLang(slug, map)
  const lang = asked === 'ar' || asked === 'en' ? asked : site
  const headers = new Headers(req.headers)
  headers.set('x-pf-lang', lang)
  /* The language the bare address serves, whatever this particular request
     asked for — which is how a page knows that `?lang=ar` on an Arabic site
     adds nothing, and leaves it off the addresses it hands to a reader or a
     crawler. */
  headers.set('x-pf-site-lang', site)
  // The host the visitor typed. A client on their own domain should have that
  // domain in their canonical, not the platform's.
  headers.set('x-pf-host', (req.headers.get('host') || '').split(':')[0].toLowerCase())
  return headers
}

/**
 * The language a bare address is read in.
 *
 * A portfolio is read in the language it is written in — the direction its
 * owner pinned. The platform's own pages (the landing, the blog, the legal
 * pages) have no owner to ask and answer for themselves: Arabic, which is what
 * the product is written in and what the people it is sold to read.
 */
function siteLang(slug: string | null, map: SiteMap): 'ar' | 'en' {
  const own = slug ? map.langs[slug] : null
  if (own === 'ar' || own === 'en') return own
  return isTenant(slug, map) ? 'en' : 'ar'
}

/** Whether this address belongs to a client's portfolio or to the platform. */
const isTenant = (slug: string | null, map: SiteMap) =>
  !!slug && (map.live ?? []).includes(slug)

/**
 * `?lang=ar` on a page that is Arabic anyway is noise in an address people
 * paste, share and print on a card. The bare address is the site's own
 * language; the parameter only ever names the other one.
 */
function cleanSearch(req: NextRequest, site: 'ar' | 'en'): string {
  if (req.nextUrl.searchParams.get('lang') !== site) return req.nextUrl.search
  const params = new URLSearchParams(req.nextUrl.searchParams)
  params.delete('lang')
  const rest = params.toString()
  return rest ? `?${rest}` : ''
}

/**
 * The same, as a redirect — for a request that is otherwise served in place.
 *
 * Permanent for the platform, whose language is fixed. Temporary for a
 * portfolio, because its owner can switch the language it is written in, and a
 * 308 cached in a visitor's browser would go on swallowing `?lang=` long after
 * it stopped being the redundant one.
 */
function stripDefaultLang(req: NextRequest, site: 'ar' | 'en', permanent: boolean) {
  const search = cleanSearch(req, site)
  if (search === req.nextUrl.search) return null
  const url = req.nextUrl.clone()
  url.search = search
  return NextResponse.redirect(url, permanent ? 308 : 307)
}

/** The tenant a path already addresses, e.g. /ahmed/project/3 → "ahmed". */
const slugFromPath = (pathname: string) => pathname.split('/').filter(Boolean)[0] ?? null

export async function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase()
  const isPrimary = !host || PRIMARY.has(host) || host.endsWith('.sslip.io')

  const map = await getMap(req.nextUrl.origin)
  const mappedSlug = isPrimary ? null : map.domains[host]

  /* A portfolio on its own subdomain of the platform. It behaves exactly like
     a client's custom domain — same rewrite, same canonical — because to a
     reader it is one: their name is the first thing in the address. */
  const sub = !isPrimary && !mappedSlug ? subdomainLabel(host) : null
  if (sub) {
    const renamed = (map.slugs ?? {})[sub]
    if (renamed) {
      return NextResponse.redirect(
        new URL(
          `${req.nextUrl.pathname}${cleanSearch(req, siteLang(renamed, map))}`,
          `https://${renamed}.${BASE}`,
        ),
        308,
      )
    }
    // A name nobody has: the platform's own site rather than a dead end.
    if (!(map.live ?? []).includes(sub)) {
      return NextResponse.redirect(new URL('/', `https://${appHost}`), 308)
    }
    /* Once a client connects a domain of their own, that is the address —
       the subdomain hands over to it rather than serving the same pages at a
       second one. */
    const owned = (map.hosts ?? {})[sub]
    if (owned && owned !== host) {
      return NextResponse.redirect(
        new URL(`${req.nextUrl.pathname}${cleanSearch(req, siteLang(sub, map))}`, `https://${owned}`),
        308,
      )
    }
  }

  const tenantSlug = mappedSlug || sub

  if (isPrimary || !tenantSlug) {
    const slug = slugFromPath(req.nextUrl.pathname)
    /* The path form is not an address any more, it is a signpost. A portfolio
       is read on its own host — its subdomain, or the domain the client
       bought — and everything under /<username> is sent there permanently:
       the page keeps its one address, and a link handed out under the old
       shape still opens it. A renamed username travels the same road, in one
       hop rather than two. */
    const renamed = slug ? (map.slugs ?? {})[slug] : null
    const owner = renamed ?? (slug && (map.live ?? []).includes(slug) ? slug : null)
    const host = owner ? (map.hosts ?? {})[owner] : null
    /* Except the dashboard's preview, framed from the platform: sent to the
       portfolio's host it would be another origin, which the dashboard can
       frame but not paint unsaved changes into. It is marked noindex. */
    const framed = req.nextUrl.searchParams.get('preview') === '1'
    if (slug && owner && host && !framed) {
      const rest = req.nextUrl.pathname.slice(slug.length + 1)
      return NextResponse.redirect(
        new URL(`${rest || '/'}${cleanSearch(req, siteLang(owner, map))}`, `https://${host}`),
        308,
      )
    }
    // No host to send it to (developing on localhost): serve it in place.
    if (slug && renamed) {
      const url = req.nextUrl.clone()
      url.pathname = `/${renamed}${req.nextUrl.pathname.slice(slug.length + 1)}`
      return NextResponse.redirect(url, 308)
    }
    return (
      stripDefaultLang(req, siteLang(slug, map), !isTenant(slug, map)) ??
      NextResponse.next({ request: { headers: localeHeaders(req, slug, map) } })
    )
  }

  const redundant = stripDefaultLang(req, siteLang(tenantSlug, map), false)
  if (redundant) return redundant

  const headers = localeHeaders(req, tenantSlug, map)
  const url = req.nextUrl.clone()
  if (url.pathname === `/${tenantSlug}` || url.pathname.startsWith(`/${tenantSlug}/`)) {
    return NextResponse.next({ request: { headers } })
  }

  /* The review form is the platform's own page, and it already names the
     portfolio it is collecting a review for. Prefixing it like a section of
     the site turned /testimonial/<name> into /<name>/testimonial/<name>, which
     is nothing — so the button under the reviews led to a 404 on every
     portfolio read at its own address. Whoever the path names, the host
     decides whose form this is. */
  if (url.pathname === '/testimonial' || url.pathname.startsWith('/testimonial/')) {
    url.pathname = `/testimonial/${tenantSlug}`
    return NextResponse.rewrite(url, { request: { headers } })
  }

  /* The rest of what the platform answers on — the owner's dashboard, the
     account pages, the blog, the legal pages — is not a section of anybody's
     portfolio, and on a portfolio's host it was being prefixed into a path
     that exists nowhere: /<name>/owner, and a 404 where the dashboard should
     have been. These have one address, on the platform, and this is the road
     back to it. */
  const first = url.pathname.split('/').filter(Boolean)[0] ?? ''
  if (appHost && RESERVED_SLUGS.has(first)) {
    return NextResponse.redirect(
      new URL(`${url.pathname}${url.search}`, `https://${appHost}`),
      308,
    )
  }
  url.pathname = url.pathname === '/' ? `/${tenantSlug}` : `/${tenantSlug}${url.pathname}`
  return NextResponse.rewrite(url, { request: { headers } })
}

export const config = {
  // Portfolio paths only — leave dashboard/admin/api/static alone.
  matcher: ['/((?!api|_next/static|_next/image|admin|dashboard|login|favicon.ico|robots.txt|sitemap.xml).*)'],
}
