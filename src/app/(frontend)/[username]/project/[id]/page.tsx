import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mediaUrl } from '@/lib/portfolio'
import ProjectView, { type Mod, type SerializedProject } from '@/components/project/ProjectView'
import Navbar from '@/components/portfolio/Navbar'
import PageShell from '@/components/portfolio/PageShell'
import TrackVisit from '@/components/portfolio/TrackVisit'

type Params = {
  params: Promise<{ username: string; id: string }>
  searchParams?: Promise<{ lang?: string }>
}

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
          mobileCols: Math.min(3, Math.max(1, Number(m.mobileCols) || 1)),
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
      case 'carousel': {
        const items = (m.items as { src: unknown }[]) || []
        // The frame's shape comes from the stored dimensions, not from
        // measuring the picture once it arrives in the browser: on a phone
        // the slider was still drawing its 4:3 default around 4:5 artwork.
        const firstSrc = items[0]?.src as { width?: number; height?: number } | undefined
        const w = firstSrc?.width
        const h = firstSrc?.height
        out.push({
          type: 'carousel',
          items: items.map((it) => mediaUrl(it.src as never)).filter((u): u is string => !!u),
          ratio: w && h ? w / h : null,
        })
        break
      }
      case 'video':
        out.push({
          type: 'video',
          embedUrl: String(m.embedUrl ?? ''),
          poster: mediaUrl(m.poster as never, 'card'),
        })
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

/** One address per project, so www and the bare domain don't count as two. */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username, id } = await params
  return { alternates: { canonical: `/${username}/project/${id}` } }
}

export default async function ProjectDetailPage({ params, searchParams }: Params) {
  const { username, id } = await params
  // Same rule as the portfolio page: English unless ?lang=ar. The page used to
  // read Arabic no matter what, so opening a project from an English site
  // switched language underneath the visitor.
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
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
    project = await payload.findByID({
      collection: 'projects',
      id,
      depth: 2,
      locale,
      fallbackLocale: locale === 'ar' ? 'en' : 'ar',
    })
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
    locale,
    fallbackLocale: locale === 'ar' ? 'en' : 'ar',
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

  const settings = settingsRes.docs[0] ?? null

  // The portfolio's own navbar, kept on the project page — leaving the visitor
  // with nothing but a Back button meant no way to reach any other section.
  // The links are anchors on the portfolio page, so they need its path here.
  const qs = `?lang=${locale}`
  const navLinks = [
    ...((settings as { navbarLinks?: { linkId?: string; label?: string; visible?: boolean }[] } | null)
      ?.navbarLinks ?? [])
      .filter((l) => l.visible !== false)
      .map((l) => ({
        label: l.label || l.linkId || '',
        href: `/${tenant.slug}${qs}#${l.linkId ?? ''}`,
      })),
    {
      label: locale === 'en' ? 'Articles' : 'المقالات',
      href: `/${tenant.slug}/articles${qs}`,
    },
  ]


  return (
    <PageShell settings={settings} locale={locale}>
      {/* Opening a project was never recorded, so "most viewed projects" had
          nothing to count and sat empty however much traffic came through. */}
      <TrackVisit tenant={tenant.id} page="project" project={project.id} />
      <Navbar
        logo={tenant.name?.[0]?.toUpperCase() || 'V'}
        logoUrl={mediaUrl((settings as { brand?: { brandLogo?: unknown } } | null)?.brand?.brandLogo as never, 'thumb')}
        homeHref={`/${tenant.slug}${qs}`}
        links={navLinks}
        // The toggle stays on this project instead of being a dead control.
        langHref={`?lang=${locale === 'en' ? 'ar' : 'en'}`}
        langLabel={locale === 'en' ? 'ع' : 'EN'}
      />
      <ProjectView project={serialized} />
    </PageShell>
  )
}
