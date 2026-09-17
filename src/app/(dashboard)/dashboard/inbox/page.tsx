import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { noticesFor } from '@/lib/inbox'
import InboxView from '@/components/dashboard/InboxView'

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const items = await noticesFor(ctx.payload, ctx.tenantId)
  return <InboxView items={items} />
}
