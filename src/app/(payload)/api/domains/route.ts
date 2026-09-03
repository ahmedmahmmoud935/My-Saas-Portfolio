import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

/**
 * What the middleware needs to know about every portfolio, in one small
 * cacheable document:
 *
 *   domains — custom domain → tenant slug, so a client's own domain resolves
 *             to their portfolio.
 *   langs   — tenant slug → the language that portfolio is actually written in,
 *             so `<html lang>` can say so. Without it every page declared "en",
 *             including portfolios that are Arabic from top to bottom, and a
 *             search engine believes the tag over the text.
 *
 * The language is taken from the direction the owner pinned in the Design tab;
 * a site pinned right-to-left is an Arabic site. Unpinned falls back to the
 * app default, which is what the URL's own ?lang decides.
 */
export async function GET() {
  const domains: Record<string, string> = {}
  const langs: Record<string, string> = {}
  try {
    const payload = await getPayload({ config })
    const tenants = await payload.find({ collection: 'tenants', limit: 2000, depth: 0 })
    for (const t of tenants.docs) {
      if (t.domain && t.slug) {
        domains[t.domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')] = t.slug
      }
    }

    const settings = await payload.find({ collection: 'site-settings', limit: 2000, depth: 0 })
    const slugById = new Map(tenants.docs.map((t) => [t.id, t.slug]))
    for (const s of settings.docs) {
      const owner = s.tenant
      const id = typeof owner === 'object' ? (owner as { id?: number })?.id : owner
      const slug = typeof id === 'number' ? slugById.get(id) : undefined
      const dir = (s.style as { direction?: string } | undefined)?.direction
      if (slug && (dir === 'rtl' || dir === 'ltr')) langs[slug] = dir === 'rtl' ? 'ar' : 'en'
    }
  } catch {
    /* DB unavailable — empty maps */
  }
  return Response.json({ domains, langs }, { headers: { 'cache-control': 'public, max-age=60' } })
}
