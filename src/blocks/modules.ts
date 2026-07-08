import type { Block } from 'payload'

/**
 * The project page-builder blocks (`modules[]` in the old system).
 * Maps 1:1 to spec/03 §3. Used by the `free` (Behance-style) project layout,
 * but available to any project.
 */

export const TextBlock: Block = {
  slug: 'text',
  labels: { singular: 'Text', plural: 'Text blocks' },
  fields: [
    {
      name: 'textType',
      type: 'select',
      defaultValue: 'p',
      options: [
        { label: 'Heading (H1)', value: 'h1' },
        { label: 'Subheading (H2)', value: 'h2' },
        { label: 'Paragraph', value: 'p' },
      ],
    },
    {
      name: 'value',
      type: 'textarea',
      localized: true,
      required: true,
    },
  ],
}

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    {
      name: 'src',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}

/** Behance-style flex row: images share a height, widths proportional to aspect ratio. */
export const GridBlock: Block = {
  slug: 'grid',
  labels: { singular: 'Photo grid', plural: 'Photo grids' },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'src',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'embedUrl',
      type: 'text',
      required: true,
      admin: { description: 'YouTube / Vimeo / direct embed URL.' },
    },
  ],
}

export const BeforeAfterBlock: Block = {
  slug: 'beforeafter',
  labels: { singular: 'Before / after', plural: 'Before / after sliders' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'before', type: 'upload', relationTo: 'media', required: true },
        { name: 'after', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'labelBefore', type: 'text', localized: true },
        { name: 'labelAfter', type: 'text', localized: true },
      ],
    },
  ],
}

export const SeparatorBlock: Block = {
  slug: 'separator',
  labels: { singular: 'Separator', plural: 'Separators' },
  fields: [
    {
      name: 'spacing',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Compact', value: 'compact' },
        { label: 'Normal', value: 'normal' },
        { label: 'Large', value: 'large' },
      ],
      admin: { description: 'Thin gradient divider — pick the vertical spacing.' },
    },
  ],
}

export const moduleBlocks: Block[] = [
  TextBlock,
  ImageBlock,
  GridBlock,
  VideoBlock,
  BeforeAfterBlock,
  SeparatorBlock,
]
