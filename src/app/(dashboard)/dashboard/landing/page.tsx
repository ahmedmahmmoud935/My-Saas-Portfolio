import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { getLandingForm } from '@/lib/landing-actions'
import LandingEditor from '@/components/dashboard/LandingEditor'
import DashNotice from '@/components/dashboard/DashNotice'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')

  if (!ctx.user.isOwner) {
    return (
      <DashNotice
        icon="🌍"
        titleAr="الصفحة الرئيسية"
        titleEn="Landing page"
        subAr="تعديل صفحة الموقع الرئيسية"
        subEn="Edit the landing page"
        bodyAr="هذا القسم متاح لمالك المنصّة فقط."
        bodyEn="This section is only available to the platform owner."
      />
    )
  }

  const form = await getLandingForm()
  return <LandingEditor initial={form} />
}
