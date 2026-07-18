import type { CollectionConfig } from 'payload'

/**
 * One tenant per client portfolio. `slug` is the pretty-URL username
 * (`/<username>`). `domain` maps a custom domain → tenant (old `domains` table).
 * Storage quota mirrors the old `storage_limit_mb` / `storage_used_mb`.
 *
 * The site config (all the old `settings` keys) will live on this record as a
 * group/JSON in Phase 1; kept minimal here for the Phase 0 boot.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'domain'],
  },
  access: {
    // Only owners can create/delete tenants; clients read their own (enforced
    // by the multi-tenant plugin). Tightened in Phase 3/4.
    create: ({ req }) => Boolean(req.user?.isOwner),
    delete: ({ req }) => Boolean(req.user?.isOwner),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Username (URL slug)',
      admin: {
        description: 'Public portfolio lives at /<slug>. Must not be a reserved path.',
      },
    },
    {
      name: 'domain',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Optional custom domain that resolves to this portfolio.',
      },
    },
    {
      name: 'storageLimitMb',
      type: 'number',
      defaultValue: 500,
      label: 'Storage limit (MB)',
    },
    {
      name: 'storageUsedMb',
      type: 'number',
      defaultValue: 0,
      label: 'Storage used (MB)',
      admin: { readOnly: true },
    },
    {
      name: 'suspended',
      type: 'checkbox',
      defaultValue: false,
      label: 'Suspended',
      admin: { description: 'When on: the client cannot log in and their public site is hidden.' },
    },
  ],
}
