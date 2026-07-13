import type { CollectionConfig } from 'payload'

/**
 * The heart of a tenant's config — the old per-tenant `settings` key/value store
 * (spec/01), modelled as a single per-tenant document. Registered with the
 * multi-tenant plugin as `isGlobal: true`, so each tenant has exactly one.
 *
 * Bilingual labels/copy use Payload localization (single `label`/text field per
 * locale) instead of the old `_ar`/`_en` column pairs.
 */

const SECTION_IDS = [
  'hero',
  'about',
  'projects',
  'achievements',
  'expertise',
  'testimonials',
  'logos',
  'experience',
  'tools',
  'education',
  'skills',
  'contact',
] as const

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  labels: { singular: 'Site settings', plural: 'Site settings' },
  admin: {
    useAsTitle: 'siteName',
    group: 'Configuration',
  },
  access: {
    read: () => true, // public read for portfolio rendering
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      admin: { description: 'Internal label for this settings record.' },
    },
    {
      type: 'tabs',
      tabs: [
        // ─── Social & links ──────────────────────────────────────────────
        {
          label: 'Social',
          fields: [
            {
              name: 'social',
              type: 'group',
              fields: [
                { name: 'whatsapp', type: 'text' },
                { name: 'behance', type: 'text' },
                { name: 'instagram', type: 'text' },
                { name: 'linkedin', type: 'text' },
                { name: 'facebook', type: 'text' },
                { name: 'vimeo', type: 'text' },
                {
                  name: 'visible',
                  type: 'select',
                  hasMany: true,
                  defaultValue: ['whatsapp', 'behance', 'instagram', 'linkedin', 'vimeo'],
                  options: ['whatsapp', 'behance', 'instagram', 'linkedin', 'facebook', 'vimeo'].map(
                    (v) => ({ label: v, value: v }),
                  ),
                },
              ],
            },
          ],
        },
        // ─── Brand & media ───────────────────────────────────────────────
        {
          label: 'Brand',
          fields: [
            {
              name: 'brand',
              type: 'group',
              fields: [
                { name: 'photo', type: 'upload', relationTo: 'media', label: 'About photo' },
                { name: 'avatar', type: 'upload', relationTo: 'media' },
                { name: 'heroCover', type: 'upload', relationTo: 'media' },
                { name: 'brandLogo', type: 'upload', relationTo: 'media' },
                { name: 'favicon', type: 'upload', relationTo: 'media' },
                {
                  type: 'row',
                  fields: [
                    { name: 'brandLogoScale', type: 'number', defaultValue: 1 },
                    { name: 'brandLogoOffsetX', type: 'number', defaultValue: 0 },
                    { name: 'brandLogoOffsetY', type: 'number', defaultValue: 0 },
                  ],
                },
              ],
            },
            {
              name: 'heroCover',
              type: 'group',
              label: 'Hero cover controls',
              fields: [
                {
                  name: 'size',
                  type: 'text',
                  defaultValue: 'cover',
                  admin: { description: "'cover' | 'contain' | 'NN%'" },
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'posX', type: 'number', defaultValue: 50, min: 0, max: 100 },
                    { name: 'posY', type: 'number', defaultValue: 50, min: 0, max: 100 },
                    { name: 'overlay', type: 'number', defaultValue: 0, min: 0, max: 100 },
                    { name: 'height', type: 'number', defaultValue: 85, admin: { description: 'vh' } },
                  ],
                },
              ],
            },
          ],
        },
        // ─── Design system ───────────────────────────────────────────────
        {
          label: 'Design',
          fields: [
            {
              name: 'colors',
              type: 'group',
              fields: [
                // Dark-mode palette (the site's default theme).
                { name: 'accent', type: 'text', defaultValue: '#F97316' },
                { name: 'bg', type: 'text', defaultValue: '#0A0A0A' },
                { name: 'bg2', type: 'text', defaultValue: '#111111' },
                { name: 'text', type: 'text', defaultValue: '#FFFFFF' },
                { name: 'subtext', type: 'text', defaultValue: '#999999' },
                // Light-mode palette (used when the visitor picks light mode).
                { name: 'accentLight', type: 'text', defaultValue: '#F97316' },
                { name: 'bgLight', type: 'text', defaultValue: '#FFFFFF' },
                { name: 'bg2Light', type: 'text', defaultValue: '#F3F5F8' },
                { name: 'textLight', type: 'text', defaultValue: '#0C0F16' },
                { name: 'subtextLight', type: 'text', defaultValue: '#495265' },
              ],
            },
            {
              name: 'background',
              type: 'group',
              fields: [
                {
                  name: 'preset',
                  type: 'select',
                  defaultValue: 'dark',
                  options: ['dark', 'ocean', 'sunset', 'forest', 'mono', 'pearl'].map((v) => ({
                    label: v,
                    value: v,
                  })),
                },
                {
                  name: 'type',
                  type: 'select',
                  defaultValue: 'solid',
                  options: [
                    { label: 'Solid', value: 'solid' },
                    { label: 'Gradient', value: 'gradient' },
                  ],
                },
                { name: 'color1', type: 'text' },
                { name: 'color2', type: 'text' },
              ],
            },
            {
              name: 'style',
              type: 'group',
              label: 'Layouts & typography',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'theme',
                      type: 'select',
                      defaultValue: 'default',
                      options: ['default', 'kinetic'].map((v) => ({ label: v, value: v })),
                    },
                    {
                      name: 'hero',
                      type: 'select',
                      defaultValue: 'centered',
                      options: ['centered', 'split', 'massive', 'cover-full', 'minimal'].map((v) => ({
                        label: v,
                        value: v,
                      })),
                    },
                    {
                      name: 'about',
                      type: 'select',
                      defaultValue: 'classic',
                      options: ['classic', 'visual', 'simple'].map((v) => ({ label: v, value: v })),
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'projects',
                      type: 'select',
                      defaultValue: 'grid',
                      options: ['grid', 'masonry', 'list', 'freegrid'].map((v) => ({
                        label: v,
                        value: v,
                      })),
                    },
                    {
                      name: 'expertise',
                      type: 'select',
                      defaultValue: 'grid',
                      options: ['grid', 'stack'].map((v) => ({ label: v, value: v })),
                    },
                    {
                      name: 'contact',
                      type: 'select',
                      defaultValue: 'classic',
                      options: ['classic', 'split'].map((v) => ({ label: v, value: v })),
                    },
                    {
                      name: 'skills',
                      type: 'select',
                      defaultValue: 'tags',
                      options: ['tags', 'inline', 'bars'].map((v) => ({ label: v, value: v })),
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'tools',
                      type: 'select',
                      defaultValue: 'classic',
                      options: ['classic', 'compact'].map((v) => ({ label: v, value: v })),
                    },
                    {
                      name: 'exp',
                      type: 'select',
                      defaultValue: 'classic',
                      options: ['classic', 'timeline'].map((v) => ({ label: v, value: v })),
                    },
                    {
                      name: 'font',
                      type: 'select',
                      defaultValue: 'default',
                      options: ['default', 'modern', 'editorial', 'elegant', 'bold'].map((v) => ({
                        label: v,
                        value: v,
                      })),
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'direction',
                      type: 'select',
                      defaultValue: 'auto',
                      options: ['auto', 'rtl', 'ltr'].map((v) => ({ label: v, value: v })),
                    },
                    {
                      name: 'cursor',
                      type: 'select',
                      defaultValue: 'default',
                      options: ['default', 'dot-ring'].map((v) => ({ label: v, value: v })),
                    },
                    {
                      name: 'anim',
                      type: 'select',
                      defaultValue: 'fade-up',
                      options: ['fade-up', 'fade', 'none'].map((v) => ({ label: v, value: v })),
                    },
                  ],
                },
              ],
            },
            {
              name: 'themeConfig',
              type: 'group',
              fields: [
                {
                  name: 'components',
                  type: 'group',
                  fields: [
                    {
                      name: 'card',
                      type: 'select',
                      defaultValue: 'solid',
                      options: ['solid', 'glass', 'outline'].map((v) => ({ label: v, value: v })),
                    },
                    {
                      name: 'navbar',
                      type: 'select',
                      defaultValue: 'blur',
                      options: ['blur', 'solid', 'transparent'].map((v) => ({ label: v, value: v })),
                    },
                    {
                      name: 'button',
                      type: 'select',
                      defaultValue: 'rounded',
                      options: ['rounded', 'sharp', 'pill'].map((v) => ({ label: v, value: v })),
                    },
                  ],
                },
                { name: 'tokens', type: 'json' },
              ],
            },
            {
              name: 'footer',
              type: 'group',
              fields: [
                { name: 'logoSize', type: 'number' },
                {
                  type: 'row',
                  fields: [
                    { name: 'logoAlign', type: 'text' },
                    { name: 'socialsAlign', type: 'text' },
                    { name: 'copyAlign', type: 'text' },
                  ],
                },
              ],
            },
            {
              name: 'themeOverrides',
              type: 'json',
              admin: { description: 'Per-theme override snapshots + _custom_<key> flags.' },
            },
          ],
        },
        // ─── Layout: nav, sections, mobile bar, grid, categories ─────────
        {
          label: 'Layout',
          fields: [
            {
              name: 'gridCols',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'imageMobile', type: 'number', defaultValue: 2 },
                    { name: 'imageTablet', type: 'number', defaultValue: 3 },
                    { name: 'imageDesktop', type: 'number', defaultValue: 4 },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'videoMobile', type: 'number', defaultValue: 2 },
                    { name: 'videoTablet', type: 'number', defaultValue: 3 },
                    { name: 'videoDesktop', type: 'number', defaultValue: 4 },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'freegridMobile', type: 'number', defaultValue: 1 },
                    { name: 'freegridDesktop', type: 'number', defaultValue: 2 },
                  ],
                },
              ],
            },
            {
              name: 'categories',
              type: 'group',
              fields: [
                {
                  name: 'image',
                  type: 'array',
                  fields: [{ name: 'name', type: 'text' }],
                  defaultValue: [
                    'Social Media',
                    'Brand Identity',
                    'Logo Design',
                    'Print Design',
                    'Packaging',
                    'Posters',
                    'UI/UX',
                  ].map((name) => ({ name })),
                },
                {
                  name: 'video',
                  type: 'array',
                  fields: [{ name: 'name', type: 'text' }],
                  defaultValue: [
                    'Reels',
                    'Motion Graphics',
                    'Video Editing',
                    'AI Videos',
                    'Promo Ads',
                    'Tutorials',
                  ].map((name) => ({ name })),
                },
              ],
            },
            {
              name: 'projTabs',
              type: 'group',
              label: 'Project section tabs',
              fields: (['designs', 'reels', 'videos'] as const).map((key) => ({
                name: key,
                type: 'group',
                fields: [
                  { name: 'visible', type: 'checkbox', defaultValue: true },
                  { name: 'label', type: 'text', localized: true },
                  { name: 'icon', type: 'text' },
                ],
              })),
            },
            {
              name: 'navbarLinks',
              type: 'array',
              admin: { description: 'Top-nav links (Articles link is appended automatically).' },
              defaultValue: ['about', 'expertise', 'experience', 'projects', 'contact'].map((id) => ({
                linkId: id,
                visible: true,
              })),
              fields: [
                { name: 'linkId', type: 'text', required: true },
                { name: 'label', type: 'text', localized: true },
                { name: 'visible', type: 'checkbox', defaultValue: true },
              ],
            },
            {
              name: 'sections',
              type: 'array',
              admin: { description: 'Portfolio sections — order + visibility (drag to reorder).' },
              defaultValue: SECTION_IDS.map((id, order) => ({ sectionId: id, visible: true, order })),
              fields: [
                {
                  name: 'sectionId',
                  type: 'select',
                  required: true,
                  options: SECTION_IDS.map((v) => ({ label: v, value: v })),
                },
                { name: 'label', type: 'text', localized: true },
                { name: 'visible', type: 'checkbox', defaultValue: true },
                { name: 'order', type: 'number' },
              ],
            },
            {
              name: 'mobileBar',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: true },
                {
                  name: 'buttons',
                  type: 'array',
                  maxRows: 3,
                  fields: [
                    {
                      name: 'pos',
                      type: 'select',
                      options: ['left', 'center', 'right'].map((v) => ({ label: v, value: v })),
                    },
                    {
                      name: 'type',
                      type: 'select',
                      options: ['section', 'whatsapp', 'articles', 'link'].map((v) => ({
                        label: v,
                        value: v,
                      })),
                    },
                    { name: 'target', type: 'text' },
                    { name: 'icon', type: 'text' },
                    { name: 'label', type: 'text', localized: true },
                  ],
                },
              ],
            },
            {
              name: 'highlights',
              type: 'array',
              admin: { description: 'Instagram-style story circles above the projects grid.' },
              fields: [
                { name: 'title', type: 'text', localized: true },
                { name: 'cover', type: 'upload', relationTo: 'media' },
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    {
                      name: 'type',
                      type: 'select',
                      defaultValue: 'image',
                      options: [
                        { label: 'Image', value: 'image' },
                        { label: 'Video', value: 'video' },
                      ],
                    },
                    { name: 'media', type: 'upload', relationTo: 'media', required: true },
                  ],
                },
              ],
            },
          ],
        },
        // ─── Content copy ────────────────────────────────────────────────
        {
          label: 'Content',
          fields: [
            {
              name: 'content',
              type: 'group',
              fields: [
                {
                  name: 'hero',
                  type: 'group',
                  fields: [
                    { name: 'name', type: 'text', localized: true },
                    { name: 'title', type: 'text', localized: true },
                    { name: 'btn1', type: 'text', localized: true },
                    { name: 'btn2', type: 'text', localized: true },
                  ],
                },
                {
                  name: 'about',
                  type: 'group',
                  fields: [
                    { name: 'text', type: 'textarea', localized: true },
                    { name: 'tags', type: 'text', localized: true, admin: { description: 'Comma-separated.' } },
                  ],
                },
                {
                  name: 'expertise',
                  type: 'group',
                  fields: [
                    { name: 'title', type: 'text', localized: true },
                    {
                      name: 'items',
                      type: 'array',
                      fields: [
                        { name: 'title', type: 'text', localized: true },
                        { name: 'description', type: 'textarea', localized: true },
                        { name: 'icon', type: 'upload', relationTo: 'media' },
                        // Background image + simple controls (used by the "stack" layout).
                        { name: 'image', type: 'upload', relationTo: 'media', label: 'Background image' },
                        { name: 'bgZoom', type: 'number', defaultValue: 100, admin: { description: 'Zoom %' } },
                        { name: 'bgOverlay', type: 'number', defaultValue: 45, admin: { description: 'Dim %' } },
                        { name: 'bgPosX', type: 'number', defaultValue: 50 },
                        { name: 'bgPosY', type: 'number', defaultValue: 50 },
                      ],
                    },
                  ],
                },
                {
                  name: 'experience',
                  type: 'group',
                  fields: [
                    {
                      name: 'items',
                      type: 'array',
                      fields: [
                        { name: 'company', type: 'text' },
                        { name: 'role', type: 'text', localized: true },
                        { name: 'period', type: 'text' },
                        { name: 'description', type: 'textarea', localized: true },
                      ],
                    },
                  ],
                },
                {
                  name: 'education',
                  type: 'group',
                  fields: [
                    {
                      name: 'items',
                      type: 'array',
                      fields: [
                        { name: 'title', type: 'text', localized: true },
                        { name: 'org', type: 'text', localized: true },
                        { name: 'period', type: 'text' },
                        { name: 'description', type: 'textarea', localized: true },
                      ],
                    },
                  ],
                },
                {
                  name: 'skills',
                  type: 'group',
                  fields: [
                    { name: 'items', type: 'text', localized: true, admin: { description: 'Comma-separated.' } },
                  ],
                },
                {
                  name: 'tools',
                  type: 'group',
                  fields: [
                    {
                      name: 'items',
                      type: 'array',
                      fields: [
                        { name: 'name', type: 'text' },
                        { name: 'icon', type: 'upload', relationTo: 'media' },
                      ],
                    },
                  ],
                },
                {
                  name: 'projects',
                  type: 'group',
                  fields: [
                    { name: 'title', type: 'text', localized: true },
                    { name: 'subtitle', type: 'text', localized: true },
                  ],
                },
                {
                  name: 'contact',
                  type: 'group',
                  fields: [
                    { name: 'title', type: 'text', localized: true },
                    { name: 'subtitle', type: 'text', localized: true },
                    { name: 'email', type: 'text' },
                    { name: 'phone', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
