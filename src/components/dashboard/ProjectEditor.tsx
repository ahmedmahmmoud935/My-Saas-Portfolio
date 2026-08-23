'use client'

import React, { useState } from 'react'
import MediaUploader, { type UploadedMedia } from './MediaUploader'
import ModulesEditor from './ModulesEditor'
import { saveProject } from '@/lib/project-actions'
import {
  biEmpty,
  editModuleToInput,
  emptyBi,
  type Bi,
  type ProjectInput,
  type EditModule,
} from '@/lib/project-types'
import BiText from './BiText'
import { useDashLang } from './DashLang'
import { useDragReorder } from './useDragReorder'

/** Move one entry of a list to a new index, returning a new array. */
function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export type EditableProject = {
  id?: number
  title: Bi
  category?: string
  description?: Bi
  mediaType: 'image' | 'video'
  projectType: 'grid' | 'free' | 'stacked'
  coverId?: number | null
  coverUrl?: string | null
  videoUrl?: string
  videoKind?: 'reel' | 'video'
  aspectRatio?: string
  images?: { id: number; url: string | null }[]
  modules?: EditModule[]
  published?: boolean
}

export default function ProjectEditor({
  initial,
  categories,
  onClose,
  onSaved,
}: {
  initial: EditableProject
  categories: string[]
  onClose: () => void
  onSaved: () => void
}) {
  const [p, setP] = useState<EditableProject>(initial)
  const { t } = useDashLang()
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(false)
  const set = (patch: Partial<EditableProject>) => setP((prev) => ({ ...prev, ...patch }))
  // Drag a thumbnail onto a neighbour to reorder the gallery.
  const dragProps = useDragReorder(p.images ?? [], (images) => set({ images }))

  async function submit() {
    if (biEmpty(p.title.ar) && biEmpty(p.title.en)) {
      alert(t('اكتب عنوان المشروع', 'Enter the project title'))
      return
    }
    setBusy(true)
    const input: ProjectInput = {
      id: p.id,
      title: p.title,
      category: p.category,
      description: p.description,
      mediaType: p.mediaType,
      projectType: p.projectType,
      coverId: p.coverId ?? null,
      videoUrl: p.videoUrl,
      videoKind: p.videoKind,
      aspectRatio: p.aspectRatio,
      imageIds: (p.images ?? []).map((im) => im.id),
      modules: (p.modules ?? []).map(editModuleToInput),
    }
    try {
      await saveProject(input)
      setToast(true)
      // Let the confirmation land before the modal closes.
      setTimeout(onSaved, 900)
    } catch {
      alert(t('فشل الحفظ', 'Save failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
          <strong>{p.id ? t('تعديل مشروع', 'Edit project') : t('مشروع جديد', 'New project')}</strong>
        </div>

        <div className="modal-body">
          <label className="lbl">{t('العنوان', 'Title')}</label>
          <div className="grid-2">
            <input
              className="field"
              placeholder={t('عربي', 'Arabic')}
              value={p.title.ar}
              onChange={(e) => set({ title: { ...p.title, ar: e.target.value } })}
            />
            <input
              className="field"
              dir="ltr"
              placeholder="English"
              style={{ textAlign: 'start' }}
              value={p.title.en}
              onChange={(e) => set({ title: { ...p.title, en: e.target.value } })}
            />
          </div>

          <div className="grid-2">
            <div>
              <label className="lbl">{t('التصنيف', 'Category')}</label>
              <select
                className="field"
                value={p.category ?? ''}
                onChange={(e) => set({ category: e.target.value })}
              >
                <option value="">{t('— بدون —', '— None —')}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="lbl">{t('النوع', 'Type')}</label>
              <select
                className="field"
                value={p.mediaType}
                onChange={(e) => set({ mediaType: e.target.value as 'image' | 'video' })}
              >
                <option value="image">{t('صور', 'Images')}</option>
                <option value="video">{t('فيديو', 'Video')}</option>
              </select>
            </div>
          </div>

          <BiText
            label={t('الوصف', 'Description')}
            value={p.description ?? emptyBi()}
            onChange={(description) => set({ description })}
            minHeight={130}
          />

          <label className="lbl">{t('تخطيط صفحة التفاصيل', 'Detail page layout')}</label>
          <select
            className="field"
            value={p.projectType}
            onChange={(e) => set({ projectType: e.target.value as EditableProject['projectType'] })}
          >
            <option value="grid">{t('جريد (معرض صور)', 'Grid (image gallery)')}</option>
            <option value="free">{t('حر (page-builder)', 'Free (page builder)')}</option>
            <option value="stacked">{t('مكدّس (غلاف + صور)', 'Stacked (cover + images)')}</option>
          </select>

          {p.mediaType === 'video' && (
            <div className="grid-2">
              <div>
                <label className="lbl">{t('رابط الفيديو', 'Video URL')}</label>
                <input
                  className="field"
                  dir="ltr"
                  value={p.videoUrl ?? ''}
                  onChange={(e) => set({ videoUrl: e.target.value })}
                  placeholder="YouTube / Vimeo"
                />
              </div>
              <div>
                <label className="lbl">{t('نوع الفيديو', 'Video type')}</label>
                <select
                  className="field"
                  value={p.videoKind ?? 'reel'}
                  onChange={(e) => set({ videoKind: e.target.value as 'reel' | 'video' })}
                >
                  <option value="reel">{t('ريل (9:16)', 'Reel (9:16)')}</option>
                  <option value="video">{t('فيديو (16:9)', 'Video (16:9)')}</option>
                </select>
              </div>
            </div>
          )}

          <label className="lbl">
            {t('صورة الغلاف', 'Cover image')}{' '}
            <span style={{ color: 'var(--sub)', fontWeight: 400 }}>
              (
              {p.mediaType === 'video'
                ? p.videoKind === 'video'
                  ? t('سينمائي 16:9', 'Cinematic 16:9')
                  : t('ريل 9:16', 'Reel 9:16')
                : t('4:3', '4:3')}
              )
            </span>
          </label>
          <MediaUploader
            aspect={
              p.mediaType === 'video'
                ? p.videoKind === 'video'
                  ? '16 / 9'
                  : '9 / 16'
                : '4 / 3'
            }
            previewUrl={p.coverUrl}
            onUploaded={(m: UploadedMedia) => set({ coverId: m.id, coverUrl: m.thumbUrl })}
          />

          <label className="lbl">{t('صور المعرض', 'Gallery images')}</label>
          <div className="gallery-grid">
            {(p.images ?? []).map((im, i) => (
              <div className="gallery-thumb" key={im.id} {...dragProps(i)}>
                {im.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={im.url} alt="" draggable={false} />
                )}
                <button
                  className="icon-btn del thumb-del"
                  onClick={() => set({ images: (p.images ?? []).filter((_, j) => j !== i) })}
                >
                  ✕
                </button>
                {/* Reorder after uploading, rather than delete and re-add. */}
                <div className="thumb-move">
                  <button
                    className="icon-btn"
                    disabled={i === 0}
                    title={t('تحريك للخلف', 'Move earlier')}
                    onClick={() => set({ images: moveItem(p.images ?? [], i, i - 1) })}
                  >
                    ‹
                  </button>
                  <button
                    className="icon-btn"
                    disabled={i === (p.images ?? []).length - 1}
                    title={t('تحريك للأمام', 'Move later')}
                    onClick={() => set({ images: moveItem(p.images ?? [], i, i + 1) })}
                  >
                    ›
                  </button>
                </div>
              </div>
            ))}
            <MediaUploader
              plus
              multiple
              label={t('إضافة صور', 'Add images')}
              onUploadedMany={(ms) =>
                set({
                  images: [...(p.images ?? []), ...ms.map((m) => ({ id: m.id, url: m.thumbUrl }))],
                })
              }
            />
          </div>

          {p.projectType === 'free' && (
            <>
              <label className="lbl">{t('بناء الصفحة (Page Builder)', 'Page builder')}</label>
              <ModulesEditor
                modules={p.modules ?? []}
                onChange={(mods) => set({ modules: mods })}
              />
            </>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            {t('إلغاء', 'Cancel')}
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={busy}>
            {busy ? '…' : t('💾 حفظ المشروع', '💾 Save project')}
          </button>
        </div>
      </div>
      {toast && <div className="toast">{t('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
