import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { getLandingForm } from '@/lib/landing-actions'
import LandingEditor from '@/components/dashboard/LandingEditor'

export const dynamic = 'force-dynamic'

/** Everything around the page rather than in it: the bar on top, the footer,
 *  the legal pages, and what Google is told. */
export default async function OwnerSitePage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  if (!ctx.user.isOwner) redirect('/dashboard')

  const form = await getLandingForm()
  return <LandingEditor initial={form} groups={['Site']} />
}
