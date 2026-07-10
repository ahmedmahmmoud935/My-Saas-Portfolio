'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import MediaUploader from './MediaUploader'
import NavIcon from './icons'
import ModulesEditor, { MODULE_ADD_BUTTONS, blankModule } from './ModulesEditor'
import { saveProject } from '@/lib/project-actions'
import { editModuleToInput, type EditModule } from '@/lib/project-types'

export type BuilderProject = {
  id: number
  title: string
  category?: string
  description?: string
  coverId: number | null
  coverUrl: string | null
  modules: EditModule[]
}

export default function ProjectPageBuilder({
  initial,
  categories,
}: {
  initial: BuilderProject
  categories: string[]
}) {
  const router = useRouter()
  const [p, setP] = useState<BuilderProject>(initial)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(false)

  const setModules = (modules: EditModule[]) => setP((x) => ({ ...x, modules }))

  async function save(published: boolean, exit: boolean) {
    if (!p.title.trim()) {
      alert('اكتب عنوان المشروع')
      return
    }
    setBusy(true)
    try {
      await saveProject({
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description,
        mediaType: 'image',
        projectType: 'free',
        coverId: p.coverId ?? null,
        published,
        modules: p.modules.map(editModuleToInput),
      })
      if (exit) {
        router.push('/dashboard/projects')
        router.refresh()
      } else {
        setToast(true)
        setTimeout(() => setToast(false), 1800)
      }
    } catch {
      alert('فشل الحفظ')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="builder">
      <div className="builder-bar">
        <a className="builder-back" href="/dashboard/projects">
          <NavIcon id="back" size={16} />
          رجوع
        </a>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => save(false, false)} disabled={busy}>
            <NavIcon id="save" size={16} />
            {busy ? '...' : 'حفظ كمسودة'}
          </button>
          <button className="btn btn-primary" onClick={() => save(true, true)} disabled={busy}>
            <NavIcon id="publish" size={16} />
            نشر
          </button>
        </div>
      </div>

      <div className="builder-body">
        {/* Canvas */}
        <div className="builder-canvas">
          <ModulesEditor modules={p.modules} onChange={setModules} hideAdd />
        </div>

        {/* Sidebar: add elements + info */}
        <aside className="builder-side">
          <div className="builder-side-title">إضافة عنصر</div>
          <div className="builder-add">
            {MODULE_ADD_BUTTONS.map((b) => (
              <button
                key={b.type}
                className="builder-add-btn"
                onClick={() => setModules([...p.modules, blankModule(b.type)])}
              >
                <NavIcon id={b.icon} size={17} />
                {b.label}
              </button>
            ))}
          </div>

          <div className="builder-side-title" style={{ marginTop: 18 }}>
            معلومات
          </div>
          <label className="lbl">العنوان *</label>
          <input className="field" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} />
          <label className="lbl">التصنيف</label>
          <select
            className="field"
            value={p.category ?? ''}
            onChange={(e) => setP({ ...p, category: e.target.value })}
          >
            <option value="">— بدون —</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="lbl">الوصف</label>
          <textarea
            className="field"
            rows={3}
            value={p.description ?? ''}
            onChange={(e) => setP({ ...p, description: e.target.value })}
          />
          <label className="lbl">صورة الغلاف</label>
          <MediaUploader
            previewUrl={p.coverUrl}
            onUploaded={(m) => setP({ ...p, coverId: m.id, coverUrl: m.thumbUrl })}
          />
          <p style={{ color: 'var(--sub)', fontSize: 12, marginTop: 6 }}>
            الغلاف هو اللي بيظهر في كارت المشروع بالقائمة.
          </p>
        </aside>
      </div>

      {toast && <div className="toast">تم الحفظ ✓</div>}
    </div>
  )
}
