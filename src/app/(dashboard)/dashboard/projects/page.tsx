import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import ProjectsManager, { type ProjectRow } from '@/components/dashboard/ProjectsManager'
import type { EditModule } from '@/lib/project-types'

const mid = (x: unknown): number | null =>
  x && typeof x === 'object' ? ((x as { id: number }).id ?? null) : ((x as number) ?? null)

function serializeEditModules(modules: unknown): EditModule[] {
  if (!Array.isArray(modules)) return []
  const out: EditModule[] = []
  for (const m of modules as Record<string, unknown>[]) {
    switch (m.blockType) {
      case 'text':
        out.push({
          type: 'text',
          textType: (m.textType as 'h1' | 'h2' | 'p') || 'p',
          value: String(m.value ?? ''),
        })
        break
      case 'image':
        out.push({ type: 'image', srcId: mid(m.src), srcUrl: mediaUrl(m.src as never, 'thumb') })
        break
      case 'grid':
        out.push({
          type: 'grid',
          items: ((m.items as { src: unknown }[]) || [])
            .map((it) => ({ id: mid(it.src), url: mediaUrl(it.src as never, 'thumb') }))
            .filter((x): x is { id: number; url: string | null } => x.id != null),
        })
        break
      case 'video':
        out.push({ type: 'video', embedUrl: String(m.embedUrl ?? '') })
        break
      case 'beforeafter':
        out.push({
          type: 'beforeafter',
          beforeId: mid(m.before),
          beforeUrl: mediaUrl(m.before as never, 'thumb'),
          afterId: mid(m.after),
          afterUrl: mediaUrl(m.after as never, 'thumb'),
          labelBefore: String(m.labelBefore ?? ''),
          labelAfter: String(m.labelAfter ?? ''),
        })
        break
      case 'separator':
        out.push({
          type: 'separator',
          spacing: (m.spacing as 'compact' | 'normal' | 'large') || 'normal',
        })
        break
    }
  }
  return out
}

export default async function ProjectsPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const settings = await getTenantSettings(ctx)

  const res = await ctx.payload.find({
    collection: 'projects',
    where: { tenant: { equals: ctx.tenantId } },
    sort: 'sortOrder',
    limit: 300,
    depth: 1,
    locale: 'ar',
  })

  const projects: ProjectRow[] = res.docs.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category ?? undefined,
    description: p.description ?? undefined,
    mediaType: p.mediaType,
    projectType: p.projectType,
    coverId: typeof p.cover === 'object' ? p.cover?.id : (p.cover ?? null),
    coverUrl: mediaUrl(p.cover, 'thumb'),
    videoUrl: p.videoUrl ?? undefined,
    videoKind: p.videoKind ?? undefined,
    aspectRatio: p.aspectRatio ?? undefined,
    images: (p.images ?? [])
      .map((im) => {
        const id = typeof im.image === 'object' ? im.image?.id : im.image
        return id ? { id, url: mediaUrl(im.image, 'thumb') } : null
      })
      .filter((x): x is { id: number; url: string | null } => !!x),
    modules: serializeEditModules(p.modules),
    published: p.published !== false,
  }))

  const categoriesImage = (settings.categories?.image ?? []).map((c) => c.name || '').filter(Boolean)
  const categoriesVideo = (settings.categories?.video ?? []).map((c) => c.name || '').filter(Boolean)
  const categories = Array.from(new Set([...categoriesImage, ...categoriesVideo]))

  const gc = settings.gridCols ?? {}
  const gridCols = {
    imageMobile: gc.imageMobile ?? 2,
    imageTablet: gc.imageTablet ?? 3,
    imageDesktop: gc.imageDesktop ?? 3,
    videoMobile: gc.videoMobile ?? 2,
    videoTablet: gc.videoTablet ?? 3,
    videoDesktop: gc.videoDesktop ?? 4,
  }

  return <ProjectsManager projects={projects} categories={categories} gridCols={gridCols} />
}
