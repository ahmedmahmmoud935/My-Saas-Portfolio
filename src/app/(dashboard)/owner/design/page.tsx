import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { getLandingForm } from '@/lib/landing-actions'
import LandingEditor from '@/components/dashboard/LandingEditor'

export const dynamic = 'force-dynamic'

/**
 * The landing page's look, on its own — the same split the client dashboard
 * makes between what a site says and how it looks.
 *
 * It is the same editor and the same form: both pages load every field and
 * save every field, so moving between them cannot drop what the other one
 * edits. Only the tabs on show differ.
 */
export default async function LandingDesignPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')

  const form = await getLandingForm()
  return <LandingEditor initial={form} groups={['Design']} />
}
