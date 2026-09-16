import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import UsersManager from '@/components/dashboard/UsersManager'
import { DEFAULT_STORAGE_MB } from '@/lib/quota'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')


  const [tenantsRes, usersRes] = await Promise.all([
    ctx.payload.find({ collection: 'tenants', limit: 500, depth: 0, sort: 'name' }),
    ctx.payload.find({ collection: 'users', limit: 1000, depth: 1 }),
  ])

  const userByTenant = new Map<number, { id: number; email: string }>()
  for (const u of usersRes.docs) {
    for (const t of u.tenants ?? []) {
      const tid = typeof t.tenant === 'object' ? t.tenant?.id : t.tenant
      if (tid && !userByTenant.has(tid)) userByTenant.set(tid, { id: u.id, email: u.email })
    }
  }

  const clients = tenantsRes.docs.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    domain: t.domain ?? '',
    storageLimitMb: t.storageLimitMb ?? DEFAULT_STORAGE_MB,
    storageUsedMb: t.storageUsedMb ?? 0,
    suspended: Boolean((t as { suspended?: boolean }).suspended),
    userId: userByTenant.get(t.id)?.id ?? null,
    email: userByTenant.get(t.id)?.email ?? '',
    // The owner's own portfolio is one of these rows, and its login is theirs.
    self: userByTenant.get(t.id)?.id === ctx.user.id,
  }))

  return <UsersManager clients={clients} />
}
