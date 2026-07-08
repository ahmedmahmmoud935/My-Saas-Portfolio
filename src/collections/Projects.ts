import type { CollectionConfig } from 'payload'
import { moduleBlocks } from '../blocks/modules'

/**
 * The core content type (spec/01 + spec/03). `projectType` controls the
 * detail-page layout; `modules` is the page-builder (Payload Blocks);
 * `images` is the separate gallery (old `project_images` table).
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'mediaType', 'projectType', 'sortOrder'],
  },
  access: {
    read: () => true, // public portfolios
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'category',
      type: 'text',
      admin: { description: 'One of the tenant’s image/video categories.' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'mediaType',
          type: 'select',
          defaultValue: 'image',
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Video', value: 'video' },
          ],
          required: true,
        },
        {
          name: 'projectType',
          type: 'select',
          defaultValue: 'grid',
          options: [
            { label: 'Grid (image gallery)', value: 'grid' },
            { label: 'Free (module page-builder)', value: 'free' },
            { label: 'Stacked (cover + images)', value: 'stacked' },
          ],
          required: true,
          admin: { description: 'How the detail page renders.' },
        },
      ],
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Cover / thumbnail (uses the generated thumb on grids).' },
    },
    // Video-only fields
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        condition: (data) => data?.mediaType === 'video',
        description: 'Embed link (YouTube / Vimeo / direct).',
      },
    },
    {
      type: 'row',
      admin: { condition: (data) => data?.mediaType === 'video' },
      fields: [
        {
          name: 'videoKind',
          type: 'select',
          defaultValue: 'reel',
          options: [
            { label: 'Reel (9:16)', value: 'reel' },
            { label: 'Video (16:9)', value: 'video' },
          ],
        },
        {
          name: 'aspectRatio',
          type: 'text',
          defaultValue: '9:16',
        },
      ],
    },
    // Gallery images (old project_images) — used by grid/stacked layouts.
    {
      name: 'images',
      type: 'array',
      admin: { description: 'Gallery images (separate from the page-builder).' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    // The page-builder blocks — primarily for projectType "free".
    {
      name: 'modules',
      type: 'blocks',
      blocks: moduleBlocks,
      admin: {
        description: 'Behance-style page builder (used by the "free" layout).',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
