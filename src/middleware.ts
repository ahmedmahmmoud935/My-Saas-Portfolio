import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Hosts that are the app itself (not a client custom domain) → pass through.
const PRIMARY = new Set(['localhost', '127.0.0.1'])
const appHost = (process.env.NEXT_PUBLIC_SERVER_URL || '')
  .replace(/^https?:\/\//, '')
  .replace(/\/.*$/, '')
  .toLowerCase()
if (appHost) PRIMARY.add(appHost)

// Cache the domain→slug map (module scope survives across invocations per instance).
let cache: { at: number; map: Record<string, string> } = { at: 0, map: {} }

async function getMap(origin: string): Promise<Record<string, string>> {
  if (Date.now() - cache.at < 60_000) return cache.map
  try {
    const res = await fetch(`${origin}/api/domains`, { cache: 'no-store' })
    if (res.ok) cache = { at: Date.now(), map: (await res.json()) as Record<string, string> }
  } catch {
    /* keep old cache */
  }
  return cache.map
}

export async function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase()
  if (!host || PRIMARY.has(host) || host.endsWith('.sslip.io')) return NextResponse.next()

  const slug = (await getMap(req.nextUrl.origin))[host]
  if (!slug) return NextResponse.next() // unknown domain → serve the main app (landing)

  const url = req.nextUrl.clone()
  if (url.pathname === `/${slug}` || url.pathname.startsWith(`/${slug}/`)) return NextResponse.next()
  url.pathname = url.pathname === '/' ? `/${slug}` : `/${slug}${url.pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Portfolio paths only — leave dashboard/admin/api/static alone.
  matcher: ['/((?!api|_next/static|_next/image|admin|dashboard|login|favicon.ico|robots.txt|sitemap.xml).*)'],
}
