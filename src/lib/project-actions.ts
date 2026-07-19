'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'
import type { ProjectInput, ModuleInput } from './project-types'
import type { Project } from '../payload-types'

type Blocks = NonNullable<Project['modules']>

/** Map editor modules → Payload blocks. */
function toBlocks(modules: ModuleInput[] | undefined): Blocks {
  return (modules ?? []).map((m) => {
    switch (m.type) {
      case 'text':
        return { blockType: 'text', textType: m.textType, value: m.value }
      case 'image':
        return { blockType: 'image', src: m.srcId }
      case 'grid':
        return { blockType: 'grid', items: m.itemIds.map((src) => ({ src })) }
      case 'carousel':
        return { blockType: 'carousel', items: m.itemIds.map((src) => ({ src })) }
      case 'video':
        return { blockType: 'video', embedUrl: m.embedUrl }
      case 'beforeafter':
        return {
          blockType: 'beforeafter',
          before: m.beforeId,
          after: m.afterId,
          labelBefore: m.labelBefore,
          labelAfter: m.labelAfter,
        }
      case 'separator':
        return { blockType: 'separator', spacing: m.spacing }
    }
  }) as unknown as Blocks
}

/** Upload a file → Media (Payload does WebP + thumb/card; R2 or local). */
export async function uploadProjectMedia(formData: FormData) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  const file = formData.get('file') as File | null
  if (!file) throw new Error('no file')

  const buf = Buffer.from(await file.arrayBuffer())
  const media = await ctx.payload.create({
    collection: 'media',
    data: { tenant: ctx.tenantId, alt: file.name },
    file: { data: buf, mimetype: file.type, name: file.name, size: buf.length },
  })
  const sizes = (media as { sizes?: { thumb?: { url?: string }; card?: { url?: string } } }).sizes
  return {
    id: media.id,
    url: media.url ?? null,
    thumbUrl: sizes?.thumb?.url ?? media.url ?? null,
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

  const data = {
    tenant: ctx.tenantId,
    title: input.title,
    category: input.category ?? null,
    description: input.description ?? null,
    mediaType: input.mediaType,
    projectType: input.projectType,
    cover: input.coverId ?? null,
    videoUrl: input.videoUrl ?? null,
    videoKind: input.videoKind ?? 'reel',
    aspectRatio: input.aspectRatio ?? '9:16',
    images: (input.imageIds ?? []).map((image) => ({ image })),
    modules: toBlocks(input.modules),
    // Only touch `published` when explicitly provided (the toggle is a separate
    // action) — new projects fall back to the collection default (true).
    ...(input.published !== undefined ? { published: input.published } : {}),
  }

  if (input.id) {
    await assertOwnsProject(ctx, input.id)
    await ctx.payload.update({ collection: 'projects', id: input.id, data })
    return { ok: true, id: input.id }
  }

  const count = await ctx.payload.count({
    collection: 'projects',
    where: { tenant: { equals: ctx.tenantId } },
  })
  const created = await ctx.payload.create({
    collection: 'projects',
    data: { ...data, sortOrder: count.totalDocs },
  })
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
      modules.push({ type: 'text', textType: 'p', value: m.content })
    }
    // 'video' (raw file URLs) are skipped — Behance blocks server download.
  }

  if (modules.length === 0) return { ok: false, error: 'no-media' as const }

  const created = await saveProject({
    title: data.title || 'Behance import',
    mediaType: 'image',
    projectType: 'free',
    coverId,
    modules,
    published: false,
  })

  await ctx.payload.delete({ collection: 'imports', id: row.id, overrideAccess: true }).catch(() => {})
  return { ok: true, id: created.id }
}
