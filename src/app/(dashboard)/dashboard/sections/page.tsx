import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import { SECTION_ORDER } from '@/lib/dashboard-nav'
import SectionsEditor from '@/components/dashboard/SectionsEditor'

export default async function SectionsPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const settings = await getTenantSettings(ctx)

  const saved = (settings.sections ?? [])
    .filter((s) => !!s.sectionId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const items =
    saved.length > 0
      ? saved.map((s) => ({ sectionId: s.sectionId as string, visible: s.visible !== false }))
      : SECTION_ORDER.map((id) => ({ sectionId: id, visible: true }))

  return <SectionsEditor initial={items} />
}
