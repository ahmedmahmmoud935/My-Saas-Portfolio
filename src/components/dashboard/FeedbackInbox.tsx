'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import { useDashLang } from './DashLang'
import { updateFeedback, deleteFeedback } from '@/lib/feedback-actions'
import { STATUS_LABEL, type FeedbackRow } from './FeedbackClient'

export type InboxRow = FeedbackRow & { client: { id: number; name: string; slug: string } | null; author: string | null }

const KIND_LABEL: Record<FeedbackRow['kind'], { ar: string; en: string; mark: string }> = {
  idea: { ar: 'اقتراح', en: 'Idea', mark: '💡' },
  problem: { ar: 'مشكلة', en: 'Problem', mark: '🐞' },
  question: { ar: 'سؤال', en: 'Question', mark: '❓' },
}

/**
 * Everything clients have sent, as a list beside the one being read — the
 * same shape as the content editor. Opening a new one marks it seen; the
 * status and the reply are what the client sees back, and a reply also lands
 * in their messages.
 */
export default function FeedbackInbox({ items, openId }: { items: InboxRow[]; openId?: number }) {
  const { t, lang } = useDashLang()
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | FeedbackRow['status']>('all')
  const [open, setOpen] = useState<number | null>(openId ?? items[0]?.id ?? null)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)

  const shown = filter === 'all' ? items : items.filter((r) => r.status === filter)
  const cur = items.find((r) => r.id === open) ?? null

  // What was written before, for the one now open.
  useEffect(() => {
    setReply(cur?.reply ?? '')
  }, [cur?.id, cur?.reply])

  // Opening a new one is seeing it.
  useEffect(() => {
    if (cur && cur.status === 'new') updateFeedback(cur.id, { status: 'seen' }).then(() => router.refresh())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur?.id])

  const count = (s: FeedbackRow['status']) => items.filter((r) => r.status === s).length
  const when = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'en' ? 'en-GB' : 'ar-EG', { dateStyle: 'medium', timeStyle: 'short' })

  async function setStatus(s: FeedbackRow['status']) {
    if (!cur) return
    setBusy(true)
    await updateFeedback(cur.id, { status: s })
    setBusy(false)
    router.refresh()
  }
  async function sendReply() {
    if (!cur) return
    setBusy(true)
    await updateFeedback(cur.id, { reply })
    setBusy(false)
    router.refresh()
  }
  async function remove() {
    if (!cur || !confirm(t('حذف الاقتراح ده وملفاته؟', 'Delete this suggestion and its files?'))) return
    await deleteFeedback(cur.id)
    setOpen(null)
    router.refresh()
  }

  return (
    <div>
      <PageHeader
        icon="💬"
        title={t('المقترحات', 'Suggestions')}
        subtitle={t('اللي العملاء بعتوه — أفكار ومشاكل وأسئلة، بالصور والملفات.', 'What clients have sent — ideas, problems and questions, with their files.')}
      />

      <div className="audit-tabs" style={{ marginBottom: 14 }}>
        <button className={`pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          {t('الكل', 'All')} ({items.length})
        </button>
        {(['new', 'seen', 'planned', 'done'] as const).map((s) => (
          <button key={s} className={`pill ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'new' ? t('جديد', 'New') : t(STATUS_LABEL[s].ar, STATUS_LABEL[s].en)} ({count(s)})
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 46, color: 'var(--sub)' }}>
          {t('لسه مفيش مقترحات من العملاء.', 'No suggestions from clients yet.')}
        </div>
      ) : (
        <div className="lx">
          <aside className="lx-outline fbi-list">
            {shown.map((r) => (
              <button key={r.id} className={`lx-row${r.id === open ? ' on' : ''}`} onClick={() => setOpen(r.id)}>
                <span className="lx-mark">{KIND_LABEL[r.kind].mark}</span>
                <span className="lx-label">
                  {r.subject}
                  <small className="fbi-sub">
                    {r.client?.name ?? '—'} · {new Date(r.createdAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-EG')}
                  </small>
                </span>
                {r.status === 'new' && <span className="fbi-dot" />}
              </button>
            ))}
            {shown.length === 0 && <p className="fb-empty" style={{ padding: 10 }}>{t('مفيش حاجة هنا.', 'Nothing here.')}</p>}
          </aside>

          <section className="lx-editor">
            {cur ? (
              <>
                <header className="lx-head">
                  <div className="lx-head-title">
                    <span>
                      {KIND_LABEL[cur.kind].mark} {t(KIND_LABEL[cur.kind].ar, KIND_LABEL[cur.kind].en)} · {cur.client ? `${cur.client.name} (/${cur.client.slug})` : '—'}
                      {cur.author ? ` · ${cur.author}` : ''}
                    </span>
                    <strong>{cur.subject}</strong>
                  </div>
                  <div className="lx-head-actions">
                    <button className="lx-icon danger" onClick={remove} title={t('حذف', 'Delete')}>
                      🗑
                    </button>
                  </div>
                </header>
                <div className="panel lx-body">
                  <div className="fbi-when">{when(cur.createdAt)}</div>
                  <p className="fbi-body">{cur.body}</p>

                  {cur.files.length > 0 && (
                    <div className="fb-attached big">
                      {cur.files.map((f) =>
                        f.isImage && f.url ? (
                          <a key={f.id} href={f.url} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={f.url} alt={f.name} />
                          </a>
                        ) : (
                          <a key={f.id} className="fb-chip" href={f.url ?? '#'} target="_blank" rel="noreferrer">
                            📄 {f.name}
                          </a>
                        ),
                      )}
                    </div>
                  )}

                  <div className="lx-sep" />
                  <div className="opt-field">
                    <div className="opt-field-label">{t('الحالة (بتظهر للعميل)', 'Status (the client sees it)')}</div>
                    <div className="opt-opts">
                      {(['seen', 'planned', 'done'] as const).map((s) => (
                        <button key={s} className={`pill ${cur.status === s ? 'active' : ''}`} disabled={busy} onClick={() => setStatus(s)}>
                          {t(STATUS_LABEL[s].ar, STATUS_LABEL[s].en)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="lbl">{t('الرد', 'Reply')}</label>
                  <textarea
                    className="field"
                    rows={5}
                    value={reply}
                    placeholder={t('الرد بيظهر للعميل تحت اقتراحه، وبيوصله كرسالة.', 'The reply shows under their suggestion and reaches them as a message.')}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 12 }}
                    disabled={busy || reply.trim() === (cur.reply ?? '').trim()}
                    onClick={sendReply}
                  >
                    {cur.reply ? t('تحديث الرد', 'Update the reply') : t('ابعت الرد', 'Send the reply')}
                  </button>
                  {cur.repliedAt && (
                    <small className="fbi-when" style={{ display: 'block', marginTop: 8 }}>
                      {t('آخر رد:', 'Last replied:')} {when(cur.repliedAt)}
                    </small>
                  )}
                </div>
              </>
            ) : (
              <div className="panel" style={{ color: 'var(--sub)' }}>{t('اختار اقتراح من القائمة.', 'Pick one from the list.')}</div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
