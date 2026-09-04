import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import { auditSite, type PageInput } from '@/lib/seo-audit'
import SeoAudit from '@/components/dashboard/SeoAudit'

export const dynamic = 'force-dynamic'

/**
 * Every public page this tenant has, in the shape the audit reads.
 *
 * Loaded here rather than in the audit so that stays a pure function over
 * content and can be tested without a database.
 */
export default async function SeoPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')

  const [tenant, settingsRes, articlesRes, projectsRes] = await Promise.all([
    ctx.payload.findByID({ collection: 'tenants', id: ctx.tenantId, depth: 0 }),
    ctx.payload.find({ collection: 'site-settings', where: { tenant: { equals: ctx.tenantId } }, limit: 1, depth: 1, locale: 'ar' }),
    ctx.payload.find({ collection: 'articles', where: { tenant: { equals: ctx.tenantId } }, limit: 300, depth: 1, locale: 'ar' }),
    ctx.payload.find({ collection: 'projects', where: { tenant: { equals: ctx.tenantId } }, limit: 300, depth: 1, locale: 'ar' }),
  ])

  const slug = tenant?.slug ?? ''
  const settings = settingsRes.docs[0]
  const content = (settings?.content ?? {}) as Record<string, { text?: string; name?: string; title?: string }>
  const brand = (settings?.brand ?? {}) as Record<string, unknown>

  const pages: PageInput[] = [
    {
      kind: 'portfolio',
      title: content.hero?.name || tenant?.name || slug,
      path: `/${slug}`,
      editHref: '/dashboard/content',
      description: content.about?.text ?? null,
      cover: mediaUrl(brand.heroCover as never, 'card'),
      published: true,
    },
    ...articlesRes.docs.map((a) => ({
      kind: 'article' as const,
      id: a.id,
      title: a.title,
      path: `/${slug}/articles/${a.slug}`,
      editHref: '/dashboard/articles',
      description: a.seo?.description || a.excerpt || null,
      metaTitle: a.seo?.title || null,
      html: a.contentHtml ?? null,
      cover: mediaUrl(a.cover, 'card'),
      published: a.published === true,
      noindex: a.seo?.noindex === true,
    })),
    ...projectsRes.docs.map((p) => ({
      kind: 'project' as const,
      id: p.id,
      title: p.title,
      path: `/${slug}/project/${p.id}`,
      editHref: `/dashboard/projects/${p.id}`,
      description: p.seo?.description || p.description || null,
      metaTitle: p.seo?.title || null,
      cover: mediaUrl(p.cover, 'card'),
      published: true,
      noindex: p.seo?.noindex === true,
    })),
  ]

  return <SeoAudit result={auditSite(pages)} siteHref={`/${slug}`} />
}
