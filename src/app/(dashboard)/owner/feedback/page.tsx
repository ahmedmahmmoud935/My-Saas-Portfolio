import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import { readFeedback } from '@/lib/feedback-read'
import FeedbackInbox from '@/components/dashboard/FeedbackInbox'

export const dynamic = 'force-dynamic'

export default async function OwnerFeedbackPage({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  if (!ctx.user.isOwner) redirect('/dashboard')
  const { open } = await searchParams
  const items = await readFeedback(ctx.payload)
  return <FeedbackInbox items={items} openId={open ? Number(open) : undefined} />
}
