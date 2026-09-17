'use server'

import { getDashboardContext } from './dashboard'
import { idOf, isAddressedTo } from './inbox'

async function ownerCtx() {
  const ctx = await getDashboardContext()
  if (!ctx || !ctx.user.isOwner) throw new Error('forbidden')
  return ctx
}

/** A message from the platform: to one portfolio, or to all of them. */
export async function sendNotice(input: {
  title: string
  body: string
  tone: 'info' | 'success' | 'warning'
  audience: 'all' | 'one'
  tenantId?: number | null
  link?: string
}): Promise<{ ok: true } | { ok: false; code: string }> {
  const ctx = await ownerCtx()
  const title = input.title.trim()
  const body = input.body.trim()
  // Returned, not thrown: production hides a thrown message from the page.
  if (!title || !body) return { ok: false, code: 'empty' }
  if (input.audience === 'one' && !input.tenantId) return { ok: false, code: 'no-client' }
  await ctx.payload.create({
    collection: 'notices',
    data: {
      title,
      body,
      tone: input.tone,
      audience: input.audience,
      tenant: input.audience === 'one' ? input.tenantId : null,
      link: input.link?.trim() || null,
      readBy: [],
    },
  })
  return { ok: true }
}

export async function deleteNotice(id: number) {
  const ctx = await ownerCtx()
  await ctx.payload.delete({ collection: 'notices', id })
  return { ok: true }
}

/**
 * The client has seen these. Only messages actually addressed to their
 * portfolio are touched — an id guessed from elsewhere is ignored.
 */
export async function markNoticesRead(ids: number[]) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  for (const id of ids.slice(0, 100)) {
    try {
      const n = await ctx.payload.findByID({ collection: 'notices', id, depth: 0 })
      if (!n || !isAddressedTo(n, ctx.tenantId)) continue
      const readers = (n.readBy ?? []).map(idOf).filter((x): x is number => typeof x === 'number')
      if (readers.includes(ctx.tenantId)) continue
      await ctx.payload.update({ collection: 'notices', id, data: { readBy: [...readers, ctx.tenantId] } })
    } catch {
      /* a message deleted meanwhile — nothing to mark */
    }
  }
  return { ok: true }
}
