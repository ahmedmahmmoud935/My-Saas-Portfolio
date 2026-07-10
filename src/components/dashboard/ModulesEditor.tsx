'use client'

import React from 'react'
import MediaUploader from './MediaUploader'
import type { EditModule } from '@/lib/project-types'

export const MODULE_ADD_BUTTONS: { type: EditModule['type']; label: string }[] = [
  { type: 'image', label: '🖼️ صورة كاملة' },
  { type: 'grid', label: '▦ شبكة صور' },
  { type: 'text', label: '📝 نص / عنوان' },
  { type: 'video', label: '🎬 فيديو' },
  { type: 'beforeafter', label: '↔ قبل / بعد' },
  { type: 'separator', label: '― فاصل' },
]

export function blankModule(type: EditModule['type']): EditModule {
  switch (type) {
    case 'text':
      return { type: 'text', textType: 'p', value: '' }
    case 'image':
      return { type: 'image', srcId: null, srcUrl: null }
    case 'grid':
      return { type: 'grid', items: [] }
    case 'video':
      return { type: 'video', embedUrl: '' }
    case 'beforeafter':
      return {
        type: 'beforeafter',
        beforeId: null,
        beforeUrl: null,
        afterId: null,
        afterUrl: null,
        labelBefore: '',
        labelAfter: '',
      }
    case 'separator':
      return { type: 'separator', spacing: 'normal' }
  }
}

export default function ModulesEditor({
  modules,
  onChange,
  hideAdd = false,
}: {
  modules: EditModule[]
  onChange: (m: EditModule[]) => void
  hideAdd?: boolean
}) {
  const update = (i: number, m: EditModule) =>
    onChange(modules.map((x, j) => (j === i ? m : x)))
  const remove = (i: number) => onChange(modules.filter((_, j) => j !== i))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= modules.length) return
    const next = [...modules]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const add = (type: EditModule['type']) => onChange([...modules, blankModule(type)])

  return (
    <div className="mods">
      {!hideAdd && (
        <div className="mods-add">
          {MODULE_ADD_BUTTONS.map((b) => (
            <button key={b.type} className="btn btn-ghost mods-add-btn" onClick={() => add(b.type)}>
              {b.label}
            </button>
          ))}
        </div>
      )}

      {modules.map((m, i) => (
        <div className="mod-card" key={i}>
          <div className="mod-card-head">
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => move(i, -1)}>
                ▲
              </button>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => move(i, 1)}>
                ▼
              </button>
              <button className="icon-btn del" style={{ width: 30, height: 30 }} onClick={() => remove(i)}>
                🗑
              </button>
            </div>
            <span style={{ color: 'var(--sub)', fontSize: 12 }}>{m.type}</span>
          </div>

          {m.type === 'text' && (
            <>
              <select
                className="field"
                value={m.textType}
                onChange={(e) =>
                  update(i, { ...m, textType: e.target.value as 'h1' | 'h2' | 'p' })
                }
                style={{ marginBottom: 8 }}
              >
                <option value="h1">عنوان كبير (H1)</option>
                <option value="h2">عنوان (H2)</option>
                <option value="p">فقرة</option>
              </select>
              <textarea
                className="field"
                rows={3}
                value={m.value}
                onChange={(e) => update(i, { ...m, value: e.target.value })}
              />
            </>
          )}

          {m.type === 'image' && (
            <MediaUploader
              previewUrl={m.srcUrl}
              onUploaded={(u) => update(i, { ...m, srcId: u.id, srcUrl: u.thumbUrl })}
            />
          )}

          {m.type === 'grid' && (
            <div className="gallery-grid">
              {m.items.map((it, k) => (
                <div className="gallery-thumb" key={it.id}>
                  {it.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.url} alt="" />
                  )}
                  <button
                    className="icon-btn del thumb-del"
                    onClick={() =>
                      update(i, { ...m, items: m.items.filter((_, z) => z !== k) })
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <MediaUploader
                label="إضافة"
                compact
                onUploaded={(u) =>
                  update(i, { ...m, items: [...m.items, { id: u.id, url: u.thumbUrl }] })
                }
              />
            </div>
          )}

          {m.type === 'video' && (
            <input
              className="field"
              dir="ltr"
              placeholder="رابط الفيديو (YouTube / Vimeo)"
              value={m.embedUrl}
              onChange={(e) => update(i, { ...m, embedUrl: e.target.value })}
            />
          )}

          {m.type === 'beforeafter' && (
            <>
              <div className="grid-2">
                <div>
                  <label className="lbl">قبل</label>
                  <MediaUploader
                    previewUrl={m.beforeUrl}
                    compact
                    onUploaded={(u) => update(i, { ...m, beforeId: u.id, beforeUrl: u.thumbUrl })}
                  />
                </div>
                <div>
                  <label className="lbl">بعد</label>
                  <MediaUploader
                    previewUrl={m.afterUrl}
                    compact
                    onUploaded={(u) => update(i, { ...m, afterId: u.id, afterUrl: u.thumbUrl })}
                  />
                </div>
              </div>
              <div className="grid-2" style={{ marginTop: 8 }}>
                <input
                  className="field"
                  placeholder="نص «قبل»"
                  value={m.labelBefore}
                  onChange={(e) => update(i, { ...m, labelBefore: e.target.value })}
                />
                <input
                  className="field"
                  placeholder="نص «بعد»"
                  value={m.labelAfter}
                  onChange={(e) => update(i, { ...m, labelAfter: e.target.value })}
                />
              </div>
            </>
          )}

          {m.type === 'separator' && (
            <select
              className="field"
              value={m.spacing}
              onChange={(e) =>
                update(i, { ...m, spacing: e.target.value as 'compact' | 'normal' | 'large' })
              }
            >
              <option value="compact">مسافة صغيرة</option>
              <option value="normal">عادية</option>
              <option value="large">كبيرة</option>
            </select>
          )}
        </div>
      ))}

      {modules.length === 0 && (
        <div className="builder-empty">
          <div style={{ fontSize: 34, opacity: 0.4 }}>▢</div>
          <div style={{ fontWeight: 700, marginTop: 8 }}>ابدأ ببناء مشروعك</div>
          <div style={{ color: 'var(--sub)', fontSize: 13 }}>
            {hideAdd ? 'اضغط على عنصر من القائمة الجانبية لإضافته' : 'اختر عنصر من الأزرار فوق'}
          </div>
        </div>
      )}
    </div>
  )
}
