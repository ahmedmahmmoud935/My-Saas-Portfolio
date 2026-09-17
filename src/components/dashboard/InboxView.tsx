'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import { useDashLang } from './DashLang'
import { markNoticesRead } from '@/lib/notices-actions'
import type { InboxNotice } from '@/lib/inbox'

/**
 * Messages from the platform, newest first.
 *
 * Opening the page counts as reading them — there is nothing else to do with a
 * notice — but the ones that were new stay marked as new for this visit, so
 * the reader can still tell which they had not seen.
 */
export default function InboxView({ items }: { items: InboxNotice[] }) {
  const { t, lang } = useDashLang()
  const router = useRouter()
  const [fresh] = useState(() => new Set(items.filter((n) => !n.read).map((n) => n.id)))

  useEffect(() => {
    if (!fresh.size) return
    markNoticesRead([...fresh]).then(() => router.refresh())
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const when = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div>
      <PageHeader
        icon="🔔"
        title={t('الرسائل', 'Messages')}
        subtitle={t('أخبار وتنبيهات من إدارة ViralPX', 'News and notes from the ViralPX team')}
      />

      {items.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 46, color: 'var(--sub)' }}>
          {t('مفيش رسائل لسه.', 'No messages yet.')}
        </div>
      ) : (
        <div className="inbox">
          {items.map((n) => (
            <article key={n.id} className={`inbox-item tone-${n.tone}${fresh.has(n.id) ? ' fresh' : ''}`}>
              <header>
                <strong>{n.title}</strong>
                <span>
                  {fresh.has(n.id) && <b className="inbox-new">{t('جديد', 'New')}</b>}
                  {when(n.createdAt)}
                </span>
              </header>
              <p>{n.body}</p>
              {n.link && (
                <a className="btn btn-ghost btn-sm" href={n.link} target={n.link.startsWith('/') ? undefined : '_blank'} rel="noreferrer">
                  {t('افتح', 'Open')} ↗
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
