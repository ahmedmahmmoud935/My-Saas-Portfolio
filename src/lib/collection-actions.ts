'use server'

import { getDashboardContext } from './dashboard'

// Generic tenant-scoped CRUD for the simple per-tenant collections.
type Coll = 'logos' | 'achievements' | 'testimonials' | 'articles'
const ALLOWED: Coll[] = ['logos', 'achievements', 'testimonials', 'articles']

async function assertOwns(
  ctx: NonNullable<Awaited<ReturnType<typeof getDashboardContext>>>,
  collection: Coll,
  id: number,
) {
  const doc = await ctx.payload.findByID({ collection, id, depth: 0 })
  const t = typeof doc.tenant === 'object' ? doc.tenant?.id : doc.tenant
  if (t !== ctx.tenantId) throw new Error('forbidden')
}

export async function saveDoc(
  collection: Coll,
  id: number | undefined,
  data: Record<string, unknown>,
) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  if (!ALLOWED.includes(collection)) throw new Error('bad collection')

  // Never trust client-provided tenant/id.
  const { tenant: _t, id: _i, ...clean } = data
  void _t
  void _i

  if (id) {
    await assertOwns(ctx, collection, id)
    await ctx.payload.update({ collection, id, data: clean as never, locale: 'ar' })
    return { ok: true, id }
  }
  const created = await ctx.payload.create({
    collection,
    data: { ...clean, tenant: ctx.tenantId } as never,
    locale: 'ar',
  })
  return { ok: true, id: created.id }
}

export async function deleteDoc(collection: Coll, id: number) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  if (!ALLOWED.includes(collection)) throw new Error('bad collection')
  await assertOwns(ctx, collection, id)
  await ctx.payload.delete({ collection, id })
  return { ok: true }
}
