import React from 'react'
import { notFound, redirect } from 'next/navigation'
import DashNotice from '@/components/dashboard/DashNotice'
import { DASHBOARD_NAV } from '@/lib/dashboard-nav'

// Fallback for tabs that exist in the sidebar but aren't built yet.
// Explicit routes (categories, sections, navbar, …) take precedence over this.
export default async function ComingSoonTab({
  params,
}: {
  params: Promise<{ tab: string }>
}) {
  const { tab } = await params
  // The admin pages moved to their own area; keep old links working.
  if (tab === 'landing' || tab === 'users') redirect(`/owner/${tab}`)
  const nav = DASHBOARD_NAV.find((n) => n.id === tab)
  if (!nav) notFound()

  return (
    <DashNotice
      icon={nav.icon}
      titleAr={nav.labelAr}
      titleEn={nav.labelEn}
      subAr="قيد الإنشاء — قريبًا"
      subEn="Under construction — coming soon"
      bodyAr="هذا التبويب لسه تحت التنفيذ."
      bodyEn="This tab is still under construction."
      bigIcon
    />
  )
}
