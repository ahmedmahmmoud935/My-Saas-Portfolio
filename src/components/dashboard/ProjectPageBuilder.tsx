'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import MediaUploader from './MediaUploader'
import NavIcon from './icons'
import ModulesEditor, { MODULE_ADD_BUTTONS, blankModule } from './ModulesEditor'
import { saveProject } from '@/lib/project-actions'
import { uploadFile } from '@/lib/upload-client'
import { biEmpty, editModuleToInput, emptyBi, type Bi, type EditModule } from '@/lib/project-types'
import BiText from './BiText'
import { useDashLang } from './DashLang'

export type BuilderProject = {
  id: number
  title: Bi
  category?: string
  description?: Bi
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
  const { t } = useDashLang()
  const [toast, setToast] = useState(false)
  // One drawer at a time. The rail used to hold every panel at once, so it grew
  // past the viewport and scrolled against the page behind it.
  const [openDrawer, setOpenDrawer] = useState<string | null>('add')
  // Publishing used to jump straight back to the list, so the only sign it had
  // worked was the page changing under you.
  const [published, setPublished] = useState(false)
  const toggle = (id: string) => setOpenDrawer((cur) => (cur === id ? null : id))

  const setModules = (modules: EditModule[]) => setP((x) => ({ ...x, modules }))

  // Image/grid/carousel elements open the file picker immediately, then create
  // the module from the uploaded image(s). Other elements just add a blank block.
  const fileRef = useRef<HTMLInputElement>(null)
  const pending = useRef<'image' | 'grid' | 'carousel' | null>(null)

  function addElement(type: EditModule['type']) {
    if (type === 'image' || type === 'grid' || type === 'carousel') {
      pending.current = type
      if (fileRef.current) {
        fileRef.current.multiple = type !== 'image'
        fileRef.current.click()
      }
    } else {
      setModules([...p.modules, blankModule(type)])
    }
  }

  async function onFilesPicked(files: File[]) {
    const type = pending.current
    pending.current = null
    if (!type || files.length === 0) return
    try {
      const results = []
      for (const [i, f] of files.entries()) {
        results.push(await uploadFile(f, { index: i + 1, total: files.length }))
      }
      const mod: EditModule =
        type === 'image'
          ? { type: 'image', srcId: results[0].id, srcUrl: results[0].thumbUrl }
          : { type, items: results.map((r) => ({ id: r.id, url: r.thumbUrl })) }
      setModules([...p.modules, mod])
    } catch {
      alert(t('فشل الرفع', 'Upload failed'))
    }
  }

  async function save(published: boolean, exit: boolean) {
    if (biEmpty(p.title.ar) && biEmpty(p.title.en)) {
      alert(t('اكتب عنوان المشروع', 'Enter the project title'))
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
        setPublished(true)
      } else {
        setToast(true)
        setTimeout(() => setToast(false), 1800)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      alert(t(`فشل الحفظ${msg ? `: ${msg}` : ''}`, `Save failed${msg ? `: ${msg}` : ''}`))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="builder">
      <div className="builder-bar">
        <a className="builder-back" href="/dashboard/projects">
          <NavIcon id="back" size={16} />
          {t('رجوع', 'Back')}
        </a>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => save(false, false)} disabled={busy}>
            <NavIcon id="save" size={16} />
            {busy ? '…' : t('حفظ كمسودة', 'Save as draft')}
          </button>
          <button className="btn btn-primary" onClick={() => save(true, true)} disabled={busy}>
            <NavIcon id="publish" size={16} />
            {t('نشر', 'Publish')}
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
          <Drawer id="add" open={openDrawer} onToggle={toggle} icon="grid" title={t('إضافة عنصر', 'Add element')}>
            <div className="builder-add">
              {MODULE_ADD_BUTTONS.map((b) => (
                <button key={b.type} className="builder-add-btn" onClick={() => addElement(b.type)}>
                  <NavIcon id={b.icon} size={17} />
                  {t(b.label, b.labelEn)}
                </button>
              ))}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const fs = Array.from(e.target.files ?? [])
                  if (fs.length) onFilesPicked(fs)
                  e.target.value = ''
                }}
              />
            </div>
          </Drawer>

          <Drawer id="cover" open={openDrawer} onToggle={toggle} icon="image" title={t('صورة الغلاف', 'Cover image')}>
            <MediaUploader
              previewUrl={p.coverUrl}
              onUploaded={(m) => setP({ ...p, coverId: m.id, coverUrl: m.thumbUrl })}
            />
            <p style={{ color: 'var(--sub)', fontSize: 12, marginTop: 6 }}>
              {t('الغلاف هو اللي بيظهر في كارت المشروع بالقائمة.', 'The cover is what shows on the project card in the list.')}
            </p>
          </Drawer>

          <Drawer id="info" open={openDrawer} onToggle={toggle} icon="text" title={t('العنوان والتصنيف', 'Title & category')}>
            <label className="lbl">{t('العنوان *', 'Title *')}</label>
            <div className="grid-2">
              <input
                className="field"
                placeholder={t('عربي', 'Arabic')}
                value={p.title.ar}
                onChange={(e) => setP({ ...p, title: { ...p.title, ar: e.target.value } })}
              />
              <input
                className="field"
                dir="ltr"
                placeholder="English"
                style={{ textAlign: 'start' }}
                value={p.title.en}
                onChange={(e) => setP({ ...p, title: { ...p.title, en: e.target.value } })}
              />
            </div>
            <label className="lbl">{t('التصنيف', 'Category')}</label>
            <select
              className="field"
              value={p.category ?? ''}
              onChange={(e) => setP({ ...p, category: e.target.value })}
            >
              <option value="">{t('— بدون —', '— None —')}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Drawer>

          <Drawer id="desc" open={openDrawer} onToggle={toggle} icon="edit" title={t('الوصف', 'Description')}>
            <BiText
              label={t('الوصف', 'Description')}
              value={p.description ?? emptyBi()}
              onChange={(description) => setP({ ...p, description })}
              minHeight={120}
            />
          </Drawer>
        </aside>
      </div>

      {toast && <div className="toast">{t('تم الحفظ ✓', 'Saved ✓')}</div>}

      {published && (
        <div className="modal-overlay" onClick={() => setPublished(false)}>
          <div className="modal done-modal" onClick={(e) => e.stopPropagation()}>
            <div className="done-icon">
              <NavIcon id="publish" size={26} />
            </div>
            <h3>{t('تم النشر ✓', 'Published ✓')}</h3>
            <p>{t('المشروع بقى ظاهر على موقعك.', 'The project is now live on your site.')}</p>
            <div className="done-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  router.push('/dashboard/projects')
                  router.refresh()
                }}
              >
                {t('كل المشاريع', 'All projects')}
              </button>
              <button className="btn btn-ghost" onClick={() => setPublished(false)}>
                {t('أكمل التعديل', 'Keep editing')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * One section of the rail. Opening one closes whatever was open: with every
 * panel expanded the rail ran past the bottom of the window and scrolled
 * against the page behind it, which is the fight the drawers avoid.
 */
function Drawer({
  id,
  open,
  onToggle,
  title,
  icon,
  children,
}: {
  id: string
  open: string | null
  onToggle: (id: string) => void
  title: string
  icon: string
  children: React.ReactNode
}) {
  const isOpen = open === id
  return (
    <section className={`drawer${isOpen ? ' open' : ''}`}>
      <button type="button" className="drawer-head" onClick={() => onToggle(id)} aria-expanded={isOpen}>
        <NavIcon id={icon} size={15} />
        <span className="drawer-title">{title}</span>
        <span className="drawer-chev" aria-hidden>
          <NavIcon id="down" size={14} />
        </span>
      </button>
      {isOpen && <div className="drawer-body">{children}</div>}
    </section>
  )
}
