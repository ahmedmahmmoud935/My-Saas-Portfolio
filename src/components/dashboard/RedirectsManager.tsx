'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import { saveDoc, deleteDoc } from '@/lib/collection-actions'
import { useDashLang } from './DashLang'

type Item = { id: number; from: string; to: string; auto: boolean }

/**
 * Old addresses and where they now go.
 *
 * Most rows arrive on their own: rewriting the slug of a published article
 * records one, so the address that was already shared or linked keeps working.
 * The rest is for a page that moved or went away.
 */
export default function RedirectsManager({ items }: { items: Item[] }) {
  const router = useRouter()
  const { t } = useDashLang()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [busy, setBusy] = useState(false)

  const clean = (v: string) => {
    const s = v.trim()
    if (!s) return ''
    return s.startsWith('/') ? s : `/${s}`
  }

  async function add() {
    const f = clean(from)
    const d = clean(to)
    if (!f || !d || f === d) return
    setBusy(true)
    await saveDoc('redirects', undefined, { from: f, to: d, auto: false })
    setBusy(false)
    setFrom('')
    setTo('')
    router.refresh()
  }

  async function remove(id: number) {
    if (!confirm(t('حذف التحويل؟', 'Delete this redirect?'))) return
    await deleteDoc('redirects', id)
    router.refresh()
  }

  return (
    <div>
      <PageHeader
        icon="🔀"
        title={t('تحويل الروابط', 'Redirects')}
        subtitle={t(
          'الروابط القديمة وفين تروح دلوقتي — بتتسجّل لوحدها لما تغيّر رابط مقال منشور.',
          'Old addresses and where they go now — recorded for you when you rewrite a published article’s slug.',
        )}
      />

      <div className="panel">
        <div className="rd-add">
          <div>
            <label className="lbl">{t('من', 'From')}</label>
            <input className="field" dir="ltr" value={from} placeholder="/ahmed/articles/old-slug" onChange={(e) => setFrom(e.target.value)} style={{ textAlign: 'start' }} />
          </div>
          <div>
            <label className="lbl">{t('إلى', 'To')}</label>
            <input className="field" dir="ltr" value={to} placeholder="/ahmed/articles/new-slug" onChange={(e) => setTo(e.target.value)} style={{ textAlign: 'start' }} />
          </div>
          <button className="btn btn-primary" onClick={add} disabled={busy || !from.trim() || !to.trim()}>
            {busy ? '…' : t('إضافة', 'Add')}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 46, color: 'var(--sub)' }}>
          {t(
            'مفيش تحويلات — وده كويس، معناه إن مفيش رابط اتغيّر.',
            'No redirects — which is good: nothing has changed address.',
          )}
        </div>
      ) : (
        <div className="panel">
          {items.map((r) => (
            <div className="rd-row" key={r.id}>
              <div className="rd-paths" dir="ltr">
                <code>{r.from}</code>
                <span className="rd-arrow">→</span>
                <code>{r.to}</code>
              </div>
              <span className={`rd-tag ${r.auto ? 'auto' : ''}`}>
                {r.auto ? t('تلقائي', 'automatic') : t('يدوي', 'manual')}
              </span>
              <button className="icon-btn del" onClick={() => remove(r.id)} aria-label="delete">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
