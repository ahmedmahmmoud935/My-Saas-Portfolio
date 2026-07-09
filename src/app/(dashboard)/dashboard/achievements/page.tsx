import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import AchievementsManager from '@/components/dashboard/AchievementsManager'

export default async function AchievementsPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const res = await ctx.payload.find({
    collection: 'achievements',
    where: { tenant: { equals: ctx.tenantId } },
    sort: 'sortOrder',
    limit: 200,
    depth: 1,
    locale: 'ar',
  })
  const items = res.docs.map((a) => ({
    id: a.id,
    title: a.title,
    value: a.value,
    iconId: (a.icon && typeof a.icon === 'object' ? a.icon.id : (a.icon as number)) ?? null,
    iconUrl: mediaUrl(a.icon, 'thumb'),
  }))
  return <AchievementsManager items={items} />
}
