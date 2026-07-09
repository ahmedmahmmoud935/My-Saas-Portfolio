import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import TestimonialsManager from '@/components/dashboard/TestimonialsManager'

export default async function TestimonialsPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const res = await ctx.payload.find({
    collection: 'testimonials',
    where: { tenant: { equals: ctx.tenantId } },
    sort: 'sortOrder',
    limit: 200,
    depth: 1,
    locale: 'ar',
  })
  const items = res.docs.map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role ?? '',
    company: t.company ?? '',
    content: t.content,
    rating: t.rating ?? 5,
    approved: t.approved !== false,
    avatarId: (t.avatar && typeof t.avatar === 'object' ? t.avatar.id : (t.avatar as number)) ?? null,
    avatarUrl: mediaUrl(t.avatar, 'thumb'),
  }))
  return <TestimonialsManager items={items} />
}
