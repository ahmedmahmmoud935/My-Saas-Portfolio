import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import OwnerSidebar from '@/components/dashboard/OwnerSidebar'
import { DashLangProvider } from '@/components/dashboard/DashLang'
import InstallApp from '@/components/portfolio/InstallApp'

/**
 * The admin area. Owner-only, and gated here rather than page by page so a new
 * admin page can't accidentally ship without the check.
 */
export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  if (!ctx.user.isOwner) redirect('/dashboard')

  return (
    <DashLangProvider>
      <InstallApp label="ثبّت لوحة الإدارة على شاشتك" />
      <div className="dash">
        <main className="dash-main">{children}</main>
        <OwnerSidebar userName={ctx.user.name || ctx.user.email} />
      </div>
    </DashLangProvider>
  )
}
