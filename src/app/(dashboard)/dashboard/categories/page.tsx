import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import CategoriesEditor from '@/components/dashboard/CategoriesEditor'

export default async function CategoriesPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const settings = await getTenantSettings(ctx)

  const image = (settings.categories?.image ?? []).map((c) => c.name || '').filter(Boolean)
  const video = (settings.categories?.video ?? []).map((c) => c.name || '').filter(Boolean)

  return <CategoriesEditor initialImage={image} initialVideo={video} />
}
