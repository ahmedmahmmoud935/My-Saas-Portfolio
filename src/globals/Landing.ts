import type { GlobalConfig } from 'payload'

/**
 * Owner-editable copy for the marketing landing page (/). Stored as a single
 * localized JSON blob so the shape can evolve without migrations; the page
 * merges it over the code defaults in src/lib/landing-copy.ts.
 */
export const Landing: GlobalConfig = {
  slug: 'landing',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user?.isOwner),
  },
  fields: [{ name: 'content', type: 'json', localized: true }],
}
