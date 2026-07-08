import type { CollectionConfig } from 'payload'

/**
 * Client reviews (old `testimonials` table). Public visitors can submit
 * (→ approved=false for moderation); admin-created default to approved.
 */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'company', 'rating', 'approved', 'source'],
  },
  access: {
    read: () => true, // frontend shows approved only
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'role', type: 'text', localized: true },
        { name: 'company', type: 'text' },
      ],
    },
    { name: 'content', type: 'textarea', localized: true, required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    {
      name: 'rating',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 5,
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Public submission', value: 'public' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
