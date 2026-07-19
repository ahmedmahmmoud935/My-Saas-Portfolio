'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useDashLang } from './DashLang'
import { importBehanceUrl } from '@/lib/project-actions'

export default function BehanceImportModal({ onClose }: { onClose: () => void }) {
  const { t } = useDashLang()
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

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
      /* clipboard blocked — user can select the textarea manually */
    }
  }

  async function runUrlImport() {
    setErr('')
    if (!/behance\.net\/gallery\//i.test(url)) {
      setErr(t('حط رابط مشروع Behance صحيح (behance.net/gallery/...).', 'Enter a valid Behance project URL (behance.net/gallery/...).'))
      return
    }
    setBusy(true)
    try {
      const r = await importBehanceUrl(url)
      if (r.ok && r.id) {
        window.location.assign(`/dashboard/projects/${r.id}/editor`)
        return
      }
      const map: Record<string, string> = {
        blocked: t('Behance منع الطلب من السيرفر — استخدم البوكماركلت بالأسفل.', 'Behance blocked the server request — use the bookmarklet below.'),
        empty: t('مالقيتش صور في اللينك ده — استخدم البوكماركلت.', 'No images found at this link — use the bookmarklet.'),
        'bad-url': t('الرابط مش صحيح.', 'Invalid URL.'),
      }
      setErr(map[(r as { error?: string }).error || ''] || t('فشل الاستيراد.', 'Import failed.'))
    } catch {
      setErr(t('حصل خطأ.', 'Something went wrong.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-head">
          <button className="icon-btn" onClick={onClose}>✕</button>
          <strong>{t('استيراد من Behance', 'Import from Behance')}</strong>
        </div>
        <div className="modal-body">
          {/* ── Method 1: by URL ── */}
          <div className="bh-sec-title">🔗 {t('بالرابط (سريع)', 'By URL (quick)')}</div>
          <p className="bh-hint" style={{ marginBottom: 8 }}>
            {t('الصق رابط صفحة المشروع. أفضل حاجة للمشاريع البسيطة — ممكن يفوّت صور الشبكة أو الفيديوهات.', 'Paste the project page URL. Best for simple projects — may miss some grid images or videos.')}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="field" dir="ltr" style={{ textAlign: 'start', flex: 1 }} placeholder="https://www.behance.net/gallery/..." value={url} onChange={(e) => setUrl(e.target.value)} />
            <button className="btn btn-primary" onClick={runUrlImport} disabled={busy}>{busy ? '…' : t('استيراد', 'Import')}</button>
          </div>
          {err && <div className="login-err" style={{ textAlign: 'start', marginTop: 8 }}>{err}</div>}

          <div className="bh-divider"><span>{t('أو — الأشمل', 'or — most complete')}</span></div>

          {/* ── Method 2: bookmarklet ── */}
          <div className="bh-sec-title">🔖 {t('بالبوكماركلت (بيجيب كل حاجة)', 'By bookmarklet (grabs everything)')}</div>
          <p className="bh-hint" style={{ marginBottom: 10 }}>
            {t('بيشتغل جوّه متصفحك على صفحة المشروع، فبيجيب صور الشبكة والفيديوهات كمان.', 'Runs in your browser on the project page, so it grabs grid images and videos too.')}
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
              <div className="bh-step-t">{t('اضغط الزر واستنى — هيرجّعك هنا بالمشروع كمسودّة.', 'Click it and wait — you return here with the project as a draft.')}</div>
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
