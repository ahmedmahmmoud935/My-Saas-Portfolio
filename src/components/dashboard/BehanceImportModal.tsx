'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useDashLang } from './DashLang'

export default function BehanceImportModal({ onClose }: { onClose: () => void }) {
  const { t } = useDashLang()
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const o = window.location.origin
    const c = `javascript:(function(){var s=document.createElement('script');s.src='${o}/bookmarklet.js?t='+Date.now();document.body.appendChild(s);})()`
    setCode(c)
    linkRef.current?.setAttribute('href', c)
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked — the user can select the textarea manually */
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-head">
          <button className="icon-btn" onClick={onClose}>✕</button>
          <strong>{t('استيراد من Behance', 'Import from Behance')}</strong>
        </div>
        <div className="modal-body">
          <p className="bh-hint" style={{ marginBottom: 16, lineHeight: 1.9 }}>
            {t(
              'Behance بيمنع السحب من السيرفر، فبنستخدم زر صغير بيشتغل جوّه متصفحك على صفحة المشروع — بيجيب كل الصور (حتى الشبكة) والفيديوهات.',
              'Behance blocks server-side scraping, so a small button runs inside your browser on the project page — it grabs every image (grids too) and videos.',
            )}
          </p>

          <div className="bh-step">
            <span className="bh-num">1</span>
            <div style={{ flex: 1 }}>
              <div className="bh-step-t">{t('اسحب الزر لشريط المفضّلة — أو انسخ الكود واعمله Bookmark يدوي:', 'Drag to the bookmarks bar — or copy the code and add it as a bookmark:')}</div>
              <a ref={linkRef} className="bh-bookmarklet" href="#" onClick={(e) => e.preventDefault()} draggable>
                🔖 {t('استيراد من Behance', 'Import from Behance')}
              </a>
              <textarea className="field bh-code" readOnly dir="ltr" rows={3} value={code} onFocus={(e) => e.currentTarget.select()} />
              <button className="btn btn-ghost" style={{ marginTop: 6 }} onClick={copy}>{copied ? t('تم النسخ ✓', 'Copied ✓') : t('📋 نسخ الكود', '📋 Copy code')}</button>
              <div className="bh-hint" style={{ marginTop: 6 }}>{t('لو شريط المفضّلة مخفي: View ▸ Show Favorites Bar (⇧⌘B).', 'Bookmarks bar hidden? View ▸ Show Favorites Bar (⇧⌘B).')}</div>
            </div>
          </div>

          <div className="bh-step">
            <span className="bh-num">2</span>
            <div>
              <div className="bh-step-t">{t('افتح صفحة مشروع على Behance', 'Open a Behance project page')}</div>
              <div className="bh-hint">{t('صفحة المشروع نفسه — مش البروفايل.', 'The project page — not the profile.')}</div>
            </div>
          </div>

          <div className="bh-step">
            <span className="bh-num">3</span>
            <div>
              <div className="bh-step-t">{t('اضغط الزر واستنى — هيرجّعك هنا بالمشروع كمسودّة تراجعها.', 'Click it and wait — you return here with the project as a draft to review.')}</div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-primary" onClick={onClose} style={{ marginInlineStart: 'auto' }}>{t('تمام', 'Got it')}</button>
        </div>
      </div>
    </div>
  )
}
