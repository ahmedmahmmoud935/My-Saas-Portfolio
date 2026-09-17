'use server'

import { getDashboardContext } from './dashboard'
import { FEEDBACK_LIMITS, attachmentType, isAllowedAttachment } from './feedback-rules'

const SITE = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.viralpx.com').replace(/\/$/, '')

async function ownerCtx() {
  const ctx = await getDashboardContext()
  if (!ctx || !ctx.user.isOwner) throw new Error('forbidden')
  return ctx
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/**
 * A client's suggestion, with whatever they attached to explain it.
 *
 * Files are checked here as well as in the browser — type, size and count —
 * and stored under a random name. The owner hears about it by email, since a
 * suggestion nobody opens is worse than no box at all.
 */
export async function sendFeedback(
  form: FormData,
): Promise<{ ok: true; id: number } | { ok: false; code: string; file?: string }> {
  const ctx = await getDashboardContext()
  if (!ctx) return { ok: false, code: 'unauthorized' }

  // Refusals are returned, not thrown: production hides a thrown message.
  const kind = String(form.get('kind') || 'idea')
  const subject = String(form.get('subject') || '').trim().slice(0, 160)
  const body = String(form.get('body') || '').trim().slice(0, 5000)
  if (!subject || !body) return { ok: false, code: 'empty' }
  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length > FEEDBACK_LIMITS.maxFiles) return { ok: false, code: 'too-many' }
  for (const f of files) {
    if (f.size > FEEDBACK_LIMITS.maxBytes) return { ok: false, code: 'too-big', file: f.name }
    if (!isAllowedAttachment(f.type, f.name)) return { ok: false, code: 'type', file: f.name }
  }

  /* All the files or none: one that is refused (a PDF that is not really
     one) takes the ones already stored with it, rather than leaving them
     behind with no suggestion to belong to. */
  const ids: number[] = []
  const undo = async () => {
    for (const id of ids) await ctx.payload.delete({ collection: 'attachments', id }).catch(() => {})
  }
  for (const f of files) {
    const ext = (f.name.match(/\.[a-z0-9]{1,6}$/i)?.[0] || '').toLowerCase()
    const stored = `${crypto.randomUUID()}${ext}`
    try {
      const doc = await ctx.payload.create({
        collection: 'attachments',
        data: { tenant: ctx.tenantId, original: f.name.slice(0, 200) },
        file: {
          data: Buffer.from(await f.arrayBuffer()) as Buffer<ArrayBuffer>,
          mimetype: attachmentType(f.type, f.name),
          name: stored,
          size: f.size,
        },
      })
      ids.push(doc.id)
    } catch {
      await undo()
      return { ok: false, code: 'bad-file', file: f.name }
    }
  }

  const created = await ctx.payload
    .create({
      collection: 'feedback',
      data: {
        tenant: ctx.tenantId,
        author: ctx.user.id,
        kind: (['idea', 'problem', 'question'].includes(kind) ? kind : 'idea') as 'idea',
        subject,
        body,
        attachments: ids,
        status: 'new',
      },
    })
    .catch(async () => {
      await undo()
      return null
    })
  if (!created) return { ok: false, code: 'failed' }

  // Tell the owners. A failed email must not lose the suggestion.
  try {
    const tenant = await ctx.payload.findByID({ collection: 'tenants', id: ctx.tenantId, depth: 0 })
    const owners = await ctx.payload.find({ collection: 'users', where: { isOwner: { equals: true } }, limit: 10, depth: 0 })
    const to = owners.docs.map((u) => u.email).filter(Boolean)
    const label = kind === 'problem' ? 'مشكلة' : kind === 'question' ? 'سؤال' : 'اقتراح'
    if (to.length) {
      await ctx.payload.sendEmail({
        to,
        subject: `${label} جديد من ${tenant.name}: ${subject}`,
        html: `
  <div dir="rtl" style="font-family:-apple-system,'Segoe UI',Tahoma,sans-serif;background:#0a0a0a;padding:28px 16px;">
    <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid #1e1e1e;border-radius:16px;padding:28px;color:#fff;">
      <div style="color:#f97316;font-weight:700;font-size:13px;margin-bottom:8px;">${label} · ${esc(tenant.name)} (/${esc(tenant.slug)})</div>
      <div style="font-size:19px;font-weight:800;margin-bottom:14px;">${esc(subject)}</div>
      <div style="color:#bbb;font-size:14px;line-height:1.8;white-space:pre-wrap;">${esc(body.slice(0, 1200))}</div>
      ${files.length ? `<div style="color:#8a8a8a;font-size:13px;margin-top:14px;">📎 ${files.length} ملف مرفق</div>` : ''}
      <a href="${SITE}/owner/feedback?open=${created.id}" style="display:inline-block;margin-top:22px;background:#f97316;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:700;">افتحه في لوحة الإدارة</a>
    </div>
  </div>`,
      })
    }
  } catch (e) {
    console.error('[feedback] owner email failed:', e)
  }

  return { ok: true, id: created.id }
}

/**
 * The owner's word on a suggestion. A new or changed reply is also sent to the
 * client's inbox, so the answer reaches them where they will look.
 */
export async function updateFeedback(id: number, patch: { status?: 'new' | 'seen' | 'planned' | 'done'; reply?: string }) {
  const ctx = await ownerCtx()
  const before = await ctx.payload.findByID({ collection: 'feedback', id, depth: 0 })
  const reply = patch.reply?.trim()
  const replyChanged = reply !== undefined && reply !== (before.reply ?? '').trim()
  await ctx.payload.update({
    collection: 'feedback',
    id,
    data: {
      ...(patch.status ? { status: patch.status } : {}),
      ...(replyChanged ? { reply, repliedAt: reply ? new Date().toISOString() : null } : {}),
    },
  })
  const tenantId = typeof before.tenant === 'object' ? before.tenant?.id : before.tenant
  if (replyChanged && reply && tenantId) {
    await ctx.payload.create({
      collection: 'notices',
      data: {
        title: `رد على «${before.subject}»`,
        body: reply,
        tone: 'info',
        audience: 'one',
        tenant: tenantId,
        link: '/dashboard/feedback',
        readBy: [],
      },
    })
  }
  return { ok: true }
}

export async function deleteFeedback(id: number) {
  const ctx = await ownerCtx()
  const doc = await ctx.payload.findByID({ collection: 'feedback', id, depth: 0 })
  const files = (doc.attachments ?? []).map((a) => (typeof a === 'object' ? a?.id : a)).filter(Boolean) as number[]
  await ctx.payload.delete({ collection: 'feedback', id })
  for (const f of files) {
    try {
      await ctx.payload.delete({ collection: 'attachments', id: f })
    } catch {
      /* already gone */
    }
  }
  return { ok: true }
}
