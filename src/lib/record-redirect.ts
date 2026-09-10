import type { PayloadRequest } from 'payload'

/**
 * Keep an old address working after a slug is rewritten.
 *
 * The first slug a piece gets is generated from its title, so the ones most
 * likely to be rewritten are the ones already published and linked to. Without
 * this the old URL simply 404s and takes its ranking and every link pointing at
 * it along.
 *
 * Written once for both the tenants' articles and the platform's own posts:
 * the rule is the same, and a fix applied to one copy and not the other is how
 * the two would drift.
 */
export async function recordSlugRedirect({
  req,
  from,
  to,
  tenant,
}: {
  req: PayloadRequest
  from: string
  to: string
  /** Absent for the platform's own writing, which belongs to no tenant. */
  tenant?: number | null
}): Promise<void> {
  try {
    /* Two paths, because a tenant-less row is invisible to the ordinary API.
       The multi-tenant plugin scopes every read of this collection to the
       requesting user's tenants, so the platform's own redirects — which have
       no tenant — come back as "not found" from `payload.find`, and the
       chain-removal below silently did nothing: rename twice and the first
       address still pointed at the second, which no longer existed.

       Writes hit the same wall: the plugin makes the tenant field required and
       exposes no way to relax it, though the column is nullable and a
       tenant-less row reads perfectly well on the public side (verified).

       So platform redirects go through the database adapter, which skips the
       plugin rather than the write. The cost: if this collection ever gains
       another required field, these writes would quietly omit it. */
    const platform = !tenant

    const find = async (where: Record<string, unknown>, limit: number) =>
      platform
        ? ((await req.payload.db.find({ collection: 'redirects', where: where as never, limit, pagination: false })).docs as { id: number }[])
        : ((await req.payload.find({ collection: 'redirects', where: where as never, limit, depth: 0, overrideAccess: true })).docs as { id: number }[])

    const repoint = async (id: number) => {
      if (platform) {
        await req.payload.db.updateOne({ collection: 'redirects', id, data: { to } as never })
      } else {
        await req.payload.update({ collection: 'redirects', id, data: { to }, overrideAccess: true })
      }
    }

    // Renaming twice must not leave a chain: anything that already pointed at
    // the old address is re-pointed at the new one.
    for (const r of await find({ to: { equals: from } }, 100)) await repoint(r.id)

    const existing = await find({ from: { equals: from } }, 1)
    if (existing[0]) {
      await repoint(existing[0].id)
      return
    }

    if (platform) {
      await req.payload.db.create({ collection: 'redirects', data: { from, to, auto: true } as never })
    } else {
      await req.payload.create({
        collection: 'redirects',
        data: { from, to, auto: true, tenant } as never,
        overrideAccess: true,
      })
    }
  } catch (err) {
    // A redirect is a courtesy; never fail the save over one — but say so,
    // otherwise a broken one is invisible.
    req.payload.logger.error({ err }, 'could not record redirect for renamed slug')
  }
}
