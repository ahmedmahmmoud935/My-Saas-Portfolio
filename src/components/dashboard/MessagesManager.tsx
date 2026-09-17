'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import { useDashLang } from './DashLang'
import { sendNotice, deleteNotice } from '@/lib/notices-actions'

export type SentNotice = {
  id: number
  title: string
  body: string
  tone: 'info' | 'success' | 'warning'
  audience: 'all' | 'one'
  client: string | null
  link: string | null
  createdAt: string
  readCount: number
  /** How many portfolios it was meant for. */
  reach: number
}

const TONES = [
  { id: 'info', ar: 'معلومة', en: 'Info' },
  { id: 'success', ar: 'خبر حلو', en: 'Good news' },
  { id: 'warning', ar: 'محتاج انتباه', en: 'Needs attention' },
] as const

/**
 * Messages to clients: one of them, or everyone. Each sent message shows how
 * many of the people it was for have opened it — a note to forty clients that
 * three have read is a note that did not land.
 */
export default function MessagesManager({
  sent,
  clients,
}: {
  sent: SentNotice[]
  clients: { id: number; name: string; slug: string }[]
}) {
  const { t, lang } = useDashLang()
  const router = useRouter()
  const blank = { title: '', body: '', tone: 'info' as SentNotice['tone'], audience: 'all' as SentNotice['audience'], tenantId: 0, link: '' }
  const [d, setD] = useState(blank)
  const [busy, setBusy] = useState(false)

  async function send() {
    if (!d.title.trim() || !d.body.trim()) return alert(t('اكتب عنوان ونص الرسالة.', 'Add a title and a message.'))
    if (d.audience === 'one' && !d.tenantId) return alert(t('اختار العميل.', 'Choose the client.'))
    const who = d.audience === 'all' ? t(`كل العملاء (${clients.length})`, `every client (${clients.length})`) : clients.find((c) => c.id === d.tenantId)?.name
    if (!confirm(t(`تبعت «${d.title}» لـ ${who}؟`, `Send “${d.title}” to ${who}?`))) return
    setBusy(true)
    const res = await sendNotice({ ...d, tenantId: d.audience === 'one' ? d.tenantId : null }).catch(() => null)
    setBusy(false)
    if (res?.ok) {
      setD(blank)
      router.refresh()
    } else {
      alert(t('ماتبعتتش — جرّب تاني.', 'It did not send — try again.'))
    }
  }

  async function remove(n: SentNotice) {
    if (!confirm(t(`حذف «${n.title}»؟ هتختفي من عند العملاء كمان.`, `Delete “${n.title}”? It disappears for the clients too.`))) return
    await deleteNotice(n.id)
    router.refresh()
  }

  const when = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'en' ? 'en-GB' : 'ar-EG', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div>
      <PageHeader
        icon="🔔"
        title={t('الرسائل', 'Messages')}
        subtitle={t('ابعت خبر أو تنبيه لعميل واحد أو لكل العملاء — بيظهر في لوحتهم.', 'Send news or a note to one client or all of them — it appears in their dashboard.')}
      />

      <div className="fb-grid">
        <section className="panel fb-form">
          <div className="opt-field">
            <div className="opt-field-label">{t('لمين؟', 'To whom?')}</div>
            <div className="opt-opts">
              <button className={`pill ${d.audience === 'all' ? 'active' : ''}`} onClick={() => setD({ ...d, audience: 'all' })}>
                {t(`كل العملاء (${clients.length})`, `Every client (${clients.length})`)}
              </button>
              <button className={`pill ${d.audience === 'one' ? 'active' : ''}`} onClick={() => setD({ ...d, audience: 'one' })}>
                {t('عميل واحد', 'One client')}
              </button>
            </div>
          </div>
          {d.audience === 'one' && (
            <select className="field" value={d.tenantId} onChange={(e) => setD({ ...d, tenantId: Number(e.target.value) })}>
              <option value={0}>{t('— اختار العميل —', '— choose a client —')}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (/{c.slug})
                </option>
              ))}
            </select>
          )}

          <div className="opt-field" style={{ marginTop: 12 }}>
            <div className="opt-field-label">{t('نوعها', 'Kind')}</div>
            <div className="opt-opts">
              {TONES.map((x) => (
                <button key={x.id} className={`pill tone-pill tone-${x.id} ${d.tone === x.id ? 'active' : ''}`} onClick={() => setD({ ...d, tone: x.id })}>
                  {t(x.ar, x.en)}
                </button>
              ))}
            </div>
          </div>

          <label className="lbl">{t('العنوان', 'Title')}</label>
          <input className="field" maxLength={120} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} />
          <label className="lbl">{t('الرسالة', 'Message')}</label>
          <textarea className="field" rows={6} value={d.body} onChange={(e) => setD({ ...d, body: e.target.value })} />
          <label className="lbl">{t('لينك (اختياري)', 'A link (optional)')}</label>
          <input
            className="field"
            dir="ltr"
            style={{ textAlign: 'start' }}
            placeholder="/dashboard/articles  ·  https://…"
            value={d.link}
            onChange={(e) => setD({ ...d, link: e.target.value })}
          />
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={send} disabled={busy}>
            {busy ? '…' : t('ابعت', 'Send')}
          </button>
        </section>

        <section className="fb-history">
          <h3>{t('اللي اتبعت', 'Sent')}</h3>
          {sent.length === 0 ? (
            <p className="fb-empty">{t('لسه مبعتّش رسائل.', 'Nothing sent yet.')}</p>
          ) : (
            sent.map((n) => (
              <article key={n.id} className={`fb-card tone-${n.tone}`}>
                <header>
                  <span className="fb-status">{n.audience === 'all' ? t('للكل', 'Everyone') : n.client}</span>
                  <strong>{n.title}</strong>
                  <small>{when(n.createdAt)}</small>
                </header>
                <p>{n.body}</p>
                <footer className="msg-foot">
                  <span className="msg-read">
                    <i style={{ width: `${n.reach ? Math.round((n.readCount / n.reach) * 100) : 0}%` }} />
                  </span>
                  <small>{t(`قرأها ${n.readCount} من ${n.reach}`, `Read by ${n.readCount} of ${n.reach}`)}</small>
                  <button className="lx-icon danger" onClick={() => remove(n)} title={t('حذف', 'Delete')}>
                    🗑
                  </button>
                </footer>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  )
}
