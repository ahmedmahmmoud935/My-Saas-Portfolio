'use server'

import { getDashboardContext } from './dashboard'
import { sendActivation } from './activation'

async function ownerCtx() {
  const ctx = await getDashboardContext()
  if (!ctx || !ctx.user.isOwner) throw new Error('forbidden')
  return ctx
}

export async function createClient(input: {
  name: string
  slug: string
  email: string
  storageLimitMb: number
}) {
  const ctx = await ownerCtx()
  const tenant = await ctx.payload.create({
    collection: 'tenants',
    data: { name: input.name, slug: input.slug, storageLimitMb: input.storageLimitMb },
  })
  const user = await ctx.payload.create({
    collection: 'users',
    data: {
      email: input.email,
      // Unusable random password — the client sets their own via the emailed link/code.
      password: `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}A9!`,
      name: input.name,
      activated: false,
      tenants: [{ tenant: tenant.id }],
    },
  })
  // Email the client a set-password link + 6-digit code (proves email ownership).
  await sendActivation(ctx.payload, { id: user.id, email: input.email })
  return { ok: true, id: tenant.id }
}

/** Re-send the set-password link + code to an existing client. */
export async function resendActivation(email: string) {
  const ctx = await ownerCtx()
  const res = await ctx.payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  const u = res.docs[0]
  if (u) await sendActivation(ctx.payload, { id: u.id, email: u.email })
  return { ok: true }
}

export async function updateTenant(
  id: number,
  data: { storageLimitMb?: number; domain?: string | null },
) {
  const ctx = await ownerCtx()
  await ctx.payload.update({ collection: 'tenants', id, data })
  return { ok: true }
}

/** Suspend or re-enable a client (blocks login + hides their public site). */
export async function setSuspended(tenantId: number, suspended: boolean) {
  const ctx = await ownerCtx()
  await ctx.payload.update({ collection: 'tenants', id: tenantId, data: { suspended } })
  return { ok: true }
}

/** Permanently delete a client: all their content, media, users, then the tenant. */
export async function deleteClient(tenantId: number) {
  const ctx = await ownerCtx()
  const scoped = [
    'projects',
    'logos',
    'achievements',
    'testimonials',
    'articles',
    'visits',
    'site-settings',
    'media',
  ] as const
  for (const collection of scoped) {
    try {
      await ctx.payload.delete({ collection, where: { tenant: { equals: tenantId } } })
    } catch (e) {
      console.error(`[deleteClient] ${collection}`, e)
    }
  }
  // Users linked to this tenant.
  try {
    await ctx.payload.delete({ collection: 'users', where: { 'tenants.tenant': { equals: tenantId } } })
  } catch (e) {
    console.error('[deleteClient] users', e)
  }
  await ctx.payload.delete({ collection: 'tenants', id: tenantId })
  return { ok: true }
}

export async function setClientPassword(userId: number, password: string) {
  const ctx = await ownerCtx()
  await ctx.payload.update({ collection: 'users', id: userId, data: { password } })
  return { ok: true }
}
