import { getPayload } from 'payload'
import config from '@payload-config'
import legacyData from './legacy-data.json'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * One-off importer for the old Flask/SQLite portfolio → Payload.
 * Guarded (ENABLE_SEED_ROUTES=true + ?key=viralpx-migrate). Remove before launch.
 *
 * Data comes from scripts/legacy-data.json (produced by scripts/export-legacy.py),
 * where localized leaves are {__loc:{ar,en}} and media are {__media:url}.
 *
 * Steps (GET ?step=…):
 *   status               — counts + media progress
 *   reset&confirm=1      — wipe the target tenants (content + media + user + tenant)
 *   go[&batch=N]         — ensure tenants/users, upload next N media; when all media
 *                          are in, build site-settings + all collections. Call repeatedly.
 */

type Loc = { __loc: { ar: string; en: string } }
type Med = { __media: string }
type Node = unknown

const isLoc = (n: Node): n is Loc => !!n && typeof n === 'object' && '__loc' in (n as object)
const isMed = (n: Node): n is Med => !!n && typeof n === 'object' && '__media' in (n as object)

const basename = (url: string) => url.split('?')[0].split('/').pop() || url
// Match media by hash WITHOUT extension: Payload converts images to .webp on
// upload, so the stored filename (hash.webp) differs from the source url ext
// (hash.png/.jpg). Compare by the extensionless base to stay in sync.
const base = (s: string) => {
  const fn = basename(s)
  const d = fn.lastIndexOf('.')
  return d > 0 ? fn.slice(0, d) : fn
}
const mimeOf = (fn: string) => {
  const e = fn.toLowerCase().split('.').pop()
  return e === 'png' ? 'image/png'
    : e === 'gif' ? 'image/gif'
    : e === 'jpg' || e === 'jpeg' ? 'image/jpeg'
    : e === 'mp4' ? 'video/mp4'
    : 'image/webp'
}

// Resolve markers for a single locale + media map → a plain Payload data object.
function resolve(node: Node, locale: 'ar' | 'en', media: Record<string, number>): Node {
  if (isLoc(node)) return node.__loc[locale] ?? node.__loc.ar
  if (isMed(node)) return media[node.__media] // may be undefined if upload failed
  if (Array.isArray(node)) return node.map((n) => resolve(n, locale, media))
  if (node && typeof node === 'object') {
    const out: Record<string, Node> = {}
    for (const [k, v] of Object.entries(node)) out[k] = resolve(v, locale, media)
    return out
  }
  return node
}

// Build the EN update patch from the freshly-read AR doc (`live`) + source markers,
// carrying array-row ids from `live` so Payload aligns localized rows correctly.
function injectEn(live: Node, src: Node): Node {
  if (isLoc(src)) return src.__loc.en
  if (isMed(src)) return live && typeof live === 'object' ? (live as { id?: number }).id ?? live : live
  if (Array.isArray(src)) {
    return src.map((el, i) => {
      const liveEl = Array.isArray(live) ? live[i] : undefined
      const r = injectEn(liveEl, el)
      if (r && typeof r === 'object' && !Array.isArray(r) && liveEl && (liveEl as { id?: number }).id != null) {
        ;(r as { id?: number }).id = (liveEl as { id: number }).id
      }
      return r
    })
  }
  if (src && typeof src === 'object') {
    const out: Record<string, Node> = {}
    const liveObj = (live && typeof live === 'object' ? live : {}) as Record<string, Node>
    for (const [k, v] of Object.entries(src)) out[k] = injectEn(liveObj[k], v)
    return out
  }
  return src
}

const hasLoc = (n: Node): boolean =>
  isLoc(n) ? true
    : Array.isArray(n) ? n.some(hasLoc)
    : n && typeof n === 'object' && !isMed(n) ? Object.values(n).some(hasLoc)
    : false

type Tenant = {
  slug: string; name: string; email: string; isOwner: boolean; storageLimitMb: number
  media: string[]
  siteSettings: Record<string, Node>
  projects: Record<string, Node>[]
  achievements: Record<string, Node>[]
  logos: Record<string, Node>[]
  testimonials: Record<string, Node>[]
  articles: Record<string, Node>[]
}

function loadData(): { tenants: Tenant[] } {
  return legacyData as unknown as { tenants: Tenant[] }
}

const CONTENT_COLLS = ['projects', 'achievements', 'logos', 'testimonials', 'articles', 'site-settings'] as const

export async function GET(req: Request) {
  if (process.env.ENABLE_SEED_ROUTES !== 'true') {
    return Response.json({ error: 'not found' }, { status: 404 })
  }
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== 'viralpx-migrate') {
    return Response.json({ error: 'bad key' }, { status: 401 })
  }
  const step = url.searchParams.get('step') || 'status'
  const payload = await getPayload({ config })
  const { tenants } = loadData()

  const findTenant = async (slug: string) =>
    (await payload.find({ collection: 'tenants', where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]

  const uploadedFilenames = async (tid: number): Promise<Set<string>> => {
    const res = await payload.find({ collection: 'media', where: { tenant: { equals: tid } }, limit: 5000, depth: 0 })
    return new Set(res.docs.map((m) => (m.filename ? base(m.filename) : '')).filter(Boolean))
  }

  // ── status ────────────────────────────────────────────────────────────────
  if (step === 'status') {
    const out = []
    for (const t of tenants) {
      const tenant = await findTenant(t.slug)
      const set = tenant ? await uploadedFilenames(tenant.id) : new Set<string>()
      const done = t.media.filter((u) => set.has(base(u))).length
      out.push({ slug: t.slug, exists: !!tenant, media: `${done}/${t.media.length}` })
    }
    return Response.json({ ok: true, tenants: out })
  }

  // ── reset (wipe target tenants) ─────────────────────────────────────────────
  if (step === 'reset') {
    if (url.searchParams.get('confirm') !== '1') {
      return Response.json({ ok: false, error: 'pass &confirm=1' }, { status: 400 })
    }
    const wiped = []
    for (const t of tenants) {
      const tenant = await findTenant(t.slug)
      if (!tenant) continue
      for (const coll of CONTENT_COLLS) {
        await payload.delete({ collection: coll, where: { tenant: { equals: tenant.id } } })
      }
      await payload.delete({ collection: 'media', where: { tenant: { equals: tenant.id } } })
      await payload.delete({ collection: 'users', where: { email: { equals: t.email } } })
      await payload.delete({ collection: 'tenants', id: tenant.id })
      wiped.push(t.slug)
    }
    return Response.json({ ok: true, wiped })
  }

  // ── go (ensure tenants/users → upload media → build) ────────────────────────
  if (step === 'go') {
    const batch = Math.max(1, Math.min(20, Number(url.searchParams.get('batch')) || 5))

    // 1. ensure tenant + login user
    const tenantIds: Record<string, number> = {}
    for (const t of tenants) {
      let tenant = await findTenant(t.slug)
      if (!tenant) {
        tenant = await payload.create({
          collection: 'tenants',
          data: { name: t.name, slug: t.slug, storageLimitMb: t.storageLimitMb },
        })
      }
      tenantIds[t.slug] = tenant.id
      const u = await payload.find({ collection: 'users', where: { email: { equals: t.email } }, limit: 1, depth: 0 })
      if (!u.docs[0]) {
        await payload.create({
          collection: 'users',
          data: { email: t.email, password: 'password123', name: t.name, isOwner: t.isOwner, tenants: [{ tenant: tenant.id }] },
        })
      }
    }

    // 2. upload up to `batch` pending media across tenants
    let uploaded = 0
    const errors: string[] = []
    for (const t of tenants) {
      if (uploaded >= batch) break
      const tid = tenantIds[t.slug]
      const set = await uploadedFilenames(tid)
      for (const u of t.media) {
        if (uploaded >= batch) break
        const fn = basename(u)
        if (set.has(base(u))) continue
        try {
          const ctrl = new AbortController()
          const to = setTimeout(() => ctrl.abort(), 20000)
          const res = await fetch(u, { signal: ctrl.signal })
          clearTimeout(to)
          if (!res.ok) throw new Error(`fetch ${res.status}`)
          const buf = Buffer.from(await res.arrayBuffer())
          await payload.create({
            collection: 'media',
            data: { alt: fn, tenant: tid },
            file: { data: buf, mimetype: mimeOf(fn), name: fn, size: buf.length },
          })
          set.add(base(u))
          uploaded++
        } catch (e) {
          errors.push(`${t.slug}/${fn}: ${(e as Error).message}`)
        }
      }
    }

    // recompute remaining
    let remaining = 0
    for (const t of tenants) {
      const set = await uploadedFilenames(tenantIds[t.slug])
      remaining += t.media.filter((u) => !set.has(base(u))).length
    }

    const force = url.searchParams.get('force') === '1'
    if (!force && (remaining > 0 || uploaded > 0)) {
      return Response.json({ ok: true, phase: 'media', uploaded, remaining, errors: errors.slice(0, 10) })
    }

    // 3. all media present (or forced) → build content (idempotent: wipe content, keep media)
    const summary = await build(payload, tenants, tenantIds, uploadedFilenames)
    return Response.json({ ok: true, phase: 'build', complete: true, summary })
  }

  return Response.json({ ok: false, error: 'unknown step' }, { status: 400 })
}

// ── content builder ───────────────────────────────────────────────────────────
async function build(
  payload: Awaited<ReturnType<typeof getPayload>>,
  tenants: Tenant[],
  tenantIds: Record<string, number>,
  uploadedFilenames: (tid: number) => Promise<Set<string>>,
) {
  const summary: Record<string, unknown> = {}
  const errors: string[] = []

  for (const t of tenants) {
    const tid = tenantIds[t.slug]

    // media map: url → id (by stored filename)
    const all = await payload.find({ collection: 'media', where: { tenant: { equals: tid } }, limit: 5000, depth: 0 })
    const byFn: Record<string, number> = {}
    for (const m of all.docs) if (m.filename) byFn[base(m.filename)] = m.id
    const mmap: Record<string, number> = {}
    for (const u of t.media) { const id = byFn[base(u)]; if (id) mmap[u] = id }

    // wipe existing content (NOT media) so re-runs are clean
    for (const coll of ['projects', 'achievements', 'logos', 'testimonials', 'articles', 'site-settings'] as const) {
      await payload.delete({ collection: coll, where: { tenant: { equals: tid } } })
    }

    // helper: create with AR then patch EN (only if source has localized leaves)
    const createLocalized = async (
      collection: 'projects' | 'achievements' | 'logos' | 'testimonials' | 'articles' | 'site-settings',
      src: Record<string, Node>,
    ) => {
      const ar = resolve(src, 'ar', mmap) as Record<string, Node>
      const created = await payload.create({
        collection,
        data: { ...ar, tenant: tid } as never,
        locale: 'ar',
      })
      if (hasLoc(src)) {
        const live = await payload.findByID({ collection, id: created.id, locale: 'ar', depth: 0 })
        const en = injectEn(live, src) as Record<string, Node>
        await payload.update({ collection, id: created.id, data: en as never, locale: 'en' })
      }
      return created.id
    }

    // site-settings (one per tenant)
    try {
      await createLocalized('site-settings', t.siteSettings)
    } catch (e) {
      errors.push(`${t.slug}/site-settings: ${(e as Error).message}`)
    }

    const counts = { projects: 0, achievements: 0, logos: 0, testimonials: 0, articles: 0 }
    for (const p of t.projects) {
      try { await createLocalized('projects', p); counts.projects++ }
      catch (e) { errors.push(`${t.slug}/project "${p.title}": ${(e as Error).message}`) }
    }
    for (const a of t.achievements) {
      try { await createLocalized('achievements', a); counts.achievements++ }
      catch (e) { errors.push(`${t.slug}/achv: ${(e as Error).message}`) }
    }
    for (const l of t.logos) {
      try { await createLocalized('logos', l); counts.logos++ }
      catch (e) { errors.push(`${t.slug}/logo: ${(e as Error).message}`) }
    }
    for (const ts of t.testimonials) {
      try { await createLocalized('testimonials', ts); counts.testimonials++ }
      catch (e) { errors.push(`${t.slug}/tstm: ${(e as Error).message}`) }
    }
    for (const ar of t.articles) {
      try { await createLocalized('articles', ar); counts.articles++ }
      catch (e) { errors.push(`${t.slug}/article: ${(e as Error).message}`) }
    }
    summary[t.slug] = counts
  }

  return { summary, errors: errors.slice(0, 20) }
}
