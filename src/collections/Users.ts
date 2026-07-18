import type { CollectionConfig } from 'payload'

/**
 * Clients + owner. Payload's built-in auth handles login sessions; password
 * set/reset is done via our own link+code flow (see src/lib/activation.ts and
 * /api/activate). `activated` gates login until the client sets their password.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'isOwner', 'activated'],
  },
  auth: true,
  hooks: {
    // Block login until the client has activated (set their password via the
    // emailed link/code). Owners and already-activated users pass through.
    beforeLogin: [
      ({ user }) => {
        if (!user?.activated && !user?.isOwner) {
          throw new Error('لازم تفعّل حسابك أولًا من الرابط اللي وصل على إيميلك.')
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'isOwner',
      type: 'checkbox',
      defaultValue: false,
      label: 'Platform owner',
      admin: {
        description: 'Owner can manage every tenant. Regular clients are scoped to their own tenant.',
      },
      access: {
        update: ({ req }) => Boolean(req.user?.isOwner),
      },
    },
    // Whether the client has set their password / confirmed their email.
    {
      name: 'activated',
      type: 'checkbox',
      defaultValue: false,
      admin: { hidden: true },
    },
    // One-time set-password token + 6-digit code (+ expiry). Hidden + not exposed.
    { name: 'resetToken', type: 'text', admin: { hidden: true }, access: { read: () => false } },
    { name: 'resetCode', type: 'text', admin: { hidden: true }, access: { read: () => false } },
    { name: 'resetExp', type: 'number', admin: { hidden: true }, access: { read: () => false } },
  ],
}
