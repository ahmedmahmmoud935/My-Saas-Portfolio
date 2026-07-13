'use client'

import React, { useState } from 'react'
import { saveCategories } from '@/lib/dashboard-actions'
import { useDashLang } from './DashLang'
import NavIcon from './icons'

function List({
  title,
  items,
  setItems,
}: {
  title: string
  items: string[]
  setItems: (v: string[]) => void
}) {
  const { t } = useDashLang()
  const [draft, setDraft] = useState('')
  const add = () => {
    if (draft.trim()) {
      setItems([...items, draft.trim()])
      setDraft('')
    }
  }
  return (
    <div className="panel">
      <div className="panel-title">
        <span>{title}</span>
      </div>
      {items.map((it, i) => (
        <div className="list-row" key={i}>
          <button
            className="icon-btn del"
            onClick={() => setItems(items.filter((_, j) => j !== i))}
            aria-label="delete"
          >
            <NavIcon id="trash" size={15} />
          </button>
          <input
            className="field"
            value={it}
            onChange={(e) => setItems(items.map((v, j) => (j === i ? e.target.value : v)))}
          />
        </div>
      ))}
      <div className="list-row">
        <button className="icon-btn add" onClick={add} aria-label="add">
          +
        </button>
        <input
          className="field"
          placeholder={t('اسم تصنيف جديد...', 'New category name...')}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
      </div>
    </div>
  )
}

/** Manage design/reel categories from inside the Projects tab. */
export default function CategoriesModal({
  initialImage,
  initialVideo,
  onClose,
  onSaved,
}: {
  initialImage: string[]
  initialVideo: string[]
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useDashLang()
  const [image, setImage] = useState(initialImage)
  const [video, setVideo] = useState(initialVideo)
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    await saveCategories(image, video)
    setBusy(false)
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
          <strong>{t('التصنيفات', 'Categories')}</strong>
        </div>

        <div className="modal-body">
          <p className="lbl" style={{ marginBottom: 14 }}>
            {t(
              'تظهر كفلاتر في الموقع فوق شبكة المشاريع.',
              'Shown as filters above the projects grid on your site.',
            )}
          </p>
          <div className="grid-2">
            <List title={t('تصنيفات التصاميم', 'Design categories')} items={image} setItems={setImage} />
            <List title={t('تصنيفات الريلز', 'Reel categories')} items={video} setItems={setVideo} />
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            {t('إلغاء', 'Cancel')}
          </button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? '…' : t('💾 حفظ', '💾 Save')}
          </button>
        </div>
      </div>
    </div>
  )
}
