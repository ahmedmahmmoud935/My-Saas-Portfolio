import type { GlobalConfig } from 'payload'

/** Landing sections a backdrop can be attached to (mirrors LANDING_BG_SECTIONS). */
export const LANDING_SECTION_IDS = [
  'hero',
  'features',
  'how',
  'showcase',
  'pricing',
  'faq',
  'cta',
] as const

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
        // Dark palette (the page's default theme).
        { name: 'accent', type: 'text' },
        { name: 'bg', type: 'text' },
        { name: 'bg2', type: 'text' },
        { name: 'text', type: 'text' },
        { name: 'subtext', type: 'text' },
        // Light palette, used when the visitor switches. The landing is inside
        // the frontend layout, so it already receives that layout's saved
        // light/dark preference — it just had nothing to paint with.
        { name: 'accentLight', type: 'text' },
        { name: 'bgLight', type: 'text' },
        { name: 'bg2Light', type: 'text' },
        { name: 'textLight', type: 'text' },
        { name: 'subtextLight', type: 'text' },
      ],
    },
    {
      name: 'style',
      type: 'group',
      label: 'Card styles',
      fields: [
        // Plain text, not a select: these are rendered by the landing page and
        // picked from its own editor, so adding a variant should be a code
        // change, not a migration that widens an enum.
        {
          name: 'showcase',
          type: 'text',
          defaultValue: 'portrait',
          admin: { description: 'portrait | plate | row | cover' },
        },
        {
          name: 'card',
          type: 'text',
          defaultValue: 'solid',
          admin: { description: 'solid | outline | glass | elevated' },
        },
      ],
    },
    {
      name: 'sectionBg',
      type: 'array',
      label: 'Per-section backgrounds',
      admin: {
        description:
          'Give one section its own backdrop — a colour, a picture or a looping video. Sections not listed here keep the page background. A row serves both themes; only the veil over it changes colour.',
      },
      fields: [
        {
          name: 'section',
          type: 'select',
          options: LANDING_SECTION_IDS.map((v) => ({ label: v, value: v })),
        },
        {
          name: 'mode',
          type: 'select',
          defaultValue: 'color',
          options: [
            { label: 'Colour', value: 'color' },
            { label: 'Image', value: 'image' },
            { label: 'Video', value: 'video' },
          ],
        },
        { name: 'color', type: 'text' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'videoUrl', type: 'text' },
        { name: 'fixed', type: 'checkbox', label: 'Parallax (background stays put)' },
        { name: 'dim', type: 'number', defaultValue: 45, min: 0, max: 100 },
        // Which part of the picture stays in frame once it's cropped to fit.
        { name: 'posX', type: 'number', defaultValue: 50, min: 0, max: 100 },
        { name: 'posY', type: 'number', defaultValue: 50, min: 0, max: 100 },
      ],
    },
    {
      // The platform's own property. The landing page needs verifying and
      // measuring exactly as much as a client's portfolio does.
      name: 'seoTools',
      type: 'group',
      fields: [
        { name: 'searchConsole', type: 'text' },
        { name: 'analyticsId', type: 'text' },
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
