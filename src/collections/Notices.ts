import type { CollectionConfig } from 'payload'

const ownerOnly = ({ req }: { req: { user?: { isOwner?: boolean | null } | null } }) => Boolean(req.user?.isOwner)

/**
 * A message from the platform to the people on it — one client, or all of them.
 *
 * Read state is kept per portfolio on the message itself: a note sent to every
 * client is one row, and the list of who has opened it grows as they do. That
 * is also what tells the owner how far a message has reached.
 *
 * Written through the dashboards' own actions, which check who is asking; the
 * REST door is left to the owner alone.
 */
export const Notices: CollectionConfig = {
  slug: 'notices',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'audience', 'createdAt'] },
  access: { read: ownerOnly, create: ownerOnly, update: ownerOnly, delete: ownerOnly },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Good news', value: 'success' },
        { label: 'Needs attention', value: 'warning' },
      ],
    },
    {
      name: 'audience',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: 'Every client', value: 'all' },
        { label: 'One client', value: 'one' },
      ],
    },
    // The one client, when it is for one.
    { name: 'tenant', type: 'relationship', relationTo: 'tenants' },
    // An address to go with it — a new feature to try, a page to read.
    { name: 'link', type: 'text' },
    { name: 'readBy', type: 'relationship', relationTo: 'tenants', hasMany: true },
  ],
}
