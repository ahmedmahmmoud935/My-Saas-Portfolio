'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveHighlights, type Highlight } from '@/lib/highlights-actions'
import { isVideoSrc } from '@/lib/media-kind'
import { useDashLang } from './DashLang'
import NavIcon from './icons'

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
              {h.items.map((it, k) => {
                const isVideo = it.mediaUrl ? isVideoSrc(it.mediaUrl, null) || it.type === 'video' : false
                return (
                  <div className="gallery-thumb" key={k}>
                    {it.mediaUrl &&
                      (isVideo ? (
                        // `#t=0.1` asks for a frame a moment in, so the tile
                        // shows the clip instead of the black rectangle a
                        // poster-less video paints. Metadata only — never pull
                        // a whole clip down for a thumbnail.
                        <video src={`${it.mediaUrl}#t=0.1`} muted playsInline preload="metadata" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.mediaUrl} alt="" />
                      ))}
                    {isVideo && (
                      <span className="thumb-kind" title={t('فيديو', 'Video')}>
                        <NavIcon id="video" size={13} />
                      </span>
                    )}
                    <button className="icon-btn del thumb-del" onClick={() => patch(i, { items: h.items.filter((_, z) => z !== k) })}>✕</button>
                  </div>
                )
              })}
              <MediaUploader
                plus
                multiple
                label={t('إضافة صور', 'Add images')}
                accept="image/*,video/*"
                onUploadedMany={(ms) =>
                  patch(i, {
                    items: [
                      ...h.items,
                      // Record what was actually uploaded — a video saved as
                      // "image" ends up inside an <img> and hangs the browser.
                      ...ms.map((m) => ({
                        type: isVideoSrc(m.url ?? m.thumbUrl, m.mimeType) ? 'video' : 'image',
                        mediaId: m.id,
                        mediaUrl: m.thumbUrl,
                      })),
                    ],
                  })
                }
              />
            </div>
          </div>
        ))
      )}

      {toast && <div className="toast">{t('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
