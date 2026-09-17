import type { Payload } from 'payload'

/** A message as a client's inbox shows it. */
export type InboxNotice = {
  id: number
  title: string
  body: string
  tone: 'info' | 'success' | 'warning'
  link: string | null
  createdAt: string
  read: boolean
}

/**
 * How far back a new client's inbox reaches for messages sent to everyone.
 *
 * Someone who signs up today should see this week's announcement, not every
 * announcement since the platform began — a new inbox holding forty old notes
 * reads as forty things to catch up on.
 */
const BROADCAST_LOOKBACK_MS = 14 * 24 * 60 * 60 * 1000

const idOf = (v: unknown): number | null =>
  typeof v === 'number' ? v : v && typeof v === 'object' ? ((v as { id?: number }).id ?? null) : null

/** Every message addressed to this portfolio, newest first, with whether it was read. */
export async function noticesFor(payload: Payload, tenantId: number): Promise<InboxNotice[]> {
  const tenant = await payload.findByID({ collection: 'tenants', id: tenantId, depth: 0 })
  const since = new Date(new Date(tenant.createdAt).getTime() - BROADCAST_LOOKBACK_MS).toISOString()
  const res = await payload.find({
    collection: 'notices',
    where: {
      or: [
        { tenant: { equals: tenantId } },
        { and: [{ audience: { equals: 'all' } }, { createdAt: { greater_than_equal: since } }] },
      ],
    },
    sort: '-createdAt',
    limit: 100,
    depth: 0,
  })
  return res.docs.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    tone: (n.tone ?? 'info') as InboxNotice['tone'],
    link: n.link ?? null,
    createdAt: n.createdAt,
    read: (n.readBy ?? []).some((r) => idOf(r) === tenantId),
  }))
}

/** Whether this message is meant for this portfolio. */
export function isAddressedTo(n: { audience?: string | null; tenant?: unknown }, tenantId: number): boolean {
  return n.audience === 'all' || idOf(n.tenant) === tenantId
}

export { idOf }
