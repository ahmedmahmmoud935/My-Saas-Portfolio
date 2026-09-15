import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { getLandingForm } from '@/lib/landing-actions'
import LandingEditor from '@/components/dashboard/LandingEditor'

export const dynamic = 'force-dynamic'

/**
 * What the landing page says, section by section, in the order it says it.
 *
 * Its own page rather than a group inside a bigger one: the three groups were
 * a second column of navigation beside the first, and two levels of sidebar
 * for one editor is a maze. The same editor and the same form on all three
 * pages — every one loads and saves every field, so moving between them
 * cannot drop what another was holding.
 */
export default async function OwnerContentPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  if (!ctx.user.isOwner) redirect('/dashboard')

  const form = await getLandingForm()
  return <LandingEditor initial={form} groups={['Content']} />
}
