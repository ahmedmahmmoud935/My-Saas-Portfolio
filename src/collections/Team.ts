import type { CollectionConfig } from 'payload'

/**
 * The people behind a portfolio.
 *
 * A portfolio is written in the first person — "my work", "contact me" — which
 * is right for one freelancer and wrong for the three who work together and
 * share a studio name. This is the section that says who they are: a face, a
 * name, what they do, and a line about them.
 *
 * Localized on the words, not the face: a name is written differently in
 * Arabic and English, and the photograph is the same photograph.
 */
export const Team: CollectionConfig = {
  slug: 'team',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'sortOrder'],
  },
  access: {
    // The section is public; writes stay tenant-scoped through the plugin.
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'role', type: 'text', localized: true, admin: { description: 'Job title' } },
    { name: 'bio', type: 'textarea', localized: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'sortOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
