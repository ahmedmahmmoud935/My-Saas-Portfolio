import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { readFeedback } from '@/lib/feedback-read'
import FeedbackClient from '@/components/dashboard/FeedbackClient'

export const dynamic = 'force-dynamic'

export default async function FeedbackPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const items = await readFeedback(ctx.payload, { tenant: { equals: ctx.tenantId } })
  return <FeedbackClient items={items} />
}
