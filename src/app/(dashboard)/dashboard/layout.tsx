import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')

  const tenant = await ctx.payload.findByID({
    collection: 'tenants',
    id: ctx.tenantId,
    depth: 0,
  })

  return (
    <div className="dash">
      <main className="dash-main">{children}</main>
      <Sidebar
        userName={ctx.user.name || ctx.user.email}
        tenantSlug={tenant.slug}
        storageUsed={tenant.storageUsedMb ?? 0}
        storageLimit={tenant.storageLimitMb ?? 1024}
      />
    </div>
  )
}
