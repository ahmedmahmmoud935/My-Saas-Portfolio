import type { CollectionConfig } from 'payload'
import { passwordEmailHTML } from '../lib/email'

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || 'https://viralpx.com'

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
  auth: {
    // Set/reset password via a one-time link emailed to the client. Used both
    // for first-time onboarding and the "forgot password" flow.
    forgotPassword: {
      expiration: 1000 * 60 * 60 * 24 * 3, // link valid for 3 days
      generateEmailSubject: () => 'تعيين كلمة سر ViralPX',
      generateEmailHTML: (args) => passwordEmailHTML(`${SITE}/set-password?token=${args?.token ?? ''}`),
    },
  },
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
