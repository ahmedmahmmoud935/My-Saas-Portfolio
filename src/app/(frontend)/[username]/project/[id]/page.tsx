import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mediaUrl, tenantCssVars } from '@/lib/portfolio'
import ProjectView, { type Mod, type SerializedProject } from '@/components/project/ProjectView'
import Navbar from '@/components/portfolio/Navbar'

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
  const cssVars = tenantCssVars(settings) as React.CSSProperties

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

  // The tenant can pin a direction in the Design tab; otherwise it follows the
  // language, exactly as the portfolio page does.
  const st = ((settings as { style?: Record<string, string | undefined> } | null)?.style ?? {}) as Record<
    string,
    string | undefined
  >
  const dir: 'ltr' | 'rtl' =
    st.direction === 'ltr' ? 'ltr' : st.direction === 'rtl' ? 'rtl' : locale === 'en' ? 'ltr' : 'rtl'

  return (
    // `pf-root` is what carries the light palette: the tenant's colours are
    // set inline here, and the light-mode rules override them through that
    // class. Without it a project page stayed on the dark tokens — white
    // heading on a white page.
    <div className="pf-root" style={cssVars} dir={dir} lang={locale}>
      <Navbar
        logo={tenant.name?.[0]?.toUpperCase() || 'V'}
        links={navLinks}
        // The toggle stays on this project instead of being a dead control.
        langHref={`?lang=${locale === 'en' ? 'ar' : 'en'}`}
        langLabel={locale === 'en' ? 'ع' : 'EN'}
      />
      <ProjectView project={serialized} />
    </div>
  )
}
