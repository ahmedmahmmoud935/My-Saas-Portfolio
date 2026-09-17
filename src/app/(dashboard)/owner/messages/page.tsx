import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import MessagesManager, { type SentNotice } from '@/components/dashboard/MessagesManager'

export const dynamic = 'force-dynamic'

export default async function OwnerMessagesPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  if (!ctx.user.isOwner) redirect('/dashboard')

  const [notices, tenants] = await Promise.all([
    ctx.payload.find({ collection: 'notices', sort: '-createdAt', limit: 200, depth: 0 }),
    ctx.payload.find({ collection: 'tenants', sort: 'name', limit: 500, depth: 0 }),
  ])
  const byId = new Map(tenants.docs.map((x) => [x.id, x]))
  const sent: SentNotice[] = notices.docs.map((n) => {
    const tid = typeof n.tenant === 'object' ? n.tenant?.id : n.tenant
    // Everyone who existed at the time, plus those who joined within the
    // window an inbox looks back over — the same rule the inbox itself uses.
    const reach =
      n.audience === 'one'
        ? 1
        : tenants.docs.filter((x) => new Date(x.createdAt).getTime() - 14 * 864e5 <= new Date(n.createdAt).getTime()).length
    return {
      id: n.id,
      title: n.title,
      body: n.body,
      tone: (n.tone ?? 'info') as SentNotice['tone'],
      audience: (n.audience ?? 'all') as SentNotice['audience'],
      client: tid ? (byId.get(tid)?.name ?? null) : null,
      link: n.link ?? null,
      createdAt: n.createdAt,
      readCount: (n.readBy ?? []).length,
      reach,
    }
  })
  const clients = tenants.docs.map((x) => ({ id: x.id, name: x.name, slug: x.slug }))
  return <MessagesManager sent={sent} clients={clients} />
}
