import React from 'react'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getPortfolio, mediaUrl } from '@/lib/portfolio'
import { alternatesFor, langQuery, pageLocale } from '@/lib/seo'
import { buildStudioData } from '@/lib/studio-data'
import StudioPortfolio from '@/components/studio/StudioPortfolio'
import Analytics from '@/components/portfolio/Analytics'
import TrackVisit from '@/components/portfolio/TrackVisit'
import ScrollMemory from '@/components/portfolio/ScrollMemory'

/**
 * Every project, on a page of its own.
 *
 * The home page shows two rows of work and a button here; this is the whole
 * section — the type tabs, the categories, the grid and the project window —
 * inside the same bar and footer.
 */

type Params = { params: Promise<{ username: string }>; searchParams?: Promise<{ lang?: string }> }

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const { username } = await params
  const { lang } = (await searchParams) ?? {}
  const locale = await pageLocale(lang)
  const data = await getPortfolio(username, locale)
  if (!data) return {}
  const content = (data.settings?.content ?? {}) as { projects?: { title?: string; subtitle?: string } }
  const name = data.tenant.name
  const heading = (content.projects?.title || (locale === 'en' ? 'Work' : 'الأعمال')).replace(/[.。]\s*$/, '')
  const title = `${heading} — ${name}`
  const description = content.projects?.subtitle || (locale === 'en' ? `Projects by ${name}.` : `مشاريع ${name}.`)
  const cover = data.projects.map((p) => mediaUrl(p.cover, 'card')).find(Boolean) ?? null
  return {
    title,
    description,
    alternates: await alternatesFor(`/${username}/projects`, { tenantSlug: username, locale }),
    openGraph: { title, description, images: cover ? [cover] : undefined, type: 'website' },
  }
}

export default async function ProjectsPage({ params, searchParams }: Params) {
  const { username } = await params
  const { lang } = (await searchParams) ?? {}
  const locale = await pageLocale(lang)
  const data = await getPortfolio(username, locale)
  // A suspended client's whole site is off, not just its home page.
  if (!data || (data.tenant as { suspended?: boolean }).suspended) notFound()
  const q = await langQuery(locale)

  const d = buildStudioData(data, locale, q)
  if (!d.work) redirect(`/${username}${q}`)
  return (
    <>
      <Analytics id={data.settings?.seoTools?.analyticsId} />
      <TrackVisit tenant={data.tenant.id} page="projects" />
      <ScrollMemory />
      <StudioPortfolio d={d} page="work" />
    </>
  )
}
