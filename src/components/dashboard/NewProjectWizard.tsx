'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProject } from '@/lib/project-actions'
import NavIcon from './icons'
import type { EditableProject } from './ProjectEditor'

type Kind = 'design' | 'video'

/**
 * Two-step "new project" picker matching the old dashboard flow:
 *   Step 1 — نوع العمل (تصميمات / فيديو)
 *   Step 2 — طريقة العرض (شبكة / صفحة حرة  •  ريل / فيديو)
 * Grid / reel / video paths open the modal editor via `onPickModal`.
 * The free (Behance) path creates a blank project and jumps to its full-page editor.
 */
export default function NewProjectWizard({
  onPickModal,
  onClose,
}: {
  onPickModal: (blank: EditableProject) => void
  onClose: () => void
}) {
  const router = useRouter()
  const [kind, setKind] = useState<Kind | null>(null)
  const [busy, setBusy] = useState(false)

  async function startFree() {
    setBusy(true)
    try {
      const res = await saveProject({
        title: 'مشروع جديد',
        mediaType: 'image',
        projectType: 'free',
        published: false, // start as a draft; publish from the editor
      })
      router.push(`/dashboard/projects/${res.id}/editor`)
    } catch {
      alert('تعذّر إنشاء المشروع')
      setBusy(false)
    }
  }

  function pickGrid() {
    onPickModal({ title: '', mediaType: 'image', projectType: 'grid', images: [] })
  }
  function pickVideo(videoKind: 'reel' | 'video') {
    onPickModal({
      title: '',
      mediaType: 'video',
      projectType: 'grid',
      videoKind,
      aspectRatio: videoKind === 'video' ? '16:9' : '9:16',
      images: [],
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <button className="icon-btn" onClick={onClose}>
            <NavIcon id="x" size={16} />
          </button>
          <strong>{kind === null ? 'مشروع جديد' : 'اختر طريقة العرض'}</strong>
        </div>

        <div className="modal-body">
          {kind === null ? (
            <div className="wiz-grid">
              <button className="wiz-card" onClick={() => setKind('design')}>
                <span className="wiz-ico"><NavIcon id="palette" size={30} /></span>
                <strong>تصميمات</strong>
                <span className="wiz-sub">صور، بوسترات، هوية بصرية</span>
              </button>
              <button className="wiz-card" onClick={() => setKind('video')}>
                <span className="wiz-ico"><NavIcon id="film" size={30} /></span>
                <strong>فيديو / ريل</strong>
                <span className="wiz-sub">ريلز وفيديوهات</span>
              </button>
            </div>
          ) : kind === 'design' ? (
            <div className="wiz-grid">
              <button className="wiz-card" onClick={pickGrid}>
                <span className="wiz-ico"><NavIcon id="grid" size={30} /></span>
                <strong>شبكة صور</strong>
                <span className="wiz-sub">أسلوب إنستجرام — عدة صور بترتيب شبكي</span>
              </button>
              <button className="wiz-card" onClick={startFree} disabled={busy}>
                <span className="wiz-ico"><NavIcon id="page" size={30} /></span>
                <strong>صفحة حرة</strong>
                <span className="wiz-sub">{busy ? '...جارٍ الإنشاء' : 'أسلوب Behance — صفحة كاملة تبنيها بالعناصر'}</span>
              </button>
            </div>
          ) : (
            <div className="wiz-grid">
              <button className="wiz-card" onClick={() => pickVideo('reel')}>
                <span className="wiz-ico"><NavIcon id="phone" size={30} /></span>
                <strong>ريل</strong>
                <span className="wiz-sub">عمودي 9:16</span>
              </button>
              <button className="wiz-card" onClick={() => pickVideo('video')}>
                <span className="wiz-ico"><NavIcon id="monitor" size={30} /></span>
                <strong>فيديو</strong>
                <span className="wiz-sub">أفقي 16:9</span>
              </button>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {kind !== null && (
            <button className="btn btn-ghost" onClick={() => setKind(null)} disabled={busy}>
              → رجوع
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
