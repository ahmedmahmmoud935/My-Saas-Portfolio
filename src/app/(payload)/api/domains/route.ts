import { getPayload } from 'payload'
import config from '@payload-config'
import { tenantHost } from '@/lib/tenant-url'
import { settingsLang } from '@/lib/site-lang'

export const dynamic = 'force-dynamic'

/**
 * What the middleware needs to know about every portfolio, in one small
 * cacheable document:
 *
 *   domains — custom domain → tenant slug, so a client's own domain resolves
 *             to their portfolio.
 *   slugs   — a username that has been renamed → the one it is now, so every
 *             address given out under the old one still arrives.
 *   live    — every username in use, so a subdomain of the platform can be
 *             recognised as a portfolio before the page is reached.
 *   hosts   — username → the one host that portfolio should be read on, so the
 *             old path form can be sent there instead of serving a copy.
 *   langs   — tenant slug → the language that portfolio is actually written in,
 *             so `<html lang>` can say so. Without it every page declared "en",
 *             including portfolios that are Arabic from top to bottom, and a
 *             search engine believes the tag over the text.
 *
 * The language comes from the direction the owner pinned in the Design tab — a
 * site pinned right-to-left is an Arabic site. Most owners never touch that
 * setting, so when it is unset the script of their own headline decides
 * instead: a portfolio whose hero reads in Arabic is an Arabic page whether or
 * not anyone ticked a box, and saying otherwise is the thing that was wrong.
 */
export async function GET() {
  const domains: Record<string, string> = {}
  const langs: Record<string, string> = {}
  const slugs: Record<string, string> = {}
  let live: string[] = []
  const hosts: Record<string, string> = {}
  try {
    const payload = await getPayload({ config })
    const tenants = await payload.find({ collection: 'tenants', limit: 2000, depth: 0 })
    for (const t of tenants.docs) {
      if (t.domain && t.slug) {
        domains[t.domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')] = t.slug
      }
    }

    /* Renamed usernames, read off the redirects a rename writes. Only the
       single-segment rows are usernames — the rest are articles and posts,
       which the pages themselves resolve — and only those pointing at a
       portfolio that still exists. */
    const liveSet = new Set(tenants.docs.map((t) => t.slug))
    live = [...liveSet]
    for (const t of tenants.docs) {
      const host = tenantHost(t.slug, t.domain)
      if (host) hosts[t.slug] = host
    }
    const moved = await payload.db.find({
      collection: 'redirects',
      where: { auto: { equals: true } } as never,
      limit: 2000,
      pagination: false,
    })
    for (const r of moved.docs as { from?: string; to?: string }[]) {
      const from = (r.from ?? '').split('/').filter(Boolean)
      const to = (r.to ?? '').split('/').filter(Boolean)
      if (from.length === 1 && to.length === 1 && liveSet.has(to[0]) && !liveSet.has(from[0])) {
        slugs[from[0]] = to[0]
      }
    }

    const settings = await payload.find({ collection: 'site-settings', limit: 2000, depth: 0 })
    const slugById = new Map(tenants.docs.map((t) => [t.id, t.slug]))
    for (const s of settings.docs) {
      const owner = s.tenant
      const id = typeof owner === 'object' ? (owner as { id?: number })?.id : owner
      const slug = typeof id === 'number' ? slugById.get(id) : undefined
      if (!slug) continue
      const own = settingsLang(s as Parameters<typeof settingsLang>[0])
      if (own) langs[slug] = own
    }
  } catch {
    /* DB unavailable — empty maps */
  }
  return Response.json(
    { domains, langs, slugs, live, hosts },
    { headers: { 'cache-control': 'public, max-age=60' } },
  )
}
