import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { linkPreviewImage } from '../lib/link-preview'

/**
 * "Beyond the image": the digital products a creative has built — a landing
 * page, a dashboard, a tool — each one a card with a picture of it, what it
 * is, what it does, and a button to the live thing.
 *
 * A collection, like the team beside it: each card has a picture, is added,
 * reordered and removed on its own. Localized on the words; the picture and
 * the address are the same in both languages.
 */
/* With no picture uploaded, the card shows the one the live site offers for
   itself. Looked up when the link is first set or changes, and kept. */
const readPreview: CollectionBeforeChangeHook = async ({ data, originalDoc }) => {
  if (data.url === undefined) return data
  const url = String(data.url ?? '').trim()
  if (!url) return { ...data, previewImage: null }
  if (url === originalDoc?.url && originalDoc?.previewImage) return data
  return { ...data, previewImage: (await linkPreviewImage(url)) ?? null }
}

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tag', 'sortOrder'],
  },
  access: {
    // The section is public; writes stay tenant-scoped through the plugin.
    read: () => true,
  },
  hooks: { beforeChange: [readPreview] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'tag', type: 'text', localized: true, admin: { description: 'What kind of product: "Landing page", "Concept"…' } },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'details', type: 'textarea', localized: true, admin: { description: 'Opened by "Details" on the card.' } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'url', type: 'text', admin: { description: 'The live product. Empty: no button.' } },
    // The live site's own share picture, found from the link (see readPreview).
    { name: 'previewImage', type: 'text', admin: { readOnly: true } },
    { name: 'btnLabel', type: 'text', localized: true },
    { name: 'sortOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
