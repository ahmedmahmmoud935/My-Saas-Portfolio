'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useDashLang } from './DashLang'

/**
 * The newest unread message from the platform, across the top of the page.
 * A count in the menu is easy to miss; one line where the client is looking is
 * not. It steps aside on the messages page itself, where it would only repeat.
 */
export default function MessageNotice({
  latest,
  unread,
}: {
  latest: { title: string; tone: 'info' | 'success' | 'warning' } | null
  unread: number
}) {
  const { t } = useDashLang()
  const path = usePathname()
  if (!latest || unread === 0 || path?.startsWith('/dashboard/inbox')) return null
  return (
    <a className={`msg-notice tone-${latest.tone}`} href="/dashboard/inbox">
      <span className="msg-notice-ic">🔔</span>
      <span className="msg-notice-text">
        <b>{unread > 1 ? t(`${unread} رسائل جديدة من الإدارة`, `${unread} new messages from the team`) : t('رسالة جديدة من الإدارة', 'A new message from the team')}</b>
        <span>{latest.title}</span>
      </span>
      <span className="msg-notice-go">{t('اقرأ', 'Read')} ←</span>
    </a>
  )
}
