import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import { SECTION_ORDER, withMissingSections } from '@/lib/dashboard-nav'
import SectionsEditor from '@/components/dashboard/SectionsEditor'

export default async function SectionsPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const settings = await getTenantSettings(ctx)

  const saved = (settings.sections ?? [])
    .filter((s) => !!s.sectionId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  /* A saved list only knows the sections that existed when it was saved, so a
     section added since — the team — would be missing from this page for every
     portfolio saved before today, and could be neither ordered nor hidden.
     Anything the site has and the list does not is appended. */
  const items =
    saved.length > 0
      ? withMissingSections(
          saved.map((s) => ({ id: s.sectionId as string, visible: s.visible !== false })),
          SECTION_ORDER,
          (id) => ({ id, visible: true }),
        ).map((r) => ({ sectionId: r.id, visible: r.visible }))
      : SECTION_ORDER.map((id) => ({ sectionId: id, visible: true }))

  return <SectionsEditor initial={items} />
}
