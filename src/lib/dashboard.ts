import { headers as nextHeaders } from 'next/headers'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import type { User, SiteSetting } from '../payload-types'

export { DASHBOARD_NAV, type NavItem } from './dashboard-nav'

export type DashboardContext = {
  payload: Payload
  user: User
  tenantId: number
}

/**
 * Resolve the logged-in dashboard user + their tenant from the Payload auth
 * cookie. Returns null when not authenticated or when the user has no tenant.
 */
export async function getDashboardContext(): Promise<DashboardContext | null> {
  const payload = await getPayload({ config })
  const headers = await nextHeaders()
  const { user } = await payload.auth({ headers })
  if (!user) return null

  const first = user.tenants?.[0]?.tenant
  let tenantId: number | undefined =
    typeof first === 'object' ? first?.id : (first as number | undefined)

  // Owner with no explicit tenant → fall back to the first tenant so the
  // dashboard is still usable in dev.
  if (!tenantId && user.isOwner) {
    const t = await payload.find({ collection: 'tenants', limit: 1, depth: 0 })
    tenantId = t.docs[0]?.id
  }
  if (!tenantId) return null

  return { payload, user, tenantId }
}

// NavItem + DASHBOARD_NAV live in ./dashboard-nav (client-safe) and are
// re-exported above.

/** The one settings doc for a tenant (created on demand if missing). */
export async function getTenantSettings(ctx: DashboardContext): Promise<SiteSetting> {
  const res = await ctx.payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: ctx.tenantId } },
    limit: 1,
    depth: 1,
  })
  if (res.docs[0]) return res.docs[0]
  return ctx.payload.create({
    collection: 'site-settings',
    data: { tenant: ctx.tenantId },
  })
}

