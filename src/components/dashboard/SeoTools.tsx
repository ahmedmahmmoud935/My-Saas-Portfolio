'use client'

import React, { useState } from 'react'
import { useDashLang } from './DashLang'
import { saveSeoTools } from '@/lib/seo-tools-actions'

/**
 * Connecting Google's own tools.
 *
 * Neither value changes anything about how the site looks, and neither can be
 * generated here — they are pasted from Google. The panel starts closed so it
 * does not sit above the findings on every visit.
 */
export default function SeoTools({
  searchConsole,
  analyticsId,
}: {
  searchConsole: string
  analyticsId: string
}) {
  const { t } = useDashLang()
  const [open, setOpen] = useState(!searchConsole && !analyticsId)
  const [sc, setSc] = useState(searchConsole)
  const [ga, setGa] = useState(analyticsId)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gaLooksWrong = ga.trim() !== '' && !/^G-[A-Z0-9]{4,20}$/i.test(ga.trim())

  async function save() {
    setBusy(true)
    setError(null)
    try {
      await saveSeoTools({ searchConsole: sc, analyticsId: ga })
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel">
      <button type="button" className="tools-head" onClick={() => setOpen((v) => !v)}>
        <span>{t('ربط أدوات جوجل', 'Connect Google’s tools')}</span>
        <span className="tools-state">
          {searchConsole || analyticsId
            ? t('مربوط', 'connected')
            : t('مش مربوط', 'not connected')}
          <span className="tools-chev">{open ? '−' : '+'}</span>
        </span>
      </button>

      {open && (
        <div className="tools-body">
          <label className="lbl">{t('كود التحقق من Search Console', 'Search Console verification token')}</label>
          <input
            className="field"
            dir="ltr"
            value={sc}
            placeholder="abc123..."
            onChange={(e) => setSc(e.target.value)}
            style={{ textAlign: 'start' }}
          />
          <p className="lbl" style={{ opacity: 0.7, marginTop: 4 }}>
            {t(
              'من Search Console → اختار طريقة «HTML tag»، وانسخ قيمة content بس.',
              'In Search Console, pick the “HTML tag” method and copy only the content value.',
            )}
          </p>

          <label className="lbl" style={{ marginTop: 14, display: 'block' }}>
            {t('معرّف Google Analytics', 'Google Analytics measurement id')}
          </label>
          <input
            className="field"
            dir="ltr"
            value={ga}
            placeholder="G-XXXXXXXXXX"
            onChange={(e) => setGa(e.target.value)}
            style={{ textAlign: 'start' }}
          />
          {gaLooksWrong && (
            <p className="lbl" style={{ color: '#f59e0b', marginTop: 4 }}>
              {t(
                'الشكل ده مش معرّف GA4 — المفروض يبدأ بـ G- (وساعتها مش هيتحمّل).',
                'That is not a GA4 id — it should start with G- (and will not load as it is).',
              )}
            </p>
          )}

          <p className="lbl" style={{ opacity: 0.7, marginTop: 10 }}>
            {t(
              'من غير معرّف مفيش أي سكربت تتبّع بينزل على الموقع وملهوش كوكيز.',
              'With no id, no tracking script is served and no cookie is set.',
            )}
          </p>

          {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}

          <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={save} disabled={busy}>
              {busy ? '…' : t('💾 حفظ', '💾 Save')}
            </button>
            {saved && <span style={{ color: '#22c55e', fontSize: 13 }}>{t('تم ✓', 'Saved ✓')}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
