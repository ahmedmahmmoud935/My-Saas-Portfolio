import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import ArticlesManager from '@/components/dashboard/ArticlesManager'

export const dynamic = 'force-dynamic'

/**
 * The platform's own blog. Same editor as a client's articles — every field is
 * the same, and a second copy of it would need every fix applied twice.
 */
export default async function OwnerBlogPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  if (!ctx.user.isOwner) redirect('/dashboard')

  const res = await ctx.payload.find({
    collection: 'posts',
    sort: '-createdAt',
    limit: 200,
    depth: 1,
    locale: 'ar',
  })

  const items = res.docs.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? '',
    contentHtml: p.contentHtml ?? '',
    tags: '',
    published: p.published === true,
    readMin: p.readMin ?? 0,
    coverId: (p.cover && typeof p.cover === 'object' ? p.cover.id : (p.cover as number)) ?? null,
    coverUrl: mediaUrl(p.cover, 'thumb'),
    keyphrase: p.seo?.keyphrase ?? '',
    seoTitle: p.seo?.title ?? '',
    seoDescription: p.seo?.description ?? '',
    noindex: p.seo?.noindex === true,
    nofollow: p.seo?.nofollow === true,
  }))

  return (
    <ArticlesManager
      items={items}
      collection="posts"
      title="مدوّنة ViralPX"
      subtitle="محتوى الموقع الأساسي — ده اللي بيخلّي الموقع يترتّب على كلام غير اسمه"
    />
  )
}
