import React from 'react'
import { redirect, notFound } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import { toCategoryRows } from '@/lib/category-types'
import { mediaUrl } from '@/lib/portfolio'
import ProjectPageBuilder, { type BuilderProject } from '@/components/dashboard/ProjectPageBuilder'
import type { Bi, EditModule } from '@/lib/project-types'

const mid = (x: unknown): number | null =>
  x && typeof x === 'object' ? ((x as { id: number }).id ?? null) : ((x as number) ?? null)

/** `locale: 'all'` gives {ar, en}; older rows may still hold a bare string. */
function bi(v: unknown): Bi {
  if (v && typeof v === 'object') {
    const o = v as { ar?: string; en?: string }
    return { ar: o.ar ?? '', en: o.en ?? '' }
  }
  return { ar: typeof v === 'string' ? v : '', en: '' }
}

function serializeEditModules(modules: unknown): EditModule[] {
  if (!Array.isArray(modules)) return []
  const out: EditModule[] = []
  for (const m of modules as Record<string, unknown>[]) {
    switch (m.blockType) {
      case 'text':
        out.push({ type: 'text', textType: (m.textType as 'h1' | 'h2' | 'p') || 'p', value: bi(m.value) })
        break
      case 'image':
        out.push({ type: 'image', srcId: mid(m.src), srcUrl: mediaUrl(m.src as never, 'thumb') })
        break
      case 'grid':
        out.push({
          type: 'grid',
          mobileCols: Number(m.mobileCols) || 1,
          items: ((m.items as { src: unknown }[]) || [])
            .map((it) => ({ id: mid(it.src), url: mediaUrl(it.src as never, 'thumb') }))
            .filter((x): x is { id: number; url: string | null } => x.id != null),
        })
        break
      case 'carousel':
        out.push({
          type: 'carousel',
          items: ((m.items as { src: unknown }[]) || [])
            .map((it) => ({ id: mid(it.src), url: mediaUrl(it.src as never, 'thumb') }))
            .filter((x): x is { id: number; url: string | null } => x.id != null),
        })
        break
      case 'video':
        out.push({
          type: 'video',
          embedUrl: String(m.embedUrl ?? ''),
          posterId: mid(m.poster),
          posterUrl: mediaUrl(m.poster as never, 'card'),
        })
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
        out.push({ type: 'separator', spacing: (m.spacing as 'compact' | 'normal' | 'large') || 'normal' })
        break
    }
  }
  return out
}

export default async function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const { id } = await params

  let project
  try {
    project = await ctx.payload.findByID({ collection: 'projects', id, depth: 1, locale: 'ar' })
  } catch {
    notFound()
  }
  const pt = typeof project.tenant === 'object' ? project.tenant?.id : project.tenant
  if (!project || pt !== ctx.tenantId) notFound()

  const settings = await getTenantSettings(ctx)
  const categories = toCategoryRows([
    ...(settings.categories?.image ?? []),
    ...(settings.categories?.video ?? []),
  ])

  const initial: BuilderProject = {
    id: project.id,
    title: bi(project.title),
    category: project.category ?? undefined,
    description: bi(project.description),
    coverId: mid(project.cover),
    coverUrl: mediaUrl(project.cover, 'thumb'),
    modules: serializeEditModules(project.modules),
  }

  return <ProjectPageBuilder initial={initial} categories={categories} />
}
