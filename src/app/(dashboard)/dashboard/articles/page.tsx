import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import ArticlesManager from '@/components/dashboard/ArticlesManager'

export default async function ArticlesPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const res = await ctx.payload.find({
    collection: 'articles',
    where: { tenant: { equals: ctx.tenantId } },
    sort: '-createdAt',
    limit: 200,
    depth: 1,
    locale: 'ar',
  })
  const items = res.docs.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt ?? '',
    contentHtml: a.contentHtml ?? '',
    tags: (a.tags ?? []).map((t) => t.tag || '').filter(Boolean).join(', '),
    published: a.published === true,
    readMin: a.readMin ?? 0,
    coverId: (a.cover && typeof a.cover === 'object' ? a.cover.id : (a.cover as number)) ?? null,
    coverUrl: mediaUrl(a.cover, 'thumb'),
  }))
  return <ArticlesManager items={items} />
}
