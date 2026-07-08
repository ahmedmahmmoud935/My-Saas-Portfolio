import type { CollectionConfig } from 'payload'

/**
 * Blog articles (spec/01). Bilingual title/excerpt via localization.
 * Content authored as rich text (Lexical) with a raw-HTML escape hatch to keep
 * the old `mode='html'` capability. `slug` is unique per tenant.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'published', 'updatedAt'],
  },
  access: {
    read: () => true, // public blog (frontend filters unpublished)
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Auto from title; unique per tenant.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'richtext',
      options: [
        { label: 'Rich text', value: 'richtext' },
        { label: 'Raw HTML', value: 'html' },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      admin: { condition: (data) => data?.mode !== 'html' },
    },
    {
      name: 'contentHtml',
      type: 'code',
      localized: true,
      admin: {
        language: 'html',
        condition: (data) => data?.mode === 'html',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: { position: 'sidebar' },
      fields: [{ name: 'tag', type: 'text' }],
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'readMin',
      type: 'number',
      admin: { position: 'sidebar', description: 'Estimated read time (minutes).' },
    },
  ],
}
