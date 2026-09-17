import type { CollectionConfig } from 'payload'

const ownerOnly = ({ req }: { req: { user?: { isOwner?: boolean | null } | null } }) => Boolean(req.user?.isOwner)

/**
 * What clients tell the platform: an idea, a problem, a question — with the
 * screenshots and files that explain it, and the owner's answer.
 *
 * Its status is the owner's word on it (seen, planned, done), shown back to the
 * client, so a suggestion does not disappear into a box. Written and read
 * through the dashboards' own actions; the REST door is the owner's.
 */
export const Feedback: CollectionConfig = {
  slug: 'feedback',
  admin: { useAsTitle: 'subject', defaultColumns: ['subject', 'kind', 'status', 'createdAt'] },
  access: { read: ownerOnly, create: ownerOnly, update: ownerOnly, delete: ownerOnly },
  fields: [
    { name: 'tenant', type: 'relationship', relationTo: 'tenants' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'idea',
      options: [
        { label: 'Idea', value: 'idea' },
        { label: 'Problem', value: 'problem' },
        { label: 'Question', value: 'question' },
      ],
    },
    { name: 'subject', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    { name: 'attachments', type: 'upload', relationTo: 'attachments', hasMany: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Seen', value: 'seen' },
        { label: 'Planned', value: 'planned' },
        { label: 'Done', value: 'done' },
      ],
    },
    { name: 'reply', type: 'textarea' },
    { name: 'repliedAt', type: 'date' },
  ],
}
