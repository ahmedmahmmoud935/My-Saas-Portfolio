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
      // Localized: an article's address should be able to read in the language
      // it is written in, and the two languages are not always the same piece.
      // A shared slug forced an Arabic URL onto an English article and meant
      // renaming one renamed both.
      name: 'slug',
      type: 'text',
      required: true,
      localized: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Auto from title; unique per tenant, per language.',
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
      // Also localized: not every article exists in both languages. Publishing
      // was one switch for both, so an Arabic-only piece went live as an empty
      // English page or stayed unpublished in both.
      localized: true,
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      admin: { description: 'What a search engine shows, when it should differ from the article itself.' },
      fields: [
        // A headline written for a reader and a title written for a results
        // page are rarely the same sentence; there was nowhere to say so.
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
        {
          type: 'row',
          fields: [
            { name: 'noindex', type: 'checkbox', defaultValue: false },
            { name: 'nofollow', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
    {
      name: 'readMin',
      type: 'number',
      admin: { position: 'sidebar', description: 'Estimated read time (minutes).' },
    },
  ],
}
