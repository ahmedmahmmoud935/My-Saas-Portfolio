'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useDashLang } from './DashLang'

export default function BehanceImportModal({ onClose }: { onClose: () => void }) {
  const { t } = useDashLang()
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    const o = window.location.origin
    setOrigin(o)
    // Set the javascript: bookmarklet href via the DOM (React strips it from JSX).
    const code = `javascript:(function(){var s=document.createElement('script');s.src='${o}/bookmarklet.js?t='+Date.now();document.body.appendChild(s);})()`
    linkRef.current?.setAttribute('href', code)
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-head">
          <button className="icon-btn" onClick={onClose}>✕</button>
          <strong>{t('استيراد من Behance', 'Import from Behance')}</strong>
        </div>
        <div className="modal-body">
          <p className="lbl" style={{ marginBottom: 16, lineHeight: 1.9 }}>
            {t(
              'Behance بيمنع السحب من السيرفر، فبنستخدم زر صغير بيشتغل جوّه متصفحك على صفحة المشروع.',
              'Behance blocks server-side scraping, so a small button runs inside your browser on the project page.',
            )}
          </p>

          <div className="bh-step">
            <span className="bh-num">1</span>
            <div>
              <div className="bh-step-t">{t('اسحب الزر ده لشريط المفضّلة (Bookmarks Bar):', 'Drag this to your bookmarks bar:')}</div>
              <a ref={linkRef} className="bh-bookmarklet" href="#" onClick={(e) => e.preventDefault()} draggable>
                🔖 {t('استيراد من Behance', 'Import from Behance')}
              </a>
              <div className="bh-hint">{t('لو شريط المفضّلة مخفي: View ▸ Show Favorites Bar (أو ⇧⌘B).', 'Bookmarks bar hidden? View ▸ Show Favorites Bar (or ⇧⌘B).')}</div>
            </div>
          </div>

          <div className="bh-step">
            <span className="bh-num">2</span>
            <div>
              <div className="bh-step-t">{t('افتح صفحة مشروع على Behance', 'Open a Behance project page')}</div>
              <div className="bh-hint">{t('صفحة المشروع نفسه — مش صفحة البروفايل.', 'The project page itself — not the profile page.')}</div>
            </div>
          </div>

          <div className="bh-step">
            <span className="bh-num">3</span>
            <div>
              <div className="bh-step-t">{t('اضغط الزر من المفضّلة واستنى', 'Click the bookmark and wait')}</div>
              <div className="bh-hint">{t('هيمرّر الصفحة ويحمّل الصور ويرجّعك هنا بالمشروع كمسودّة تراجعها.', 'It scrolls, grabs the images, and returns you here with the project as a draft to review.')}</div>
            </div>
          </div>

          {origin && (
            <div className="bh-hint" style={{ marginTop: 12, opacity: 0.7 }}>
              {t('المصدر:', 'Source:')} <span dir="ltr">{origin}/bookmarklet.js</span>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-primary" onClick={onClose} style={{ marginInlineStart: 'auto' }}>{t('تمام', 'Got it')}</button>
        </div>
      </div>
    </div>
  )
}
