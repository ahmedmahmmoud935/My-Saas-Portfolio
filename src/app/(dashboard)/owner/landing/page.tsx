import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { getLandingForm } from '@/lib/landing-actions'
import LandingEditor from '@/components/dashboard/LandingEditor'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')


  const form = await getLandingForm()
  // The look lives at /owner/design; this page is what the page says.
  return <LandingEditor initial={form} groups={['Content', 'Site']} />
}
