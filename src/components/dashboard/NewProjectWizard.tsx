'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProject } from '@/lib/project-actions'
import NavIcon from './icons'
import type { EditableProject } from './ProjectEditor'
import { useDashLang } from './DashLang'

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
  const { t } = useDashLang()
  const [busy, setBusy] = useState(false)

  async function startFree() {
    setBusy(true)
    try {
      const res = await saveProject({
        title: t('مشروع جديد', 'New project'),
        mediaType: 'image',
        projectType: 'free',
        published: false, // start as a draft; publish from the editor
      })
      router.push(`/dashboard/projects/${res.id}/editor`)
    } catch {
      alert(t('تعذّر إنشاء المشروع', 'Could not create the project'))
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
          <strong>{kind === null ? t('مشروع جديد', 'New project') : t('اختر طريقة العرض', 'Choose a layout')}</strong>
        </div>

        <div className="modal-body">
          {kind === null ? (
            <div className="wiz-grid">
              <button className="wiz-card" onClick={() => setKind('design')}>
                <span className="wiz-ico"><NavIcon id="palette" size={30} /></span>
                <strong>{t('تصميمات', 'Designs')}</strong>
                <span className="wiz-sub">{t('صور، بوسترات، هوية بصرية', 'Images, posters, branding')}</span>
              </button>
              <button className="wiz-card" onClick={() => setKind('video')}>
                <span className="wiz-ico"><NavIcon id="film" size={30} /></span>
                <strong>{t('فيديو / ريل', 'Video / Reel')}</strong>
                <span className="wiz-sub">{t('ريلز وفيديوهات', 'Reels and videos')}</span>
              </button>
            </div>
          ) : kind === 'design' ? (
            <div className="wiz-grid">
              <button className="wiz-card" onClick={pickGrid}>
                <span className="wiz-ico"><NavIcon id="grid" size={30} /></span>
                <strong>{t('شبكة صور', 'Image grid')}</strong>
                <span className="wiz-sub">{t('أسلوب إنستجرام — عدة صور بترتيب شبكي', 'Instagram-style — several images in a grid')}</span>
              </button>
              <button className="wiz-card" onClick={startFree} disabled={busy}>
                <span className="wiz-ico"><NavIcon id="page" size={30} /></span>
                <strong>{t('صفحة حرة', 'Free page')}</strong>
                <span className="wiz-sub">{busy ? t('جارٍ الإنشاء…', 'Creating…') : t('أسلوب Behance — صفحة كاملة تبنيها بالعناصر', 'Behance-style — a full page you build with elements')}</span>
              </button>
            </div>
          ) : (
            <div className="wiz-grid">
              <button className="wiz-card" onClick={() => pickVideo('reel')}>
                <span className="wiz-ico"><NavIcon id="phone" size={30} /></span>
                <strong>{t('ريل', 'Reel')}</strong>
                <span className="wiz-sub">{t('عمودي 9:16', 'Vertical 9:16')}</span>
              </button>
              <button className="wiz-card" onClick={() => pickVideo('video')}>
                <span className="wiz-ico"><NavIcon id="monitor" size={30} /></span>
                <strong>{t('فيديو', 'Video')}</strong>
                <span className="wiz-sub">{t('أفقي 16:9', 'Horizontal 16:9')}</span>
              </button>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {kind !== null && (
            <button className="btn btn-ghost" onClick={() => setKind(null)} disabled={busy}>
              → {t('رجوع', 'Back')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
