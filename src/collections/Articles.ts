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
  hooks: {
    afterChange: [
      /**
       * Keep the old address working when a slug is rewritten.
       *
       * The first slug an article gets is generated from its opening sentence,
       * so the ones most likely to be rewritten are the ones already published
       * and linked to. Without this the old URL simply 404s and takes its
       * ranking and every link pointing at it along.
       *
       * Only for articles that were already published under the old slug —
       * nothing was ever linked to a draft, and recording redirects for slugs
       * nobody has seen would fill the table with noise.
       */
      async ({ req, doc, previousDoc, operation }) => {
        if (operation !== 'update') return doc
        const before = previousDoc?.slug as string | undefined
        const after = doc?.slug as string | undefined
        if (!before || !after || before === after) return doc
        if (previousDoc?.published !== true) return doc

        const tenantId =
          typeof doc.tenant === 'object' ? (doc.tenant as { id?: number })?.id : doc.tenant
        if (typeof tenantId !== 'number') return doc

        try {
          const tenant = await req.payload.findByID({
            collection: 'tenants',
            id: tenantId,
            depth: 0,
          })
          if (!tenant?.slug) return doc

          const from = `/${tenant.slug}/articles/${before}`
          const to = `/${tenant.slug}/articles/${after}`

          // Renaming twice must not leave a chain: anything that already
          // pointed at the old address is re-pointed at the new one.
          const stale = await req.payload.find({
            collection: 'redirects',
            where: { to: { equals: from } },
            limit: 100,
            depth: 0,
          })
          for (const r of stale.docs) {
            await req.payload.update({ collection: 'redirects', id: r.id, data: { to } })
          }

          const existing = await req.payload.find({
            collection: 'redirects',
            where: { from: { equals: from } },
            limit: 1,
            depth: 0,
          })
          if (existing.docs[0]) {
            await req.payload.update({ collection: 'redirects', id: existing.docs[0].id, data: { to } })
          } else {
            await req.payload.create({
              collection: 'redirects',
              data: { from, to, auto: true, tenant: tenantId } as never,
            })
          }
        } catch (err) {
          // A redirect is a courtesy; never fail the save over one — but say so,
          // otherwise a broken one is invisible.
          req.payload.logger.error({ err }, 'could not record redirect for renamed slug')
        }
        return doc
      },
    ],
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
        // What this piece should be found for. Drives the analysis panel; it
        // is never rendered on the page.
        { name: 'keyphrase', type: 'text', localized: true },
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
