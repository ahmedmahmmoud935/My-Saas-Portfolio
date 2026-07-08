'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import { saveCategories } from '@/lib/dashboard-actions'

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
          placeholder="اسم التصنيف الجديد..."
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
        title="التصنيفات"
        subtitle="أضِف وعدّل تصنيفات التصاميم والريلز — هتظهر كفلاتر في الموقع"
        actions={
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? '...' : '💾 حفظ'}
          </button>
        }
      />
      <div className="grid-2">
        <List title="تصنيفات التصاميم" icon="🖼️" items={image} setItems={setImage} />
        <List title="تصنيفات الريلز" icon="🎬" items={video} setItems={setVideo} />
      </div>
      {toast && <div className="toast">تم الحفظ ✓</div>}
    </div>
  )
}
