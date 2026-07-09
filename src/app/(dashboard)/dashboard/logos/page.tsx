import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import LogosManager from '@/components/dashboard/LogosManager'

export default async function LogosPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const res = await ctx.payload.find({
    collection: 'logos',
    where: { tenant: { equals: ctx.tenantId } },
    sort: 'sortOrder',
    limit: 200,
    depth: 1,
  })
  const logos = res.docs.map((l) => ({
    id: l.id,
    name: l.name,
    websiteUrl: l.websiteUrl ?? '',
    logoId: (l.logo && typeof l.logo === 'object' ? l.logo.id : (l.logo as number)) ?? null,
    logoUrl: mediaUrl(l.logo, 'thumb'),
  }))
  return <LogosManager logos={logos} />
}
