import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import RedirectsManager from '@/components/dashboard/RedirectsManager'

export const dynamic = 'force-dynamic'

export default async function RedirectsPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')

  const res = await ctx.payload.find({
    collection: 'redirects',
    where: { tenant: { equals: ctx.tenantId } },
    sort: '-createdAt',
    limit: 300,
    depth: 0,
  })

  return (
    <RedirectsManager
      items={res.docs.map((r) => ({
        id: r.id,
        from: r.from,
        to: r.to,
        auto: r.auto === true,
      }))}
    />
  )
}
