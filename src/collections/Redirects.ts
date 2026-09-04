import type { CollectionConfig } from 'payload'

/**
 * Old addresses that should still work.
 *
 * A slug is editable, and an article's first slug is generated from its opening
 * sentence — so the ones most likely to be rewritten are exactly the ones
 * already published and linked to. Rewriting one used to turn its address into
 * a 404 silently, taking any ranking and any link pointing at it with it.
 *
 * Rows are written automatically when a published article's slug changes, and
 * can be added by hand for a page that moved or went away.
 */
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'auto', 'updatedAt'],
  },
  access: {
    // The frontend reads these while serving a 404, before anyone is logged in.
    read: () => true,
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'The old path, e.g. /ahmed/articles/old-slug' },
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      admin: { description: 'Where it should go now.' },
    },
    {
      // So the list can show which ones were recorded for you and which you
      // typed, and so a re-rename can update its own row rather than stack up.
      name: 'auto',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Recorded automatically when a slug changed.' },
    },
  ],
}
