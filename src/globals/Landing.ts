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
  fields: [
    { name: 'content', type: 'json', localized: true },
    // Look and imagery. Kept as real fields (not part of the JSON blob) because
    // the images are media relations and the colours aren't per-locale.
    {
      name: 'theme',
      type: 'group',
      fields: [
        { name: 'accent', type: 'text' },
        { name: 'bg', type: 'text' },
        { name: 'bg2', type: 'text' },
        { name: 'text', type: 'text' },
        { name: 'subtext', type: 'text' },
      ],
    },
    {
      name: 'images',
      type: 'group',
      fields: [
        { name: 'logo', type: 'upload', relationTo: 'media', label: 'Nav logo' },
        { name: 'hero', type: 'upload', relationTo: 'media', label: 'Hero image' },
        { name: 'heroDim', type: 'number', defaultValue: 40, min: 0, max: 100 },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Share preview' },
      ],
    },
  ],
}
