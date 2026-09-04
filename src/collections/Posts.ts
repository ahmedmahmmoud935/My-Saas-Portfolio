import type { CollectionConfig } from 'payload'

/**
 * The platform's own writing, at /blog.
 *
 * Separate from `articles`, which belong to a tenant. Reusing that collection
 * would have meant giving the platform a portfolio to hang its posts off, and
 * the same piece would then exist at two addresses — one of them competing with
 * the other in search results, which is the opposite of the point.
 *
 * viralpx.com had a landing page and nothing else, so it could only ever rank
 * for its own name. Nobody searching for a way to build a portfolio types
 * "ViralPX".
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'published', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user?.isOwner),
    update: ({ req }) => Boolean(req.user?.isOwner),
    delete: ({ req }) => Boolean(req.user?.isOwner),
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    {
      // Per language, for the same reason articles are: the two versions aim at
      // different searches and are often not the same piece.
      name: 'slug',
      type: 'text',
      required: true,
      localized: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    { name: 'excerpt', type: 'textarea', localized: true },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'contentHtml', type: 'textarea', localized: true },
    { name: 'published', type: 'checkbox', localized: true, defaultValue: false },
    { name: 'readMin', type: 'number', defaultValue: 3 },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'keyphrase', type: 'text', localized: true },
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
  ],
}
