import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import Sidebar from '@/components/dashboard/Sidebar'
import { DashLangProvider } from '@/components/dashboard/DashLang'
import InstallApp from '@/components/portfolio/InstallApp'
import StorageNotice from '@/components/dashboard/StorageNotice'
import { DEFAULT_STORAGE_MB } from '@/lib/quota'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')

  const tenant = await ctx.payload.findByID({
    collection: 'tenants',
    id: ctx.tenantId,
    depth: 0,
  })

  return (
    <DashLangProvider>
      <InstallApp label="ثبّت لوحة التحكم على شاشتك" />
      <div className="dash">
        <main className="dash-main">
          <StorageNotice
            usedMb={tenant.storageUsedMb ?? 0}
            limitMb={tenant.storageLimitMb ?? DEFAULT_STORAGE_MB}
            isOwner={Boolean(ctx.user.isOwner)}
          />
          {children}
        </main>
        <Sidebar
          userName={ctx.user.name || ctx.user.email}
          tenantSlug={tenant.slug}
          storageUsed={tenant.storageUsedMb ?? 0}
          storageLimit={tenant.storageLimitMb ?? DEFAULT_STORAGE_MB}
          isOwner={Boolean(ctx.user.isOwner)}
        />
      </div>
    </DashLangProvider>
  )
}
