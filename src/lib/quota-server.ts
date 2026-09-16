import type { Payload } from 'payload'
import { QUOTA_FULL } from './quota'

/**
 * Whether a portfolio has room for `incomingBytes` more.
 *
 * Throws QUOTA_FULL when it does not. A tenant with no limit set, or none at
 * all (the platform's own media), is never refused.
 */
export async function assertRoom(payload: Payload, tenant: unknown, incomingBytes: number) {
  const id = typeof tenant === 'object' && tenant ? (tenant as { id?: number }).id : (tenant as number | undefined)
  if (!id) return
  const t = await payload.findByID({ collection: 'tenants', id, depth: 0, overrideAccess: true })
  const limit = t?.storageLimitMb ?? 0
  if (!limit || limit <= 0) return
  const used = t.storageUsedMb ?? 0
  if (used + incomingBytes / 1048576 > limit) throw new Error(QUOTA_FULL)
}
