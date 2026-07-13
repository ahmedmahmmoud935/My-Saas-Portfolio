import React from 'react'
import { redirect, notFound } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import ProjectPageBuilder, { type BuilderProject } from '@/components/dashboard/ProjectPageBuilder'
import type { EditModule } from '@/lib/project-types'

const mid = (x: unknown): number | null =>
  x && typeof x === 'object' ? ((x as { id: number }).id ?? null) : ((x as number) ?? null)

function serializeEditModules(modules: unknown): EditModule[] {
  if (!Array.isArray(modules)) return []
  const out: EditModule[] = []
  for (const m of modules as Record<string, unknown>[]) {
    switch (m.blockType) {
      case 'text':
        out.push({ type: 'text', textType: (m.textType as 'h1' | 'h2' | 'p') || 'p', value: String(m.value ?? '') })
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
      case 'carousel':
        out.push({
          type: 'carousel',
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
  const categories = Array.from(
    new Set([
      ...(settings.categories?.image ?? []).map((c) => c.name || ''),
      ...(settings.categories?.video ?? []).map((c) => c.name || ''),
    ]),
  ).filter(Boolean)

  const initial: BuilderProject = {
    id: project.id,
    title: project.title,
    category: project.category ?? undefined,
    description: project.description ?? undefined,
    coverId: mid(project.cover),
    coverUrl: mediaUrl(project.cover, 'thumb'),
    modules: serializeEditModules(project.modules),
  }

  return <ProjectPageBuilder initial={initial} categories={categories} />
}
