'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'
import { compressVideo } from './transcode'
import { VIDEO_QUALITY_DEFAULT, isVideoQuality } from './video-quality'
import type { ProjectInput, ModuleInput, Bi } from './project-types'
import { biEmpty } from './project-types'
import type { VideoReport } from './project-types'
import type { Project } from '../payload-types'

type Blocks = NonNullable<Project['modules']>

/**
 * Map editor modules → Payload blocks for ONE locale.
 *
 * `ids` comes from the Arabic pass: reusing each block's id makes the English
 * pass update the same rows instead of replacing the list, which is what keeps
 * the two languages lined up.
 */
/** Pick one language, falling back to the other when a side was left blank.
 *  The dashboard only warns about a missing language, so the public page must
 *  still show *something* in both — an empty string wouldn't trigger Payload's
 *  locale fallback, and that fallback only points at Arabic anyway. */
function pick(v: Bi | undefined, locale: 'ar' | 'en'): string {
  if (!v) return ''
  const other = locale === 'ar' ? v.en : v.ar
  return biEmpty(v[locale]) ? other : v[locale]
}

function toBlocks(
  modules: ModuleInput[] | undefined,
  locale: 'ar' | 'en',
  ids?: (string | undefined)[],
): Blocks {
  return (modules ?? []).map((m, i) => {
    const id = ids?.[i] ? { id: ids[i] } : {}
    switch (m.type) {
      case 'text':
        return { ...id, blockType: 'text', textType: m.textType, value: pick(m.value, locale) }
      case 'image':
        return { ...id, blockType: 'image', src: m.srcId }
      case 'grid':
        return { ...id, blockType: 'grid', items: m.itemIds.map((src) => ({ src })) }
      case 'carousel':
        return { ...id, blockType: 'carousel', items: m.itemIds.map((src) => ({ src })) }
      case 'video':
        return { ...id, blockType: 'video', embedUrl: m.embedUrl }
      case 'beforeafter':
        return {
          blockType: 'beforeafter',
          before: m.beforeId,
          after: m.afterId,
          labelBefore: m.labelBefore,
          labelAfter: m.labelAfter,
        }
      case 'separator':
        return { ...id, blockType: 'separator', spacing: m.spacing }
    }
  }) as unknown as Blocks
}

/** Upload a file → Media (Payload does WebP + thumb/card; R2 or local). */
export async function uploadProjectMedia(formData: FormData) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  const file = formData.get('file') as File | null
  if (!file) throw new Error('no file')

  let buf: Buffer = Buffer.from(await file.arrayBuffer())
  let mimetype = file.type
  let name = file.name
  // Videos are compressed here; the result is reported back so the dashboard
  // can say what happened rather than silently storing a 70MB phone export.
  let video: VideoReport | undefined
  if (file.type.startsWith('video/')) {
    // The uploader sends the quality the client picked; anything else is the
    // balanced default.
    const q = formData.get('quality')
    const c = await compressVideo(buf, file.type, isVideoQuality(q) ? q : VIDEO_QUALITY_DEFAULT)
    if (c.buf && c.mimetype) {
      buf = c.buf
      mimetype = c.mimetype
      name = name.replace(/\.[^.]+$/, '') + '.mp4'
    }
    video = {
      compressed: Boolean(c.buf),
      fromMb: +(c.fromBytes / 1048576).toFixed(1),
      toMb: +((c.toBytes ?? c.fromBytes) / 1048576).toFixed(1),
      reason: c.reason,
      height: c.height,
    }
  }
  const media = await ctx.payload.create({
    collection: 'media',
    data: { tenant: ctx.tenantId, alt: name },
    file: { data: buf as Buffer<ArrayBuffer>, mimetype, name, size: buf.length },
  })
  const sizes = (media as { sizes?: { thumb?: { url?: string }; card?: { url?: string } } }).sizes
  return {
    id: media.id,
    url: media.url ?? null,
    thumbUrl: sizes?.thumb?.url ?? media.url ?? null,
    mimeType: media.mimeType ?? mimetype ?? null,
    video,
  }
}

async function assertOwnsProject(
  ctx: Awaited<ReturnType<typeof getDashboardContext>>,
  id: number,
) {
  if (!ctx) throw new Error('unauthorized')
  const p = await ctx.payload.findByID({ collection: 'projects', id, depth: 0 })
  const pt = typeof p.tenant === 'object' ? p.tenant?.id : p.tenant
  if (pt !== ctx.tenantId) throw new Error('forbidden')
  return p
}

export async function saveProject(input: ProjectInput) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')

  // Non-localized fields are identical in both passes.
  const shared = {
    tenant: ctx.tenantId,
    category: input.category ?? null,
    mediaType: input.mediaType,
    projectType: input.projectType,
    cover: input.coverId ?? null,
    videoUrl: input.videoUrl ?? null,
    videoKind: input.videoKind ?? 'reel',
    aspectRatio: input.aspectRatio ?? '9:16',
    images: (input.imageIds ?? []).map((image) => ({ image })),
    // Only touch `published` when explicitly provided (the toggle is a separate
    // action) — new projects fall back to the collection default (true).
    ...(input.published !== undefined ? { published: input.published } : {}),
  }

  // A text block's `value` is required, so one empty text element rejected the
  // whole save with a bare "فشل الحفظ". An element with nothing written in it
  // has nothing to publish either — drop it instead of blocking the save.
  const modules = (input.modules ?? []).filter(
    (m) => m.type !== 'text' || !biEmpty(m.value.ar) || !biEmpty(m.value.en),
  )

  const dataFor = (locale: 'ar' | 'en', ids?: (string | undefined)[]) => ({
    ...shared,
    title: pick(input.title, locale),
    description: pick(input.description, locale) || null,
    modules: toBlocks(modules, locale, ids),
  })

  /** Write Arabic, read back the block ids, then write English onto the same
   *  rows. Without the ids the second pass would rebuild the list and the two
   *  languages would drift apart. */
  const writeBothLocales = async (id: number) => {
    await ctx.payload.update({
      collection: 'projects',
      id,
      data: dataFor('ar') as never,
      locale: 'ar',
    })
    const saved = await ctx.payload.findByID({ collection: 'projects', id, depth: 0, locale: 'ar' })
    const ids = ((saved.modules ?? []) as { id?: string | null }[]).map((b) => b.id ?? undefined)
    await ctx.payload.update({
      collection: 'projects',
      id,
      data: dataFor('en', ids) as never,
      locale: 'en',
    })
  }

  if (input.id) {
    await assertOwnsProject(ctx, input.id)
    await writeBothLocales(input.id)
    return { ok: true, id: input.id }
  }

  // New work goes to the FRONT of the list, on the site and in the dashboard —
  // the newest project is the one you want seen first. Taking one below the
  // current minimum avoids renumbering every existing row.
  const first = await ctx.payload.find({
    collection: 'projects',
    where: { tenant: { equals: ctx.tenantId } },
    sort: 'sortOrder',
    limit: 1,
    depth: 0,
  })
  const minOrder = (first.docs[0] as { sortOrder?: number } | undefined)?.sortOrder ?? 0
  const created = await ctx.payload.create({
    collection: 'projects',
    data: { ...dataFor('ar'), sortOrder: minOrder - 1 } as never,
    locale: 'ar',
  })
  await writeBothLocales(created.id)
  return { ok: true, id: created.id }
}

export async function deleteProject(id: number) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  await assertOwnsProject(ctx, id)
  await ctx.payload.delete({ collection: 'projects', id })
  return { ok: true }
}

/** Toggle a project between published and draft (hidden from the public site). */
export async function setProjectPublished(id: number, published: boolean) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  await assertOwnsProject(ctx, id)
  await ctx.payload.update({ collection: 'projects', id, data: { published } })
  return { ok: true }
}

export async function reorderProjects(ids: number[]) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  for (let i = 0; i < ids.length; i++) {
    await assertOwnsProject(ctx, ids[i])
    await ctx.payload.update({ collection: 'projects', id: ids[i], data: { sortOrder: i } })
  }
  return { ok: true }
}

/** Save the "items per row" grid config (per-breakpoint columns) for the tenant. */
export async function saveGridCols(cols: {
  imageMobile?: number
  imageTablet?: number
  imageDesktop?: number
  videoMobile?: number
  videoTablet?: number
  videoDesktop?: number
}) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  const settings = await getTenantSettings(ctx)
  const current = (settings.gridCols ?? {}) as Record<string, number>
  await ctx.payload.update({
    collection: 'site-settings',
    id: settings.id,
    data: { gridCols: { ...current, ...cols } } as never,
  })
  return { ok: true }
}

// ─── Behance import (bookmarklet) ──────────────────────────────────────────
const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function parseDataUrl(src: string): { buf: Buffer; mime: string } | null {
  const m = src.match(/^data:([^;]+);base64,(.*)$/s)
  if (!m) return null
  try {
    return { buf: Buffer.from(m[2], 'base64'), mime: m[1] || 'image/jpeg' }
  } catch {
    return null
  }
}

// Behance 403s server-side without a Referer; fall back through resolutions.
async function fetchBehanceImage(url: string): Promise<{ buf: Buffer; mime: string } | null> {
  const tries = [
    url,
    url.replace('/source/', '/max_3840/'),
    url.replace('/source/', '/max_1200/'),
    url.replace('/source/', '/disp/'),
  ]
  for (const u of tries) {
    try {
      const r = await fetch(u, { headers: { Referer: 'https://www.behance.net/' } })
      if (r.ok) {
        const ab = await r.arrayBuffer()
        return { buf: Buffer.from(ab), mime: r.headers.get('content-type') || 'image/jpeg' }
      }
    } catch {
      /* try next */
    }
  }
  return null
}

type Ctx = NonNullable<Awaited<ReturnType<typeof getDashboardContext>>>

async function uploadImageSrc(ctx: Ctx, src: string, i: number): Promise<number | null> {
  const got = src.startsWith('data:') ? parseDataUrl(src) : await fetchBehanceImage(src)
  if (!got || got.buf.length < 200) return null
  const ext = MIME_EXT[got.mime] || 'jpg'
  try {
    const media = await ctx.payload.create({
      collection: 'media',
      data: { tenant: ctx.tenantId, alt: `behance ${i}` },
      file: { data: got.buf, mimetype: got.mime, name: `behance-${Date.now()}-${i}.${ext}`, size: got.buf.length },
    })
    return media.id
  } catch {
    return null
  }
}

/** Turn a staged Behance import (by token) into a new draft project. */
export async function importFromBehance(token: string) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')

  const res = await ctx.payload.find({
    collection: 'imports',
    where: { token: { equals: token } },
    limit: 1,
    overrideAccess: true,
  })
  const row = res.docs[0] as { id: number; data?: unknown; expiresAt?: number } | undefined
  if (!row) return { ok: false, error: 'not-found' as const }
  if (row.expiresAt && row.expiresAt < Date.now()) {
    await ctx.payload.delete({ collection: 'imports', id: row.id, overrideAccess: true }).catch(() => {})
    return { ok: false, error: 'expired' as const }
  }

  const data = (row.data ?? {}) as {
    title?: string
    modules?: { type: string; src?: string; images?: string[]; url?: string; content?: string }[]
  }

  let counter = 0
  const modules: ModuleInput[] = []
  let coverId: number | null = null

  for (const m of data.modules ?? []) {
    if (m.type === 'image' && m.src) {
      const id = await uploadImageSrc(ctx, m.src, counter++)
      if (id) {
        modules.push({ type: 'image', srcId: id })
        coverId ??= id
      }
    } else if (m.type === 'image_row' && Array.isArray(m.images)) {
      const ids: number[] = []
      for (const s of m.images) {
        const id = await uploadImageSrc(ctx, s, counter++)
        if (id) ids.push(id)
      }
      if (ids.length) {
        modules.push({ type: 'grid', itemIds: ids })
        coverId ??= ids[0]
      }
    } else if (m.type === 'embed' && m.url) {
      modules.push({ type: 'video', embedUrl: m.url })
    } else if (m.type === 'text' && m.content) {
      // Behance gives one language; the other side stays blank.
      modules.push({ type: 'text', textType: 'p', value: { ar: m.content, en: m.content } })
    }
    // 'video' (raw file URLs) are skipped — Behance blocks server download.
  }

  if (modules.length === 0) return { ok: false, error: 'no-media' as const }

  const created = await saveProject({
    title: { ar: data.title || 'Behance import', en: data.title || 'Behance import' },
    mediaType: 'image',
    projectType: 'free',
    coverId,
    modules,
    published: false,
  })

  await ctx.payload.delete({ collection: 'imports', id: row.id, overrideAccess: true }).catch(() => {})
  return { ok: true, id: created.id }
}

const APP_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://viralpx.com'

/** Recompute a tenant's storageUsedMb as the exact sum of its media filesizes. */
async function recomputeStorage(ctx: NonNullable<Awaited<ReturnType<typeof getDashboardContext>>>) {
  const all = await ctx.payload.find({
    collection: 'media',
    where: { tenant: { equals: ctx.tenantId } },
    limit: 5000,
    depth: 0,
  })
  const totalMb = all.docs.reduce((n, d) => n + ((d as { filesize?: number }).filesize ?? 0) / 1048576, 0)
  await ctx.payload.update({
    collection: 'tenants',
    id: ctx.tenantId,
    data: { storageUsedMb: Math.round(totalMb * 100) / 100 },
    overrideAccess: true,
  })
}

/** Re-compress this tenant's already-uploaded videos with ffmpeg. */
export async function recompressVideos() {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')

  const res = await ctx.payload.find({
    collection: 'media',
    where: { tenant: { equals: ctx.tenantId } },
    limit: 5000,
    depth: 0,
  })
  const videos = res.docs.filter((m) => ((m as { mimeType?: string }).mimeType || '').startsWith('video/'))

  let processed = 0
  let failed = 0
  let savedBytes = 0
  for (const m of videos as { id: number; url?: string | null; filename?: string | null; filesize?: number; mimeType?: string }[]) {
    if (!m.url) continue
    try {
      const abs = m.url.startsWith('http') ? m.url : `${APP_URL}${m.url}`
      const r = await fetch(abs)
      if (!r.ok) {
        failed++
        continue
      }
      const buf = Buffer.from(await r.arrayBuffer())
      const c = await compressVideo(buf, m.mimeType)
      if (!c.buf || !c.mimetype) continue // ffmpeg missing, error, or not smaller
      const oldSize = m.filesize ?? buf.length
      await ctx.payload.update({
        collection: 'media',
        id: m.id,
        data: {},
        file: {
          data: c.buf as Buffer<ArrayBuffer>,
          mimetype: c.mimetype,
          name: (m.filename || 'video').replace(/\.[^.]+$/, '') + '.mp4',
          size: c.buf.length,
        },
        overrideAccess: true,
      })
      savedBytes += Math.max(0, oldSize - c.buf.length)
      processed++
    } catch {
      failed++
    }
  }

  await recomputeStorage(ctx)
  return { ok: true, total: videos.length, processed, failed, savedMb: Math.round((savedBytes / 1048576) * 10) / 10 }
}
