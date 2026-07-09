'use server'

import { getDashboardContext } from './dashboard'

async function ownerCtx() {
  const ctx = await getDashboardContext()
  if (!ctx || !ctx.user.isOwner) throw new Error('forbidden')
  return ctx
}

export async function createClient(input: {
  name: string
  slug: string
  email: string
  password: string
  storageLimitMb: number
}) {
  const ctx = await ownerCtx()
  const tenant = await ctx.payload.create({
    collection: 'tenants',
    data: { name: input.name, slug: input.slug, storageLimitMb: input.storageLimitMb },
  })
  await ctx.payload.create({
    collection: 'users',
    data: {
      email: input.email,
      password: input.password,
      name: input.name,
      tenants: [{ tenant: tenant.id }],
    },
  })
  return { ok: true, id: tenant.id }
}

export async function updateTenant(
  id: number,
  data: { storageLimitMb?: number; domain?: string | null },
) {
  const ctx = await ownerCtx()
  await ctx.payload.update({ collection: 'tenants', id, data })
  return { ok: true }
}

export async function setClientPassword(userId: number, password: string) {
  const ctx = await ownerCtx()
  await ctx.payload.update({ collection: 'users', id: userId, data: { password } })
  return { ok: true }
}
