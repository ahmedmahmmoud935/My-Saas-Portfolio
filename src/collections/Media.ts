import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { sql } from '@payloadcms/db-postgres'
import { assertRoom } from '../lib/quota-server'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Uploaded media (→ R2 in prod via storage-s3, local disk in dev when R2 is
 * unset). Keeps the old WebP-thumbnail convention via Payload imageSizes:
 * grids/bubbles use `thumb`, detail/story use the original.
 */
/**
 * Adjust a tenant's storageUsedMb by a delta (MB), clamped at 0.
 *
 * One statement in the database, not a read and then a write: two uploads
 * finishing together each read the same total, each added their own file to
 * it, and the second write erased the first — the counter fell behind what was
 * really stored, and the allowance with it.
 */
async function bumpStorage(
  req: { payload: import('payload').Payload },
  tenant: number | { id: number } | null | undefined,
  deltaMb: number,
) {
  const tenantId = typeof tenant === 'object' ? tenant?.id : tenant
  if (!tenantId || !deltaMb) return
  try {
    const db = (req.payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<unknown> } }).drizzle
    await db.execute(sql`
      UPDATE "tenants"
      SET "storage_used_mb" = ROUND(GREATEST(0, COALESCE("storage_used_mb", 0) + ${deltaMb})::numeric, 2)
      WHERE "id" = ${tenantId}`)
  } catch (e) {
    // Non-fatal: quota accounting shouldn't block uploads.
    console.error('[media] storage counter not updated:', (e as Error)?.message)
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // public portfolios need public media
  },
  hooks: {
    /* The one door every file comes through — the dashboard's uploader, a
       project's page, a Behance import, a visitor's review photo — so the
       allowance is checked here rather than at each of them. The platform's
       own dashboard passes `skipQuota`: the owner's uploads are the owner's
       storage to spend. */
    beforeChange: [
      async ({ req, data, operation, context }) => {
        if (operation !== 'create' || context?.skipQuota) return data
        const size = (req.file?.size as number | undefined) ?? (data?.filesize as number | undefined) ?? 0
        await assertRoom(req.payload, data?.tenant, size)
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'create') return
        const mb = (doc.filesize ?? 0) / 1048576
        await bumpStorage(req, (doc as { tenant?: number }).tenant, mb)
        void previousDoc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const mb = (doc.filesize ?? 0) / 1048576
        await bumpStorage(req, (doc as { tenant?: number }).tenant, -mb)
      },
    ],
  },
  upload: {
    // Local fallback dir (ignored once storage-s3/R2 is active).
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*', 'video/*'],
    focalPoint: true,
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },
    imageSizes: [
      {
        name: 'thumb',
        width: 640,
        formatOptions: { format: 'webp', options: { quality: 78 } },
      },
      {
        name: 'card',
        width: 1024,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
    },
  ],
}
