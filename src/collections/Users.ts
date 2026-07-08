import type { CollectionConfig } from 'payload'

/**
 * Clients + owner. Payload's built-in auth replaces the old plaintext-password
 * `users` table. `isOwner` marks the platform owner (cross-tenant access).
 * The multi-tenant plugin auto-adds a `tenants` array field associating each
 * client user with their tenant(s).
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'isOwner'],
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'isOwner',
      type: 'checkbox',
      defaultValue: false,
      label: 'Platform owner',
      admin: {
        description: 'Owner can manage every tenant. Regular clients are scoped to their own tenant.',
      },
      access: {
        // Only owners can grant/revoke owner status.
        update: ({ req }) => Boolean(req.user?.isOwner),
      },
    },
  ],
}
