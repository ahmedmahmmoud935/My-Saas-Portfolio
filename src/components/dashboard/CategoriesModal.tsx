'use client'

import React, { useState } from 'react'
import { saveCategories } from '@/lib/dashboard-actions'
import type { CategoryRow } from '@/lib/category-types'
import { useDashLang } from './DashLang'
import NavIcon from './icons'

function List({
  title,
  items,
  setItems,
}: {
  title: string
  items: CategoryRow[]
  setItems: (v: CategoryRow[]) => void
}) {
  const { t } = useDashLang()
  const [draft, setDraft] = useState('')
  const add = () => {
    if (draft.trim()) {
      setItems([...items, { name: draft.trim(), nameEn: draft.trim() }])
      setDraft('')
    }
  }
  const patch = (i: number, p: Partial<CategoryRow>) =>
    setItems(items.map((c, j) => (j === i ? { ...c, ...p } : c)))
  return (
    <div className="panel">
      <div className="panel-title">
        <span>{title}</span>
      </div>
      {items.map((it, i) => (
        <div className="cat-row" key={i}>
          <button
            className="icon-btn del"
            onClick={() => setItems(items.filter((_, j) => j !== i))}
            aria-label="delete"
          >
            <NavIcon id="trash" size={15} />
          </button>
          <input
            className="field"
            placeholder={t('بالعربي', 'Arabic')}
            value={it.nameAr ?? ''}
            onChange={(e) => patch(i, { nameAr: e.target.value })}
          />
          <input
            className="field"
            dir="ltr"
            style={{ textAlign: 'start' }}
            placeholder="English"
            value={it.nameEn ?? it.name ?? ''}
            onChange={(e) => patch(i, { nameEn: e.target.value })}
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
  initialImage: CategoryRow[]
  initialVideo: CategoryRow[]
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
