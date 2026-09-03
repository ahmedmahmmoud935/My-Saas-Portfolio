import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Hosts that are the app itself (not a client custom domain) → pass through.
const PRIMARY = new Set(['localhost', '127.0.0.1'])
const appHost = (process.env.NEXT_PUBLIC_SERVER_URL || '')
  .replace(/^https?:\/\//, '')
  .replace(/\/.*$/, '')
  .toLowerCase()
if (appHost) PRIMARY.add(appHost)

type SiteMap = { domains: Record<string, string>; langs: Record<string, string> }

// Cache the map (module scope survives across invocations per instance).
let cache: { at: number; map: SiteMap } = { at: 0, map: { domains: {}, langs: {} } }

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

  if (isPrimary || !mappedSlug) {
    const slug = slugFromPath(req.nextUrl.pathname)
    return NextResponse.next({ request: { headers: localeHeaders(req, slug, map.langs) } })
  }

  const headers = localeHeaders(req, mappedSlug, map.langs)
  const url = req.nextUrl.clone()
  if (url.pathname === `/${mappedSlug}` || url.pathname.startsWith(`/${mappedSlug}/`)) {
    return NextResponse.next({ request: { headers } })
  }
  url.pathname = url.pathname === '/' ? `/${mappedSlug}` : `/${mappedSlug}${url.pathname}`
  return NextResponse.rewrite(url, { request: { headers } })
}

export const config = {
  // Portfolio paths only — leave dashboard/admin/api/static alone.
  matcher: ['/((?!api|_next/static|_next/image|admin|dashboard|login|favicon.ico|robots.txt|sitemap.xml).*)'],
}
