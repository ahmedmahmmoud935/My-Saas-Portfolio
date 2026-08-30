'use client'

import React from 'react'
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
          'أي قسم مش مضاف هنا بياخد خلفية الصفحة. الخلفية دي بتشتغل في الثيمين — اللي بيتغيّر هو لون التعتيم بس (أسود على الداكن، أبيض على الفاتح).',
          'Sections not listed here use the page background. A background applies to both themes — only the veil colour changes (black on dark, white on light).',
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
            <ColorInput label={tr('اللون', 'Colour')} value={r.color} onChange={(v) => patchRow(i, { color: v })} />
          )}

          {r.mode === 'image' && (
            // Picture on one side, every setting for it on the other, each
            // starting on the same line as the last. The settings used to be
            // scattered around the picture with the sliders stranded in a
            // column of their own.
            <div className="bg-image-row">
              <MediaUploader
                big
                dim={r.dim}
                previewUrl={r.imageUrl}
                label={tr('صورة', 'Image')}
                onUploaded={(m) => patchRow(i, { imageId: m.id, imageUrl: m.url ?? m.thumbUrl })}
                onRemove={() => patchRow(i, { imageId: null, imageUrl: null })}
              />
              <div className="bg-image-ctrls">
                <Opt
                  label={tr('السلوك عند التمرير', 'Scroll behaviour')}
                  value={r.fixed ? 'fixed' : 'scroll'}
                  options={[
                    { value: 'fixed', label: tr('ثابتة (بارالاكس)', 'Fixed (parallax)') },
                    { value: 'scroll', label: tr('تتحرك', 'Scrolls') },
                  ]}
                  onChange={(v) => patchRow(i, { fixed: v === 'fixed' })}
                />
                <div className="bg-ctrls">
                  <label className="lbl">{tr('التعتيم', 'Dim')} — {r.dim}%</label>
                  <input type="range" min={0} max={100} value={r.dim} onChange={(e) => patchRow(i, { dim: Number(e.target.value) })} />
                  <label className="lbl">{tr('الموضع ↔', 'Position ↔')} — {r.posX}%</label>
                  <input type="range" min={0} max={100} value={r.posX} onChange={(e) => patchRow(i, { posX: Number(e.target.value) })} />
                  <label className="lbl">{tr('الموضع ↕', 'Position ↕')} — {r.posY}%</label>
                  <input type="range" min={0} max={100} value={r.posY} onChange={(e) => patchRow(i, { posY: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          )}

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
