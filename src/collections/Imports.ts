import type { CollectionConfig } from 'payload'

/**
 * Short-lived staging rows for the Behance bookmarklet: the scraped payload
 * (base64 images + modules) is stored here by the (unauthenticated, CORS)
 * submit route, then the authenticated dashboard finalizes it into a project
 * and deletes the row. All access goes through overrideAccess in the routes.
 */
export const Imports: CollectionConfig = {
  slug: 'imports',
  admin: { hidden: true },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'token', type: 'text', index: true },
    { name: 'data', type: 'json' },
    { name: 'expiresAt', type: 'number' },
  ],
}
