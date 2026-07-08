import type { CollectionConfig } from 'payload'

/**
 * Analytics events (old `visits` table). Created via a public track endpoint;
 * only owners/tenant staff can read. Country/device are derived server-side.
 */
export const Visits: CollectionConfig = {
  slug: 'visits',
  admin: {
    useAsTitle: 'page',
    defaultColumns: ['page', 'device', 'country', 'visitedAt'],
    group: 'System',
  },
  access: {
    // Anyone can record a visit; reads are restricted to authenticated users
    // (further scoped to their tenant by the multi-tenant plugin).
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: () => false,
    delete: ({ req }) => Boolean(req.user?.isOwner),
  },
  fields: [
    { name: 'visitorId', type: 'text', index: true },
    { name: 'page', type: 'text' },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
    { name: 'country', type: 'text' },
    {
      name: 'device',
      type: 'select',
      options: [
        { label: 'Desktop', value: 'desktop' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Tablet', value: 'tablet' },
      ],
    },
    { name: 'referrer', type: 'text' },
    {
      name: 'visitedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      index: true,
    },
  ],
}
