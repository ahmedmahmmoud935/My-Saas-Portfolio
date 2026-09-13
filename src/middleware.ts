import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
function localeHeaders(req: NextRequest, slug: string | null, langs: Record<string, string>) {
  const asked = req.nextUrl.searchParams.get('lang')
  const lang = asked === 'ar' || asked === 'en' ? asked : slug ? (langs[slug] ?? 'en') : 'en'
  const headers = new Headers(req.headers)
  headers.set('x-pf-lang', lang)
  // The host the visitor typed. A client on their own domain should have that
  // domain in their canonical, not the platform's.
  headers.set('x-pf-host', (req.headers.get('host') || '').split(':')[0].toLowerCase())
  return headers
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
        new URL(`${req.nextUrl.pathname}${req.nextUrl.search}`, `https://${renamed}.${BASE}`),
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
        new URL(`${req.nextUrl.pathname}${req.nextUrl.search}`, `https://${owned}`),
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
    if (slug && owner && host) {
      const rest = req.nextUrl.pathname.slice(slug.length + 1)
      return NextResponse.redirect(new URL(`${rest || '/'}${req.nextUrl.search}`, `https://${host}`), 308)
    }
    // No host to send it to (developing on localhost): serve it in place.
    if (slug && renamed) {
      const url = req.nextUrl.clone()
      url.pathname = `/${renamed}${req.nextUrl.pathname.slice(slug.length + 1)}`
      return NextResponse.redirect(url, 308)
    }
    return NextResponse.next({ request: { headers: localeHeaders(req, slug, map.langs) } })
  }

  const headers = localeHeaders(req, tenantSlug, map.langs)
  const url = req.nextUrl.clone()
  if (url.pathname === `/${tenantSlug}` || url.pathname.startsWith(`/${tenantSlug}/`)) {
    return NextResponse.next({ request: { headers } })
  }
  url.pathname = url.pathname === '/' ? `/${tenantSlug}` : `/${tenantSlug}${url.pathname}`
  return NextResponse.rewrite(url, { request: { headers } })
}

export const config = {
  // Portfolio paths only — leave dashboard/admin/api/static alone.
  matcher: ['/((?!api|_next/static|_next/image|admin|dashboard|login|favicon.ico|robots.txt|sitemap.xml).*)'],
}
