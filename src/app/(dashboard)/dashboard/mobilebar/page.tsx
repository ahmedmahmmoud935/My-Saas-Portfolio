import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import MobilebarEditor from '@/components/dashboard/MobilebarEditor'

export default async function MobilebarPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const settings = await getTenantSettings(ctx)
  const mb = (settings.mobileBar ?? {}) as Record<string, unknown>
  const buttons = ((mb.buttons as Record<string, unknown>[]) ?? []).map((b) => ({
    pos: (b.pos as string) || 'left',
    type: (b.type as string) || 'section',
    target: (b.target as string) || '',
    icon: (b.icon as string) || '',
    label: (b.label as string) || '',
  }))
  return <MobilebarEditor initial={{ enabled: mb.enabled !== false, buttons }} />
}
