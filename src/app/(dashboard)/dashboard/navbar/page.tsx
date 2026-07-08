import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import NavbarEditor from '@/components/dashboard/NavbarEditor'

const DEFAULT_LINKS = [
  { linkId: 'about', labelAr: 'عن النفس', labelEn: 'About' },
  { linkId: 'expertise', labelAr: 'الخدمات', labelEn: 'Services' },
  { linkId: 'experience', labelAr: 'الخبرات', labelEn: 'Experience' },
  { linkId: 'projects', labelAr: 'المشاريع', labelEn: 'Projects' },
  { linkId: 'contact', labelAr: 'تواصل', labelEn: 'Contact' },
]

export default async function NavbarPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  await getTenantSettings(ctx) // ensure the doc exists

  // Read both locales so we can edit the AR + EN labels together.
  const res = await ctx.payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: ctx.tenantId } },
    limit: 1,
    depth: 0,
    locale: 'all',
  })
  const raw = (res.docs[0]?.navbarLinks ?? []) as {
    linkId?: string
    visible?: boolean
    label?: { ar?: string; en?: string } | string
  }[]

  const items =
    raw.length > 0
      ? raw.map((l) => ({
          linkId: l.linkId || '',
          labelAr: typeof l.label === 'object' ? l.label?.ar || '' : (l.label as string) || '',
          labelEn: typeof l.label === 'object' ? l.label?.en || '' : '',
          visible: l.visible !== false,
        }))
      : DEFAULT_LINKS.map((l) => ({ ...l, visible: true }))

  return <NavbarEditor initial={items} />
}
