import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

// Map of custom domain → tenant slug. Used by middleware to resolve a client's
// own domain to their portfolio. Small + cacheable.
export async function GET() {
  const map: Record<string, string> = {}
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'tenants',
      where: { domain: { exists: true } },
      limit: 2000,
      depth: 0,
    })
    for (const t of res.docs) {
      if (t.domain && t.slug) map[t.domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')] = t.slug
    }
  } catch {
    /* DB unavailable — empty map */
  }
  return Response.json(map, { headers: { 'cache-control': 'public, max-age=60' } })
}
