/**
 * Where a portfolio lives — the one address it answers on.
 *
 * Every portfolio now has a subdomain of the platform (kamal.viralpx.com), and
 * a client who bought a domain of their own has that instead. Both used to be
 * reachable alongside the old path form (viralpx.com/kamal), which is three
 * addresses for one page: a search engine treats them as competing copies and
 * splits the standing of the name between them.
 *
 * So one of them is the address, and the others send you to it. This decides
 * which one, and it is the only place that decides.
 *
 * Client-safe: the sitemap, the pages' canonicals, the dashboard's links and
 * the middleware's redirect all have to agree, and they only can if they are
 * reading the same rule.
 */

const APP = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
const APP_HOST = APP.replace(/^https?:\/\//, '').toLowerCase()

/** The platform's domain, without the www a browser drops anyway. */
export const PLATFORM_BASE = APP_HOST.replace(/^www\./, '')

/* Names reserved for testing and local networks (RFC 2606 and friends). A
   client's domain field is typed by hand, and a leftover `demo.viralpx.test`
   would otherwise become the address every link and every canonical points
   at — a page nobody outside that machine can open. */
const NOT_PUBLIC = /\.(test|local|localhost|example|invalid)$/i

/** False while developing against localhost, where there are no subdomains. */
export function subdomainsWork(): boolean {
  return Boolean(PLATFORM_BASE) && PLATFORM_BASE.includes('.') && !NOT_PUBLIC.test(PLATFORM_BASE)
}

/** The host this portfolio should be read on, or null if there isn't one. */
export function tenantHost(slug: string, domain?: string | null): string | null {
  const own = (domain ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
  // A domain they actually bought wins: it is the one they tell people.
  if (own && own.includes('.') && !NOT_PUBLIC.test(own)) return own
  return subdomainsWork() ? `${slug}.${PLATFORM_BASE}` : null
}

/**
 * A full address on that host. `path` is what follows the portfolio's root —
 * '' for the portfolio itself, '/project/3' for a project.
 *
 * Falls back to the old path form wherever a host cannot be worked out, which
 * is what keeps local development (and any install without a domain) working.
 */
export function tenantUrl(slug: string, domain?: string | null, path = ''): string {
  const host = tenantHost(slug, domain)
  return host ? `https://${host}${path}` : `${APP}/${slug}${path}`
}
