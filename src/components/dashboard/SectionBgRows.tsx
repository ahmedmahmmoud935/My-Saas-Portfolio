'use client'

import React, { useEffect, useRef, useState } from 'react'
import MediaUploader from './MediaUploader'
import NavIcon from './icons'
import { ColorInput, Opt, Slider } from './controls'
import { emptySectionBg, type SectionBgForm } from '@/lib/design-types'

/**
 * The list of per-section backdrops: a colour, a picture or a looping video
 * attached to one section of a page.
 *
 * Shared by the tenant Design tab and the landing-page editor. The two differ
 * only in which sections they can name, so that is the parameter — everything
 * below (the modes, the parallax choice, the dim and position sliders) is the
 * same work on the same shape, and duplicating it is how the two would drift.
 */
export default function SectionBgRows({
  rows,
  sections,
  tr,
  onChange,
}: {
  rows: SectionBgForm[]
  sections: { id: string; ar: string; en: string }[]
  tr: (ar: string, en: string) => string
  onChange: (rows: SectionBgForm[]) => void
}) {
  const patchRow = (i: number, p: Partial<SectionBgForm>) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, ...p } : r)))
  const removeRow = (i: number) => onChange(rows.filter((_, j) => j !== i))

  return (
    <>
      <p style={{ color: 'var(--sub)', fontSize: 13, margin: '0 0 12px' }}>
        {tr(
          'أي قسم مش مضاف هنا بياخد خلفية الصفحة. الصورة والفيديو بيشتغلوا في الثيمين واللي بيتغيّر هو لون التعتيم بس (أسود على الداكن، أبيض على الفاتح). اللون بقى لكل ثيم لون لوحده.',
          'Sections not listed here use the page background. A picture or video serves both themes — only the veil changes (black on dark, white on light). A flat colour is set per theme.',
        )}
      </p>

      {rows.map((r, i) => (
        <div className="de-group" key={i} style={{ marginBottom: 12 }}>
          <div className="mod-card-head">
            <button className="icon-btn del" style={{ width: 30, height: 30 }} onClick={() => removeRow(i)}>
              <NavIcon id="trash" size={14} />
            </button>
            <span style={{ color: 'var(--sub)', fontSize: 12 }}>
              {sections.find((s) => s.id === r.section)?.[tr('ar', 'en') as 'ar' | 'en'] || r.section}
            </span>
          </div>
          <div className="de-grid">
            <div>
              <label className="lbl">{tr('القسم', 'Section')}</label>
              <select className="field" value={r.section} onChange={(e) => patchRow(i, { section: e.target.value })}>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{tr(s.ar, s.en)}</option>
                ))}
              </select>
            </div>
            <Opt
              label={tr('النوع', 'Type')}
              value={r.mode}
              options={[
                { value: 'color', label: tr('لون', 'Colour') },
                { value: 'image', label: tr('صورة', 'Image') },
                { value: 'video', label: tr('فيديو', 'Video') },
              ]}
              onChange={(v) => patchRow(i, { mode: v })}
            />
          </div>

          {r.mode === 'color' && (
            <>
              <div className="de-grid">
                <ColorInput label={tr('🌙 لون الثيم الداكن', '🌙 Dark theme colour')} value={r.color} onChange={(v) => patchRow(i, { color: v })} />
                <ColorInput label={tr('☀️ لون الثيم الفاتح', '☀️ Light theme colour')} value={r.colorLight} onChange={(v) => patchRow(i, { colorLight: v })} />
              </div>
              <p style={{ color: 'var(--sub)', fontSize: 12.5, margin: '6px 0 0' }}>
                {tr(
                  'سيب لون الثيم الفاتح فاضي عشان الاتنين ياخدوا نفس اللون زي الأول.',
                  'Leave the light colour empty and both themes keep wearing the dark one, as before.',
                )}
              </p>
            </>
          )}

          {r.mode === 'image' && <ImageRow row={r} tr={tr} patch={(p) => patchRow(i, p)} />}

          {r.mode === 'video' && (
            <>
              <label className="lbl">{tr('رابط الفيديو (mp4 مباشر)', 'Video URL (direct mp4)')}</label>
              <input className="field" dir="ltr" value={r.videoUrl} onChange={(e) => patchRow(i, { videoUrl: e.target.value })} style={{ textAlign: 'start' }} />
              <Slider label={tr('التعتيم', 'Dim')} value={r.dim} min={0} max={100} suffix="%" onChange={(v) => patchRow(i, { dim: v })} />
            </>
          )}
        </div>
      ))}

      <button
        className="btn btn-ghost"
        onClick={() => onChange([...rows, { ...emptySectionBg(), section: sections[0]?.id || 'hero' }])}
      >
        + {tr('خلفية قسم', 'Section background')}
      </button>
    </>
  )
}

type Framing = Pick<SectionBgForm, 'dim' | 'posX' | 'posY'>

/**
 * A picture backdrop: the picture on one side, every setting for it on the
 * other, each starting on the same line as the last.
 *
 * The three sliders move on their own state and hand the value to the page a
 * moment after the hand stops. Sent on every step of a drag, each one redrew
 * the whole design screen, so the thumb stuck and jumped behind the pointer.
 * The picture beside them still darkens at once, from the same local value.
 */
function ImageRow({
  row,
  tr,
  patch,
}: {
  row: SectionBgForm
  tr: (ar: string, en: string) => string
  patch: (p: Partial<SectionBgForm>) => void
}) {
  const [live, setLive] = useState<Framing>({ dim: row.dim, posX: row.posX, posY: row.posY })
  const pending = useRef<Partial<Framing>>({})
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const patchRef = useRef(patch)
  patchRef.current = patch

  // A value changed from outside (a reset, a reload) wins over the local one.
  useEffect(() => {
    if (!timer.current) setLive({ dim: row.dim, posX: row.posX, posY: row.posY })
  }, [row.dim, row.posX, row.posY])

  const flush = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    const p = pending.current
    pending.current = {}
    if (Object.keys(p).length) patchRef.current(p)
  }
  useEffect(() => flush, [])

  const move = (key: keyof Framing, v: number) => {
    setLive((l) => ({ ...l, [key]: v }))
    pending.current = { ...pending.current, [key]: v }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(flush, 150)
  }

  const slider = (key: keyof Framing, label: string) => (
    <>
      <label className="lbl">
        {label} — {live[key]}%
      </label>
      <input
        type="range"
        min={0}
        max={100}
        value={live[key]}
        onChange={(e) => move(key, Number(e.target.value))}
        onPointerUp={flush}
        onKeyUp={flush}
        onBlur={flush}
      />
    </>
  )

  return (
    <div className="bg-image-row">
      <MediaUploader
        big
        dim={live.dim}
        previewUrl={row.imageUrl}
        label={tr('صورة', 'Image')}
        onUploaded={(m) => patch({ imageId: m.id, imageUrl: m.url ?? m.thumbUrl })}
        onRemove={() => patch({ imageId: null, imageUrl: null })}
      />
      <div className="bg-image-ctrls">
        <Opt
          label={tr('السلوك عند التمرير', 'Scroll behaviour')}
          value={row.fixed ? 'fixed' : 'scroll'}
          options={[
            { value: 'fixed', label: tr('ثابتة (بارالاكس)', 'Fixed (parallax)') },
            { value: 'scroll', label: tr('تتحرك', 'Scrolls') },
          ]}
          onChange={(v) => patch({ fixed: v === 'fixed' })}
        />
        <div className="bg-ctrls">
          {slider('dim', tr('التعتيم', 'Dim'))}
          {slider('posX', tr('الموضع ↔', 'Position ↔'))}
          {slider('posY', tr('الموضع ↕', 'Position ↕'))}
        </div>
      </div>
    </div>
  )
}
