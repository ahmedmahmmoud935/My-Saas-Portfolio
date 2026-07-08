import React from 'react'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/dashboard/PageHeader'
import { DASHBOARD_NAV } from '@/lib/dashboard-nav'

// Fallback for tabs that exist in the sidebar but aren't built yet.
// Explicit routes (categories, sections, navbar, …) take precedence over this.
export default async function ComingSoonTab({
  params,
}: {
  params: Promise<{ tab: string }>
}) {
  const { tab } = await params
  const nav = DASHBOARD_NAV.find((n) => n.id === tab)
  if (!nav) notFound()

  return (
    <div>
      <PageHeader icon={nav.icon} title={nav.labelAr} subtitle="قيد الإنشاء — قريبًا" />
      <div className="panel" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{nav.icon}</div>
        <div style={{ color: 'var(--sub)' }}>
          تبويب <b style={{ color: 'var(--text)' }}>{nav.labelAr}</b> لسه تحت التنفيذ.
        </div>
      </div>
    </div>
  )
}
