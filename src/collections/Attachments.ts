import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Files a client attaches to a suggestion: a screenshot of what went wrong, a
 * PDF of what they would like instead.
 *
 * Kept apart from Media on purpose. Media is the portfolio — it is converted to
 * WebP, sized for cards, and counted against the storage allowance; none of
 * that is right for a screenshot sent to the platform, and a PDF is not a
 * picture at all. Files are stored under a random name, so an address is only
 * known to the people it was shown to.
 */
export const Attachments: CollectionConfig = {
  slug: 'attachments',
  admin: { useAsTitle: 'filename' },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user?.isOwner),
    update: ({ req }) => Boolean(req.user?.isOwner),
    delete: ({ req }) => Boolean(req.user?.isOwner),
  },
  upload: {
    staticDir: path.resolve(dirname, '../../media/attachments'),
    mimeTypes: [
      'image/*',
      'application/pdf',
      'text/plain',
      'application/zip',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
  },
  fields: [
    // Whose it is, for the owner reading it later.
    { name: 'tenant', type: 'relationship', relationTo: 'tenants' },
    // The name it was sent with, since the stored one is random.
    { name: 'original', type: 'text' },
  ],
}
