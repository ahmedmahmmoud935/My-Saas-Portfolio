import type { Payload, Where } from 'payload'
import type { FeedbackRow } from '@/components/dashboard/FeedbackClient'

type AttachmentDoc = { id: number; url?: string | null; original?: string | null; filename?: string | null; mimeType?: string | null }

/** Suggestions, with their files, in the shape both dashboards show. */
export async function readFeedback(payload: Payload, where?: Where) {
  const res = await payload.find({ collection: 'feedback', where, sort: '-createdAt', limit: 300, depth: 1 })
  return res.docs.map((d) => {
    const tenant = typeof d.tenant === 'object' && d.tenant ? d.tenant : null
    const author = typeof d.author === 'object' && d.author ? d.author : null
    const row: FeedbackRow & { client: { id: number; name: string; slug: string } | null; author: string | null } = {
      id: d.id,
      kind: (d.kind ?? 'idea') as FeedbackRow['kind'],
      subject: d.subject,
      body: d.body,
      status: (d.status ?? 'new') as FeedbackRow['status'],
      reply: d.reply ?? null,
      repliedAt: d.repliedAt ?? null,
      createdAt: d.createdAt,
      files: ((d.attachments ?? []) as unknown[])
        .filter((a): a is AttachmentDoc => !!a && typeof a === 'object')
        .map((a) => ({
          id: a.id,
          url: a.url ?? null,
          name: a.original || a.filename || 'file',
          isImage: (a.mimeType ?? '').startsWith('image/'),
        })),
      client: tenant ? { id: tenant.id, name: tenant.name, slug: tenant.slug } : null,
      author: author ? author.name || author.email : null,
    }
    return row
  })
}
