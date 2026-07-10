'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveHighlights, type Highlight } from '@/lib/highlights-actions'
import { useDashLang } from './DashLang'

export default function HighlightsEditor({ initial }: { initial: Highlight[] }) {
  const [hls, setHls] = useState<Highlight[]>(initial)
  const [busy, setBusy] = useState(false)
  const { t } = useDashLang()
  const [toast, setToast] = useState(false)

  const patch = (i: number, p: Partial<Highlight>) =>
    setHls(hls.map((h, j) => (j === i ? { ...h, ...p } : h)))
  const remove = (i: number) => setHls(hls.filter((_, j) => j !== i))
  const add = () => setHls([...hls, { title: '', coverId: null, coverUrl: null, items: [] }])

  async function save() {
    setBusy(true)
    await saveHighlights(hls)
    setBusy(false)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
  }

  return (
    <div>
      <PageHeader
        icon="⭕"
        title={t('هاي لايتس', 'Highlights')}
        subtitle={t('دوائر ستوري فوق قسم المشاريع — كل واحدة فيها صور/فيديوهات', 'Story circles above the projects section — each holds images/videos')}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={add}>+ {t('هاي لايت', 'Highlight')}</button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? '…' : t('💾 حفظ', '💾 Save')}</button>
          </div>
        }
      />

      {hls.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 46, color: 'var(--sub)' }}>{t('مفيش هاي لايتس — اضغط «+ هاي لايت».', 'No highlights — click “+ Highlight”.')}</div>
      ) : (
        hls.map((h, i) => (
          <div className="panel" key={i} style={{ marginBottom: 14 }}>
            <div className="mod-card-head">
              <button className="icon-btn del" style={{ width: 30, height: 30 }} onClick={() => remove(i)}>🗑</button>
              <span style={{ color: 'var(--sub)', fontSize: 12 }}>{t('هاي لايت', 'Highlight')} {i + 1}</span>
            </div>
            <div className="grid-2">
              <div>
                <label className="lbl">{t('العنوان', 'Title')}</label>
                <input className="field" value={h.title} onChange={(e) => patch(i, { title: e.target.value })} />
              </div>
              <div>
                <label className="lbl">{t('الغلاف (دائري)', 'Cover (circle)')}</label>
                <MediaUploader compact previewUrl={h.coverUrl} onUploaded={(m) => patch(i, { coverId: m.id, coverUrl: m.thumbUrl })} />
              </div>
            </div>
            <label className="lbl">{t('العناصر', 'Items')}</label>
            <div className="gallery-grid">
              {h.items.map((it, k) => (
                <div className="gallery-thumb" key={k}>
                  {it.mediaUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.mediaUrl} alt="" />
                  )}
                  <button className="icon-btn del thumb-del" onClick={() => patch(i, { items: h.items.filter((_, z) => z !== k) })}>✕</button>
                </div>
              ))}
              <MediaUploader
                label={t('إضافة', 'Add')}
                compact
                accept="image/*,video/*"
                onUploaded={(m) => patch(i, { items: [...h.items, { type: 'image', mediaId: m.id, mediaUrl: m.thumbUrl }] })}
              />
            </div>
          </div>
        ))
      )}

      {toast && <div className="toast">{t('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
