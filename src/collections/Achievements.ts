import type { CollectionConfig } from 'payload'

/** Animated counters (old `achievements` table). `value` is a string like "50+". */
export const Achievements: CollectionConfig = {
  slug: 'achievements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'value', 'sortOrder'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'value', type: 'text', required: true, admin: { description: 'e.g. "50+"' } },
    { name: 'icon', type: 'upload', relationTo: 'media' },
    { name: 'sortOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
