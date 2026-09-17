import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import Sidebar from '@/components/dashboard/Sidebar'
import { DashLangProvider } from '@/components/dashboard/DashLang'
import InstallApp from '@/components/portfolio/InstallApp'
import StorageNotice from '@/components/dashboard/StorageNotice'
import MessageNotice from '@/components/dashboard/MessageNotice'
import { noticesFor } from '@/lib/inbox'
import { DEFAULT_STORAGE_MB } from '@/lib/quota'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')

  const tenant = await ctx.payload.findByID({
    collection: 'tenants',
    id: ctx.tenantId,
    depth: 0,
  })

  // Messages from the platform, for the count in the menu and the line on top.
  // A failure here must never take the dashboard down with it.
  const inbox = await noticesFor(ctx.payload, ctx.tenantId).catch(() => [])
  const unread = inbox.filter((n) => !n.read)

  return (
    <DashLangProvider>
      <InstallApp label="ثبّت لوحة التحكم على شاشتك" />
      <div className="dash">
        <main className="dash-main">
          <MessageNotice
            latest={unread[0] ? { title: unread[0].title, tone: unread[0].tone } : null}
            unread={unread.length}
          />
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
          unread={unread.length}
        />
      </div>
    </DashLangProvider>
  )
}
