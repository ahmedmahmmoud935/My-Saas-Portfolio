import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import PageHeader from '@/components/dashboard/PageHeader'
import UsersManager from '@/components/dashboard/UsersManager'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')

  if (!ctx.user.isOwner) {
    return (
      <div>
        <PageHeader icon="👤" title="المستخدمون" subtitle="إدارة العملاء" />
        <div className="panel" style={{ textAlign: 'center', padding: 50, color: 'var(--sub)' }}>
          هذا القسم متاح لمالك المنصّة فقط.
        </div>
      </div>
    )
  }

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
    storageLimitMb: t.storageLimitMb ?? 500,
    storageUsedMb: t.storageUsedMb ?? 0,
    userId: userByTenant.get(t.id)?.id ?? null,
    email: userByTenant.get(t.id)?.email ?? '',
  }))

  return <UsersManager clients={clients} />
}
