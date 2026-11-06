import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig, Payload } from 'payload'
import { PLATFORM_BASE, subdomainsWork } from './tenant-url'

/**
 * A portfolio's pages dropped from Cloudflare's cache the moment it changes.
 *
 * Portfolio pages are held at Cloudflare's edge for a minute, which takes
 * most of a second off every visit. But each of Cloudflare's locations keeps
 * its own copy, so a saved change could take two or three minutes to show,
 * and the owner checking their work saw the old page and reached for "clear
 * the cache". Now a save tells Cloudflare to forget that portfolio's pages,
 * in both languages, and the next visit builds them fresh.
 *
 * Only the platform's own subdomains are cached by Cloudflare: a domain a
 * client bought sits in no zone of ours, so there is nothing to purge there.
 *
 * Needs CF_ZONE_ID and CF_PURGE_TOKEN (a token allowed only Cache Purge on
 * this zone). Without them this does nothing, and pages simply age out as
 * before.
 */

const ZONE = process.env.CF_ZONE_ID
const TOKEN = process.env.CF_PURGE_TOKEN
// Cloudflare takes this many addresses in one purge call on every plan.
const PER_CALL = 30
// One save writes several documents; they are purged together.
const SETTLE_MS = 1500

const waiting = new Map<number, ReturnType<typeof setTimeout>>()

const idOf = (v: unknown): number | undefined =>
  typeof v === 'object' && v ? (v as { id?: number }).id : typeof v === 'number' ? v : undefined

/** Every address of one portfolio that a visitor can open, in both languages. */
async function addressesOf(payload: Payload, tenantId: number): Promise<string[]> {
  const tenant = await payload.findByID({ collection: 'tenants', id: tenantId, depth: 0 }).catch(() => null)
  if (!tenant?.slug) return []
  const host = `https://${tenant.slug}.${PLATFORM_BASE}`

  const [projects, articles] = await Promise.all([
    payload.find({ collection: 'projects', where: { tenant: { equals: tenantId } }, limit: 1000, depth: 0, pagination: false, select: {} }),
    payload.find({ collection: 'articles', where: { tenant: { equals: tenantId } }, limit: 1000, depth: 0, pagination: false, select: { slug: true } }),
  ])
  const paths = [
    '/',
    '/articles',
    ...projects.docs.map((p) => `/project/${p.id}`),
    ...articles.docs.map((a) => (a as { slug?: string }).slug).filter(Boolean).map((s) => `/articles/${s}`),
  ]
  // The bare address and both languages are three entries in the cache.
  return paths.flatMap((p) => [`${host}${p}`, `${host}${p}?lang=ar`, `${host}${p}?lang=en`])
}

async function purge(payload: Payload, tenantId: number) {
  const files = await addressesOf(payload, tenantId)
  for (let i = 0; i < files.length; i += PER_CALL) {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE}/purge_cache`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: files.slice(i, i + PER_CALL) }),
      signal: AbortSignal.timeout(8000),
    }).catch((e: unknown) => e as Error)
    if (res instanceof Error || !res.ok) {
      const why = res instanceof Error ? res.message : `${res.status} ${await res.text().catch(() => '')}`.slice(0, 300)
      payload.logger.warn(`[cdn-purge] tenant ${tenantId}: ${why}`)
      return
    }
  }
}

/** Ask for a portfolio's pages to be purged; saves in quick succession share one purge. */
export function queuePurge(payload: Payload, tenantId: number | undefined) {
  if (!ZONE || !TOKEN || !tenantId || !subdomainsWork()) return
  clearTimeout(waiting.get(tenantId))
  waiting.set(
    tenantId,
    setTimeout(() => {
      waiting.delete(tenantId)
      purge(payload, tenantId).catch((e) => payload.logger.warn(`[cdn-purge] tenant ${tenantId}: ${String(e)}`))
    }, SETTLE_MS),
  )
}

/**
 * The same collection, purging its portfolio's pages after every change and
 * delete. `tenantOf` says which portfolio a document belongs to.
 */
export function purgesPortfolio(
  c: CollectionConfig,
  tenantOf: (doc: Record<string, unknown>) => number | undefined = (doc) => idOf(doc.tenant),
): CollectionConfig {
  const afterChange: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
    queuePurge(req.payload, tenantOf(doc))
    // A document moved to another portfolio leaves a stale page behind there too.
    const before = previousDoc ? tenantOf(previousDoc) : undefined
    if (before && before !== tenantOf(doc)) queuePurge(req.payload, before)
    return doc
  }
  const afterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
    queuePurge(req.payload, tenantOf(doc))
    return doc
  }
  return {
    ...c,
    hooks: {
      ...c.hooks,
      afterChange: [...(c.hooks?.afterChange ?? []), afterChange],
      afterDelete: [...(c.hooks?.afterDelete ?? []), afterDelete],
    },
  }
}
