'use client'

import React, { useState } from 'react'
import MediaUploader, { type UploadedMedia } from './MediaUploader'
import ModulesEditor from './ModulesEditor'
import { saveProject } from '@/lib/project-actions'
import { editModuleToInput, type ProjectInput, type EditModule } from '@/lib/project-types'

export type EditableProject = {
  id?: number
  title: string
  category?: string
  description?: string
  mediaType: 'image' | 'video'
  projectType: 'grid' | 'free' | 'stacked'
  coverId?: number | null
  coverUrl?: string | null
  videoUrl?: string
  videoKind?: 'reel' | 'video'
  aspectRatio?: string
  images?: { id: number; url: string | null }[]
  modules?: EditModule[]
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
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<EditableProject>) => setP((prev) => ({ ...prev, ...patch }))

  async function submit() {
    if (!p.title.trim()) {
      alert('اكتب عنوان المشروع')
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
      onSaved()
    } catch {
      alert('فشل الحفظ')
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
          <strong>{p.id ? 'تعديل مشروع' : 'مشروع جديد'}</strong>
        </div>

        <div className="modal-body">
          <label className="lbl">العنوان</label>
          <input className="field" value={p.title} onChange={(e) => set({ title: e.target.value })} />

          <div className="grid-2">
            <div>
              <label className="lbl">التصنيف</label>
              <select
                className="field"
                value={p.category ?? ''}
                onChange={(e) => set({ category: e.target.value })}
              >
                <option value="">— بدون —</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="lbl">النوع</label>
              <select
                className="field"
                value={p.mediaType}
                onChange={(e) => set({ mediaType: e.target.value as 'image' | 'video' })}
              >
                <option value="image">صور</option>
                <option value="video">فيديو</option>
              </select>
            </div>
          </div>

          <label className="lbl">الوصف</label>
          <textarea
            className="field"
            rows={3}
            value={p.description ?? ''}
            onChange={(e) => set({ description: e.target.value })}
          />

          <label className="lbl">تخطيط صفحة التفاصيل</label>
          <select
            className="field"
            value={p.projectType}
            onChange={(e) => set({ projectType: e.target.value as EditableProject['projectType'] })}
          >
            <option value="grid">جريد (معرض صور)</option>
            <option value="free">حر (page-builder)</option>
            <option value="stacked">مكدّس (غلاف + صور)</option>
          </select>

          {p.mediaType === 'video' && (
            <div className="grid-2">
              <div>
                <label className="lbl">رابط الفيديو</label>
                <input
                  className="field"
                  dir="ltr"
                  value={p.videoUrl ?? ''}
                  onChange={(e) => set({ videoUrl: e.target.value })}
                  placeholder="YouTube / Vimeo"
                />
              </div>
              <div>
                <label className="lbl">نوع الفيديو</label>
                <select
                  className="field"
                  value={p.videoKind ?? 'reel'}
                  onChange={(e) => set({ videoKind: e.target.value as 'reel' | 'video' })}
                >
                  <option value="reel">ريل (9:16)</option>
                  <option value="video">فيديو (16:9)</option>
                </select>
              </div>
            </div>
          )}

          <label className="lbl">صورة الغلاف</label>
          <MediaUploader
            previewUrl={p.coverUrl}
            onUploaded={(m: UploadedMedia) => set({ coverId: m.id, coverUrl: m.thumbUrl })}
          />

          <label className="lbl">صور المعرض</label>
          <div className="gallery-grid">
            {(p.images ?? []).map((im, i) => (
              <div className="gallery-thumb" key={im.id}>
                {im.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={im.url} alt="" />
                )}
                <button
                  className="icon-btn del thumb-del"
                  onClick={() => set({ images: (p.images ?? []).filter((_, j) => j !== i) })}
                >
                  ✕
                </button>
              </div>
            ))}
            <MediaUploader
              label="إضافة"
              compact
              onUploaded={(m) =>
                set({ images: [...(p.images ?? []), { id: m.id, url: m.thumbUrl }] })
              }
            />
          </div>

          {p.projectType === 'free' && (
            <>
              <label className="lbl">بناء الصفحة (Page Builder)</label>
              <ModulesEditor
                modules={p.modules ?? []}
                onChange={(mods) => set({ modules: mods })}
              />
            </>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={busy}>
            {busy ? '...' : '💾 حفظ المشروع'}
          </button>
        </div>
      </div>
    </div>
  )
}
