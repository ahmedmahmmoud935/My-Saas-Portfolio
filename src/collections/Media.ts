import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Uploaded media (→ R2 in prod via storage-s3, local disk in dev when R2 is
 * unset). Keeps the old WebP-thumbnail convention via Payload imageSizes:
 * grids/bubbles use `thumb`, detail/story use the original.
 */
/** Adjust a tenant's storageUsedMb by a delta (MB), clamped at 0. */
async function bumpStorage(
  req: { payload: import('payload').Payload },
  tenant: number | { id: number } | null | undefined,
  deltaMb: number,
) {
  const tenantId = typeof tenant === 'object' ? tenant?.id : tenant
  if (!tenantId || !deltaMb) return
  try {
    const t = await req.payload.findByID({ collection: 'tenants', id: tenantId, depth: 0 })
    const next = Math.max(0, (t.storageUsedMb ?? 0) + deltaMb)
    await req.payload.update({
      collection: 'tenants',
      id: tenantId,
      data: { storageUsedMb: Math.round(next * 100) / 100 },
      overrideAccess: true,
    })
  } catch {
    // Non-fatal: quota accounting shouldn't block uploads.
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // public portfolios need public media
  },
  hooks: {
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
