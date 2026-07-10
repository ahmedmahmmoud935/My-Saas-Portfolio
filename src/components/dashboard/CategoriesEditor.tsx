'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import { saveCategories } from '@/lib/dashboard-actions'
import { useDashLang } from './DashLang'

function List({
  title,
  icon,
  items,
  setItems,
}: {
  title: string
  icon: string
  items: string[]
  setItems: (v: string[]) => void
}) {
  const { t } = useDashLang()
  const [draft, setDraft] = useState('')
  return (
    <div className="panel">
      <div className="panel-title">
        <span>{title}</span>
        <span>{icon}</span>
      </div>
      {items.map((it, i) => (
        <div className="list-row" key={i}>
          <button
            className="icon-btn del"
            onClick={() => setItems(items.filter((_, j) => j !== i))}
            aria-label="delete"
          >
            🗑
          </button>
          <input
            className="field"
            value={it}
            onChange={(e) => setItems(items.map((v, j) => (j === i ? e.target.value : v)))}
          />
        </div>
      ))}
      <div className="list-row">
        <button
          className="icon-btn add"
          onClick={() => {
            if (draft.trim()) {
              setItems([...items, draft.trim()])
              setDraft('')
            }
          }}
          aria-label="add"
        >
          +
        </button>
        <input
          className="field"
          placeholder={t('اسم التصنيف الجديد...', 'New category name...')}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              setItems([...items, draft.trim()])
              setDraft('')
            }
          }}
        />
      </div>
    </div>
  )
}

export default function CategoriesEditor({
  initialImage,
  initialVideo,
}: {
  initialImage: string[]
  initialVideo: string[]
}) {
  const [image, setImage] = useState(initialImage)
  const [video, setVideo] = useState(initialVideo)
  const [busy, setBusy] = useState(false)
  const { t } = useDashLang()
  const [toast, setToast] = useState(false)

  async function save() {
    setBusy(true)
    await saveCategories(image, video)
    setBusy(false)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
  }

  return (
    <div>
      <PageHeader
        icon="🏷️"
        title={t('التصنيفات', 'Categories')}
        subtitle={t('أضِف وعدّل تصنيفات التصاميم والريلز — هتظهر كفلاتر في الموقع', 'Add and edit design/reel categories — shown as filters on the site')}
        actions={
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? '…' : t('💾 حفظ', '💾 Save')}
          </button>
        }
      />
      <div className="grid-2">
        <List title={t('تصنيفات التصاميم', 'Design categories')} icon="🖼️" items={image} setItems={setImage} />
        <List title={t('تصنيفات الريلز', 'Reel categories')} icon="🎬" items={video} setItems={setVideo} />
      </div>
      {toast && <div className="toast">{t('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
