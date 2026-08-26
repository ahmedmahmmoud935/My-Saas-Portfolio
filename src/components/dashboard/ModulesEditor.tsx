'use client'

import React, { useState } from 'react'
import MediaUploader from './MediaUploader'
import NavIcon from './icons'
import Carousel from '@/components/shared/Carousel'
import { resolveVideoUrl } from '@/lib/video'
import type { EditModule } from '@/lib/project-types'
import { emptyBi } from '@/lib/project-types'
import BiText from './BiText'
import { useDashLang } from './DashLang'
import { useDragReorder } from './useDragReorder'

type Img = { id: number; url: string | null }

/**
 * Hosts the drag-reorder hook for one module's image list. A hook can't live
 * inside the modules .map(), so the list gets its own component.
 */
function ModuleImages({
  items,
  onReorder,
  render,
}: {
  items: Img[]
  onReorder: (next: Img[]) => void
  render: (dragProps: ReturnType<typeof useDragReorder<Img>>) => React.ReactNode
}) {
  const dragProps = useDragReorder(items, onReorder)
  return <>{render(dragProps)}</>
}

/** Move one entry of a list to a new index, returning a new array. */
function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export const MODULE_ADD_BUTTONS: { type: EditModule['type']; label: string; labelEn: string; icon: string }[] = [
  { type: 'image', label: 'صورة كاملة', labelEn: 'Full image', icon: 'image' },
  { type: 'grid', label: 'شبكة صور', labelEn: 'Image grid', icon: 'grid' },
  { type: 'carousel', label: 'كاروسيل', labelEn: 'Carousel', icon: 'grid' },
  { type: 'text', label: 'نص / عنوان', labelEn: 'Text / heading', icon: 'text' },
  { type: 'video', label: 'فيديو', labelEn: 'Video', icon: 'video' },
  { type: 'beforeafter', label: 'قبل / بعد', labelEn: 'Before / after', icon: 'beforeafter' },
  { type: 'separator', label: 'فاصل', labelEn: 'Separator', icon: 'separator' },
]

export function blankModule(type: EditModule['type']): EditModule {
  switch (type) {
    case 'text':
      return { type: 'text', textType: 'p', value: emptyBi() }
    case 'image':
      return { type: 'image', srcId: null, srcUrl: null }
    case 'grid':
      return { type: 'grid', items: [], mobileCols: 1 }
    case 'carousel':
      return { type: 'carousel', items: [] }
    case 'video':
      return { type: 'video', embedUrl: '', posterId: null, posterUrl: null }
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
  const { t } = useDashLang()
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
              <NavIcon id={b.icon} size={16} />
              {t(b.label, b.labelEn)}
            </button>
          ))}
        </div>
      )}

      {modules.map((m, i) => (
        <div className="mod-card" key={i}>
          <div className="mod-card-head">
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => move(i, -1)}>
                <NavIcon id="up" size={15} />
              </button>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => move(i, 1)}>
                <NavIcon id="down" size={15} />
              </button>
              <button className="icon-btn del" style={{ width: 30, height: 30 }} onClick={() => remove(i)}>
                <NavIcon id="trash" size={15} />
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
                <option value="h1">{t('عنوان كبير (H1)', 'Heading (H1)')}</option>
                <option value="h2">{t('عنوان (H2)', 'Subheading (H2)')}</option>
                <option value="p">{t('فقرة', 'Paragraph')}</option>
              </select>
              <BiText
                label={t('النص', 'Text')}
                value={m.value}
                onChange={(value) => update(i, { ...m, value })}
                minHeight={150}
              />
            </>
          )}

          {m.type === 'image' && (
            <MediaUploader
              big
              previewUrl={m.srcUrl}
              onUploaded={(u) => update(i, { ...m, srcId: u.id, srcUrl: u.thumbUrl })}
            />
          )}

          {(m.type === 'grid' || m.type === 'carousel') && (
            <>
              {/* How many fit across on a phone. A wide screen keeps the
                  proportional row either way. */}
              {m.type === 'grid' && (
                <div className="row-cols">
                  <span className="lbl" style={{ margin: 0 }}>
                    {t('على الموبايل: عدد الصور في الصف', 'On a phone: images per row')}
                  </span>
                  <div className="row-cols-opts">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`pill ${m.mobileCols === n ? 'active' : ''}`}
                        onClick={() => update(i, { ...m, mobileCols: n })}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Show it the way the site will: a carousel slides, a grid is a
                  proportional row. Guessing from square crops was the reason
                  you had to publish to see what you'd made. */}
              {m.type === 'carousel' && m.items.length > 0 && (
                <div className="mod-preview">
                  <span className="mod-preview-tag">{t('معاينة', 'Preview')}</span>
                  <Carousel
                    images={m.items.map((it) => it.url).filter((u): u is string => Boolean(u))}
                    height="min(46vh, 360px)"
                  />
                </div>
              )}
              <ModuleImages
                items={m.items}
                onReorder={(items) => update(i, { ...m, items })}
                render={(dragProps) => (
                  <div className={`gallery-grid${m.type === 'grid' ? ' as-row' : ' as-strip'}`}>
                    {m.items.map((it, k) => (
                      <div className="gallery-thumb" key={it.id} {...dragProps(k)}>
                        {/* Click the thumb to swap this image (استبدال). */}
                        <MediaUploader
                          big
                          previewUrl={it.url}
                          onUploaded={(u) =>
                            update(i, {
                              ...m,
                              items: m.items.map((x, z) => (z === k ? { id: u.id, url: u.url ?? u.thumbUrl } : x)),
                            })
                          }
                        />
                        <button
                          className="icon-btn del thumb-del"
                          onClick={() => update(i, { ...m, items: m.items.filter((_, z) => z !== k) })}
                        >
                          <NavIcon id="x" size={13} />
                        </button>
                        {/* Reorder after the fact — uploading in the wrong order
                            shouldn't mean deleting and starting again. */}
                        <div className="thumb-move">
                          <button
                            className="icon-btn"
                            disabled={k === 0}
                            title={t('تحريك للخلف', 'Move earlier')}
                            onClick={() => update(i, { ...m, items: moveItem(m.items, k, k - 1) })}
                          >
                            <NavIcon id="back" size={13} />
                          </button>
                          <button
                            className="icon-btn"
                            disabled={k === m.items.length - 1}
                            title={t('تحريك للأمام', 'Move later')}
                            onClick={() => update(i, { ...m, items: moveItem(m.items, k, k + 1) })}
                          >
                            <NavIcon id="external" size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <MediaUploader
                      plus
                      multiple
                      label={t('إضافة صور', 'Add images')}
                      onUploadedMany={(us) =>
                        update(i, {
                          ...m,
                          items: [...m.items, ...us.map((u) => ({ id: u.id, url: u.url ?? u.thumbUrl }))],
                        })
                      }
                    />
                  </div>
                )}
              />
            </>
          )}

          {m.type === 'video' && (
            <VideoBody
              value={m.embedUrl}
              onChange={(embedUrl) => update(i, { ...m, embedUrl })}
              posterUrl={m.posterUrl}
              onPoster={(posterId, posterUrl) => update(i, { ...m, posterId, posterUrl })}
            />
          )}

          {m.type === 'beforeafter' && (
            <>
              <div className="ba-note">{t('لازم تكون الصورتان بنفس الأبعاد بالظبط عشان المقارنة تظبط.', 'Both images must be exactly the same dimensions for the comparison to line up.')}</div>
              <div className="grid-2">
                <div>
                  <label className="lbl">{t('قبل', 'Before')}</label>
                  <MediaUploader
                    big
                    previewUrl={m.beforeUrl}
                    onUploaded={(u) => update(i, { ...m, beforeId: u.id, beforeUrl: u.thumbUrl })}
                  />
                </div>
                <div>
                  <label className="lbl">{t('بعد', 'After')}</label>
                  <MediaUploader
                    big
                    previewUrl={m.afterUrl}
                    onUploaded={(u) => update(i, { ...m, afterId: u.id, afterUrl: u.thumbUrl })}
                  />
                </div>
              </div>
              <div className="grid-2" style={{ marginTop: 8 }}>
                <input
                  className="field"
                  placeholder={t('نص «قبل»', '“Before” label')}
                  value={m.labelBefore}
                  onChange={(e) => update(i, { ...m, labelBefore: e.target.value })}
                />
                <input
                  className="field"
                  placeholder={t('نص «بعد»', '“After” label')}
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
              <option value="compact">{t('مسافة صغيرة', 'Compact')}</option>
              <option value="normal">{t('عادية', 'Normal')}</option>
              <option value="large">{t('كبيرة', 'Large')}</option>
            </select>
          )}
        </div>
      ))}

      {modules.length === 0 && (
        <div className="builder-empty">
          <div style={{ fontSize: 34, opacity: 0.4 }}>▢</div>
          <div style={{ fontWeight: 700, marginTop: 8 }}>{t('ابدأ ببناء مشروعك', 'Start building your project')}</div>
          <div style={{ color: 'var(--sub)', fontSize: 13 }}>
            {hideAdd ? t('اضغط على عنصر من القائمة الجانبية لإضافته', 'Click an element from the side panel to add it') : t('اختر عنصر من الأزرار فوق', 'Choose an element from the buttons above')}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Video module body — link / upload a file / paste embed code ──────────── */
const VIDEO_MODES = [
  { id: 'link', label: 'رابط', labelEn: 'Link', icon: 'link' },
  { id: 'upload', label: 'رفع من الجهاز', labelEn: 'Upload file', icon: 'upload' },
  { id: 'code', label: 'كود التضمين', labelEn: 'Embed code', icon: 'code' },
] as const
type VideoMode = (typeof VIDEO_MODES)[number]['id']

function VideoBody({
  value,
  onChange,
  posterUrl,
  onPoster,
}: {
  value: string
  onChange: (v: string) => void
  posterUrl: string | null
  onPoster: (id: number | null, url: string | null) => void
}) {
  const [mode, setMode] = useState<VideoMode>('link')
  const { t } = useDashLang()
  const resolved = resolveVideoUrl(value)

  return (
    <div className="video-body">
      <div className="video-modes">
        {VIDEO_MODES.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`video-mode ${mode === o.id ? 'active' : ''}`}
            onClick={() => setMode(o.id)}
          >
            <NavIcon id={o.icon} size={15} />
            {t(o.label, o.labelEn)}
          </button>
        ))}
      </div>

      {mode === 'link' && (
        <input
          className="field"
          dir="ltr"
          placeholder={t('https://youtu.be/…  أو  https://vimeo.com/…', 'https://youtu.be/…  or  https://vimeo.com/…')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {mode === 'upload' && (
        <MediaUploader
          label={t('رفع ملف فيديو', 'Upload video file')}
          accept="video/*"
          previewUrl={null}
          onUploaded={(u) => onChange(u.url ?? '')}
        />
      )}

      {mode === 'code' && (
        <textarea
          className="field"
          dir="ltr"
          rows={3}
          placeholder={'<iframe src="…"></iframe>'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {/* Live preview so the user sees it working before saving. The cover is
          set ON this preview rather than in a block of its own: it IS the
          poster, so showing it twice made the module look like two elements. */}
      {resolved && (
        <div className="video-preview">
          {resolved.kind === 'file' ? (
            <>
              <video
                src={resolved.url}
                poster={posterUrl || undefined}
                controls
                playsInline
                preload={posterUrl ? 'none' : 'metadata'}
              />
              {/* Sits over a corner of the player, clear of the controls. An
                  embed brings its own thumbnail, so it gets no cover control. */}
              <div className="video-cover-bar">
                <MediaUploader
                  compact
                  previewUrl={null}
                  label={posterUrl ? t('تغيير الكفر', 'Change cover') : t('إضافة كفر', 'Add cover')}
                  onUploaded={(u) => onPoster(u.id, u.url ?? u.thumbUrl)}
                />
                {posterUrl && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onPoster(null, null)}>
                    {t('إزالة', 'Remove')}
                  </button>
                )}
              </div>
            </>
          ) : (
            <iframe
              src={resolved.url}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="video-preview"
            />
          )}
        </div>
      )}
    </div>
  )
}
