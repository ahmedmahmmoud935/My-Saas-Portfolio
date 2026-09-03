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
 * The language comes from the direction the owner pinned in the Design tab — a
 * site pinned right-to-left is an Arabic site. Most owners never touch that
 * setting, so when it is unset the script of their own headline decides
 * instead: a portfolio whose hero reads in Arabic is an Arabic page whether or
 * not anyone ticked a box, and saying otherwise is the thing that was wrong.
 */
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/

/** The script a headline is written in, when there is a headline to read. */
function scriptOf(text: unknown): 'ar' | null {
  return typeof text === 'string' && ARABIC.test(text) ? 'ar' : null
}
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
      if (!slug) continue
      const dir = (s.style as { direction?: string } | undefined)?.direction
      if (dir === 'rtl' || dir === 'ltr') {
        langs[slug] = dir === 'rtl' ? 'ar' : 'en'
        continue
      }
      const hero = (s.content as { hero?: { name?: string; title?: string } } | undefined)?.hero
      const guessed = scriptOf(hero?.name) ?? scriptOf(hero?.title)
      if (guessed) langs[slug] = guessed
    }
  } catch {
    /* DB unavailable — empty maps */
  }
  return Response.json({ domains, langs }, { headers: { 'cache-control': 'public, max-age=60' } })
}
