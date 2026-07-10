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
