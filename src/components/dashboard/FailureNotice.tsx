'use client'

import React, { useEffect, useState } from 'react'
import { useDashLang } from './DashLang'
import { saveFailureText } from '@/lib/action-error'

/**
 * The last word on a save that failed where nothing was listening.
 *
 * Most editors say why a save failed; some older ones awaited the action and
 * stopped there, so a refused or failed save left the button on "…" with no
 * word at all. Any such failure now surfaces here, in the client's language,
 * with what to do — a refresh — instead of a silence that reads as "it saved".
 */
export default function FailureNotice() {
  const { t } = useDashLang()
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    const onFail = (e: PromiseRejectionEvent) => {
      const msg = e.reason instanceof Error ? e.reason.message : String(e.reason ?? '')
      // Only failures of our own calls; a browser extension's noise is not ours.
      if (!/unauthorized|forbidden|Server Action|fetch|network|failed/i.test(msg)) return
      setText(
        /unauthorized|forbidden/i.test(msg)
          ? t('انتهت الجلسة ومااتحفظش. سجّل دخول تاني في تبويب جديد، وبعدين حدّث الصفحة.', 'Your session ended and nothing was saved. Sign in again in a new tab, then refresh.')
          : saveFailureText(e.reason, t),
      )
    }
    window.addEventListener('unhandledrejection', onFail)
    return () => window.removeEventListener('unhandledrejection', onFail)
  }, [t])

  if (!text) return null
  return (
    <div className="toast toast-error" role="alert" onClick={() => setText(null)}>
      {text}{' '}
      <button type="button" className="link-btn" onClick={() => location.reload()}>
        {t('حدّث الصفحة', 'Refresh')}
      </button>
    </div>
  )
}
