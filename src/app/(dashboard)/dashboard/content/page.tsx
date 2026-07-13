import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import ContentHub from '@/components/dashboard/ContentHub'
import type { ContentForm, Loc } from '@/lib/content-types'

const L = (x: unknown): Loc => {
  if (x && typeof x === 'object' && ('ar' in x || 'en' in x)) {
    const o = x as { ar?: string; en?: string }
    return { ar: o.ar ?? '', en: o.en ?? '' }
  }
  if (typeof x === 'string') return { ar: x, en: '' }
  return { ar: '', en: '' }
}
const S = (x: unknown): string => (typeof x === 'string' ? x : '')
const iconOf = (x: unknown) => ({
  iconId: x && typeof x === 'object' ? ((x as { id?: number }).id ?? null) : ((x as number) ?? null),
  iconUrl: mediaUrl(x as never, 'thumb'),
})

export default async function ContentPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  await getTenantSettings(ctx)

  const res = await ctx.payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: ctx.tenantId } },
    limit: 1,
    depth: 1,
    locale: 'all',
  })
  const c = (res.docs[0]?.content ?? {}) as Record<string, Record<string, unknown>>

  const form: ContentForm = {
    hero: {
      name: L(c.hero?.name),
      title: L(c.hero?.title),
      btn1: L(c.hero?.btn1),
      btn2: L(c.hero?.btn2),
    },
    about: { text: L(c.about?.text), tags: L(c.about?.tags) },
    expertise: {
      title: L(c.expertise?.title),
      items: ((c.expertise?.items as Record<string, unknown>[]) ?? []).map((it) => ({
        title: L(it.title),
        description: L(it.description),
        ...iconOf(it.icon),
        imageId:
          it.image && typeof it.image === 'object'
            ? ((it.image as { id?: number }).id ?? null)
            : ((it.image as number) ?? null),
        imageUrl: mediaUrl(it.image as never, 'card'),
        bgZoom: (it.bgZoom as number) ?? 100,
        bgOverlay: (it.bgOverlay as number) ?? 45,
        bgPosX: (it.bgPosX as number) ?? 50,
        bgPosY: (it.bgPosY as number) ?? 50,
      })),
    },
    experience: {
      items: ((c.experience?.items as Record<string, unknown>[]) ?? []).map((it) => ({
        company: S(it.company),
        role: L(it.role),
        period: S(it.period),
        description: L(it.description),
      })),
    },
    education: {
      items: ((c.education?.items as Record<string, unknown>[]) ?? []).map((it) => ({
        title: L(it.title),
        org: L(it.org),
        period: S(it.period),
        description: L(it.description),
      })),
    },
    skills: { items: L(c.skills?.items) },
    tools: {
      items: ((c.tools?.items as Record<string, unknown>[]) ?? []).map((it) => ({
        name: S(it.name),
        ...iconOf(it.icon),
      })),
    },
    projects: { title: L(c.projects?.title), subtitle: L(c.projects?.subtitle) },
    contact: {
      title: L(c.contact?.title),
      subtitle: L(c.contact?.subtitle),
      email: S(c.contact?.email),
      phone: S(c.contact?.phone),
    },
  }

  // Collections that also fill portfolio sections — managed here too.
  const [logosRes, achRes, testRes] = await Promise.all([
    ctx.payload.find({
      collection: 'logos',
      where: { tenant: { equals: ctx.tenantId } },
      sort: 'sortOrder',
      limit: 200,
      depth: 1,
    }),
    ctx.payload.find({
      collection: 'achievements',
      where: { tenant: { equals: ctx.tenantId } },
      sort: 'sortOrder',
      limit: 200,
      depth: 1,
      locale: 'ar',
    }),
    ctx.payload.find({
      collection: 'testimonials',
      where: { tenant: { equals: ctx.tenantId } },
      sort: 'sortOrder',
      limit: 200,
      depth: 1,
      locale: 'ar',
    }),
  ])

  const logos = logosRes.docs.map((l) => ({
    id: l.id,
    name: l.name,
    websiteUrl: l.websiteUrl ?? '',
    logoId: (l.logo && typeof l.logo === 'object' ? l.logo.id : (l.logo as number)) ?? null,
    logoUrl: mediaUrl(l.logo, 'thumb'),
  }))

  const achievements = achRes.docs.map((a) => ({
    id: a.id,
    title: a.title,
    value: a.value,
    iconId: (a.icon && typeof a.icon === 'object' ? a.icon.id : (a.icon as number)) ?? null,
    iconUrl: mediaUrl(a.icon, 'thumb'),
  }))

  const testimonials = testRes.docs.map((tt) => ({
    id: tt.id,
    name: tt.name,
    role: tt.role ?? '',
    company: tt.company ?? '',
    content: tt.content,
    rating: tt.rating ?? 5,
    approved: tt.approved !== false,
    avatarId: (tt.avatar && typeof tt.avatar === 'object' ? tt.avatar.id : (tt.avatar as number)) ?? null,
    avatarUrl: mediaUrl(tt.avatar, 'thumb'),
  }))

  return (
    <ContentHub
      content={form}
      logos={logos}
      achievements={achievements}
      testimonials={testimonials}
    />
  )
}
