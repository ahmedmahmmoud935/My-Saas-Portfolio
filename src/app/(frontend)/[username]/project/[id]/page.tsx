import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mediaUrl, tenantCssVars } from '@/lib/portfolio'
import ProjectView, { type Mod, type SerializedProject } from '@/components/project/ProjectView'

type Params = { params: Promise<{ username: string; id: string }> }

function serializeModules(modules: unknown[]): Mod[] {
  if (!Array.isArray(modules)) return []
  const out: Mod[] = []
  for (const m of modules as Record<string, unknown>[]) {
    switch (m.blockType) {
      case 'text':
        out.push({
          type: 'text',
          textType: ((m.textType as string) === 'h1' || (m.textType as string) === 'h2'
            ? (m.textType as 'h1' | 'h2')
            : 'p'),
          value: String(m.value ?? ''),
        })
        break
      case 'image':
        out.push({ type: 'image', src: mediaUrl(m.src as never) })
        break
      case 'grid':
        out.push({
          type: 'grid',
          items: ((m.items as { src: unknown }[]) || [])
            .map((it) => {
              const src = mediaUrl(it.src as never)
              const s = it.src as { width?: number | null; height?: number | null } | null
              const ar = s && s.width && s.height ? s.width / s.height : 1
              return src ? { src, ar } : null
            })
            .filter((x): x is { src: string; ar: number } => !!x),
        })
        break
      case 'carousel':
        out.push({
          type: 'carousel',
          items: ((m.items as { src: unknown }[]) || [])
            .map((it) => mediaUrl(it.src as never))
            .filter((u): u is string => !!u),
        })
        break
      case 'video':
        out.push({ type: 'video', embedUrl: String(m.embedUrl ?? '') })
        break
      case 'beforeafter':
        out.push({
          type: 'beforeafter',
          before: mediaUrl(m.before as never),
          after: mediaUrl(m.after as never),
          labelBefore: (m.labelBefore as string) ?? null,
          labelAfter: (m.labelAfter as string) ?? null,
        })
        break
      case 'separator':
        out.push({ type: 'separator', spacing: (m.spacing as 'compact' | 'normal' | 'large') || 'normal' })
        break
    }
  }
  return out
}

export default async function ProjectDetailPage({ params }: Params) {
  const { username, id } = await params
  const payload = await getPayload({ config })

  const tenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: username } },
    limit: 1,
    depth: 0,
  })
  const tenant = tenants.docs[0]
  if (!tenant) notFound()

  let project
  try {
    project = await payload.findByID({ collection: 'projects', id, depth: 2, locale: 'ar' })
  } catch {
    notFound()
  }
  // Ensure the project belongs to this tenant and isn't a hidden draft.
  const projTenant = typeof project.tenant === 'object' ? project.tenant?.id : project.tenant
  if (!project || projTenant !== tenant.id) notFound()
  if (project.published === false) notFound()

  const settingsRes = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenant.id } },
    limit: 1,
    depth: 0,
  })

  const serialized: SerializedProject = {
    title: project.title,
    category: project.category,
    description: project.description,
    projectType: (project.projectType as SerializedProject['projectType']) || 'grid',
    cover: mediaUrl(project.cover),
    images: (project.images || [])
      .map((im) => mediaUrl(im.image))
      .filter((u): u is string => !!u),
    modules: serializeModules(project.modules as unknown[]),
  }

  const cssVars = tenantCssVars(settingsRes.docs[0] ?? null) as React.CSSProperties

  return (
    <div style={cssVars}>
      <ProjectView project={serialized} />
    </div>
  )
}
