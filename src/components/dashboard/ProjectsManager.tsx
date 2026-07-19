'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import NavIcon from './icons'
import { useDashLang } from './DashLang'
import ProjectEditor, { type EditableProject } from './ProjectEditor'
import NewProjectWizard from './NewProjectWizard'
import CategoriesModal from './CategoriesModal'
import {
  deleteProject,
  reorderProjects,
  saveGridCols,
  setProjectPublished,
  importFromBehance,
} from '@/lib/project-actions'
import BehanceImportModal from './BehanceImportModal'

export type ProjectRow = EditableProject & { id: number }

export type GridCols = {
  imageMobile: number
  imageTablet: number
  imageDesktop: number
  videoMobile: number
  videoTablet: number
  videoDesktop: number
}

const TABS = [
  { id: 'designs', ar: 'التصاميم', en: 'Designs' },
  { id: 'reels', ar: 'الريلز', en: 'Reels' },
  { id: 'videos', ar: 'الفيديوهات', en: 'Videos' },
] as const

type TabId = (typeof TABS)[number]['id']

function tabOf(p: ProjectRow): TabId {
  if (p.mediaType === 'image') return 'designs'
  return p.videoKind === 'video' ? 'videos' : 'reels'
}

// Column-count limits per breakpoint (max is generous; min is always 1).
const COL_MAX = { desktop: 6, tablet: 4, mobile: 3 } as const

export default function ProjectsManager({
  projects,
  categories,
  categoriesImage,
  categoriesVideo,
  gridCols,
}: {
  projects: ProjectRow[]
  categories: string[]
  categoriesImage: string[]
  categoriesVideo: string[]
  gridCols: GridCols
}) {
  const router = useRouter()
  const { t: tr } = useDashLang()
  const [tab, setTab] = useState<TabId>('designs')
  const [cat, setCat] = useState('all')
  const [editing, setEditing] = useState<EditableProject | null>(null)
  const [wizard, setWizard] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importing, setImporting] = useState(false)

  // Returning from the Behance bookmarklet: /dashboard/projects?bh=<token>
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('bh')
    if (!token || importing) return
    setImporting(true)
    window.history.replaceState({}, '', '/dashboard/projects')
    importFromBehance(token)
      .then((r) => {
        if (r.ok && r.id) {
          router.push(`/dashboard/projects/${r.id}/editor`)
        } else {
          alert(tr('فشل الاستيراد — الرابط منتهي أو مفيش محتوى.', 'Import failed — the link expired or had no content.'))
          setImporting(false)
        }
      })
      .catch(() => {
        alert(tr('حصل خطأ أثناء الاستيراد.', 'Something went wrong during import.'))
        setImporting(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Local, reorderable copy of the projects (optimistic drag-and-drop).
  const [items, setItems] = useState<ProjectRow[]>(projects)
  useEffect(() => setItems(projects), [projects])

  // Local column config (persisted to site-settings, debounced).
  const [cols, setCols] = useState<GridCols>(gridCols)
  useEffect(() => setCols(gridCols), [gridCols])
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dragId = useRef<number | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)

  const visible = useMemo(
    () => items.filter((p) => tabOf(p) === tab && (cat === 'all' || p.category === cat)),
    [items, tab, cat],
  )

  async function remove(id: number) {
    if (!confirm(tr('حذف المشروع؟', 'Delete this project?'))) return
    await deleteProject(id)
    router.refresh()
  }

  // Publish / unpublish (draft) — optimistic, persisted immediately.
  async function togglePublish(id: number, next: boolean) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, published: next } : p)))
    try {
      await setProjectPublished(id, next)
    } catch {
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, published: !next } : p)))
      alert(tr('تعذّر تغيير الحالة', 'Could not change status'))
    }
  }

  // ── Drag-and-drop reorder ─────────────────────────────────────────────────
  function onDragOver(e: React.DragEvent, overId: number) {
    e.preventDefault()
    const src = dragId.current
    if (src == null || src === overId) return
    setItems((prev) => {
      const from = prev.findIndex((p) => p.id === src)
      const to = prev.findIndex((p) => p.id === overId)
      if (from === -1 || to === -1 || from === to) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  async function commitOrder() {
    dragId.current = null
    setDragging(null)
    // Persist the full order → sortOrder is assigned across all projects.
    await reorderProjects(items.map((p) => p.id))
  }

  // ── Columns control ───────────────────────────────────────────────────────
  const isVideo = tab !== 'designs'
  const colFields = isVideo
    ? (['videoDesktop', 'videoTablet', 'videoMobile'] as const)
    : (['imageDesktop', 'imageTablet', 'imageMobile'] as const)
  const bps = [
    { key: colFields[0], ar: 'كمبيوتر', en: 'Desktop', icon: 'monitor', max: COL_MAX.desktop },
    { key: colFields[1], ar: 'تابلت', en: 'Tablet', icon: 'tablet', max: COL_MAX.tablet },
    { key: colFields[2], ar: 'موبايل', en: 'Mobile', icon: 'phone', max: COL_MAX.mobile },
  ]

  function setCol(key: keyof GridCols, value: number) {
    setCols((c) => ({ ...c, [key]: value }))
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveGridCols({ [key]: value } as Partial<GridCols>)
    }, 400)
  }

  return (
    <div>
      <PageHeader
        icon="🗂️"
        title={tr('المشاريع', 'Projects')}
        subtitle={tr('أضِف وعدّل أعمالك — صور، ريلز، وفيديوهات', 'Add and edit your work — images, reels and videos')}
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setImportOpen(true)}>
              <NavIcon id="upload" size={16} />
              {tr('استيراد من Behance', 'Import from Behance')}
            </button>
            <button className="btn btn-ghost" onClick={() => setCatsOpen(true)}>
              <NavIcon id="categories" size={16} />
              {tr('التصنيفات', 'Categories')}
            </button>
            <button className="btn btn-primary" onClick={() => setWizard(true)}>
              <NavIcon id="plus" size={16} />
              {tr('مشروع جديد', 'New project')}
            </button>
          </>
        }
      />

      {importing && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 360, textAlign: 'center', padding: 30 }}>
            <strong>{tr('جاري الاستيراد من Behance…', 'Importing from Behance…')}</strong>
            <p style={{ color: 'var(--sub)', marginTop: 10 }}>{tr('بنرفع الصور ونجهّز المشروع، استنى شوية.', 'Uploading images and building the project — one moment.')}</p>
          </div>
        </div>
      )}

      <div className="filter-tabs">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            className={`ftab ${tab === tb.id ? 'active' : ''}`}
            onClick={() => {
              setTab(tb.id)
              setCat('all')
            }}
          >
            {tr(tb.ar, tb.en)}
          </button>
        ))}
      </div>

      {/* Items-per-row control */}
      <div className="panel cols-control">
        <div className="cols-control-head">
          <span>{tr('عدد العناصر في الصف', 'Items per row')}</span>
        </div>
        <div className="cols-sliders">
          {bps.map((b) => (
            <label className="cols-slider" key={b.key}>
              <span className="cols-slider-val">{cols[b.key]}</span>
              <input
                type="range"
                min={1}
                max={b.max}
                value={cols[b.key]}
                onChange={(e) => setCol(b.key, Number(e.target.value))}
              />
              <span className="cols-slider-label">
                <NavIcon id={b.icon} size={15} /> {tr(b.ar, b.en)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="cat-pills">
        <button className={`pill ${cat === 'all' ? 'active' : ''}`} onClick={() => setCat('all')}>
          {tr('الكل', 'All')}
        </button>
        {categories.map((c) => (
          <button key={c} className={`pill ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 50, color: 'var(--sub)' }}>
          {tr('لا توجد مشاريع في هذا القسم — اضغط «مشروع جديد».', 'No projects in this section — click “New project”.')}
        </div>
      ) : (
        <>
          {visible.length > 1 && (
            <div className="reorder-hint">
              {tr('اسحب أي مشروع لتغيير ترتيبه — يُحفظ تلقائياً', 'Drag any project to reorder — saved automatically')}
            </div>
          )}
          <div
            className="proj-manage-grid"
            style={
              {
                // Match the public site: same columns + cover ratio as the live grid.
                '--pm-cols': isVideo ? cols.videoDesktop : cols.imageDesktop,
                '--pm-cols-t': isVideo ? cols.videoTablet : cols.imageTablet,
                '--pm-cols-m': isVideo ? cols.videoMobile : cols.imageMobile,
                // Match the site's per-tab cover ratio: designs 4/3, reels 9/16, videos 16/9.
                '--pm-ratio': tab === 'reels' ? '9 / 16' : tab === 'videos' ? '16 / 9' : '4 / 3',
              } as React.CSSProperties
            }
          >
            {visible.map((p) => (
              <div
                className={`proj-manage-card${dragging === p.id ? ' dragging' : ''}`}
                key={p.id}
                draggable
                onDragStart={() => {
                  dragId.current = p.id
                  setDragging(p.id)
                }}
                onDragOver={(e) => onDragOver(e, p.id)}
                onDragEnd={commitOrder}
                onDrop={(e) => {
                  e.preventDefault()
                  commitOrder()
                }}
              >
                <div className="pm-cover">
                  {p.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverUrl} alt={p.title} draggable={false} />
                  ) : (
                    <span className="pm-nocover">
                      <NavIcon id="image" size={30} />
                    </span>
                  )}

                  {/* media-type badge (top-start) */}
                  <span className="pm-type" title={p.mediaType === 'video' ? tr('فيديو', 'Video') : tr('صورة', 'Image')}>
                    <NavIcon id={p.mediaType === 'video' ? 'video' : 'image'} size={15} />
                  </span>
                  {p.published === false && <span className="pm-draft">{tr('مسودة', 'Draft')}</span>}

                  {/* title + category overlaid on the cover */}
                  <div className="pm-overlay">
                    <strong>{p.title}</strong>
                    {p.category && <span>{p.category}</span>}
                  </div>

                  {/* hover toolbar */}
                  <div className="pm-actions">
                    <button
                      className={`icon-btn ${p.published === false ? 'pub-off' : ''}`}
                      title={p.published === false ? tr('نشر المشروع', 'Publish') : tr('إخفاء (مسودة)', 'Hide (draft)')}
                      onClick={() => togglePublish(p.id, p.published === false)}
                    >
                      <NavIcon id={p.published === false ? 'eyeOff' : 'eye'} size={15} />
                    </button>
                    <button
                      className="icon-btn"
                      title={tr('تعديل', 'Edit')}
                      onClick={() =>
                        p.projectType === 'free'
                          ? router.push(`/dashboard/projects/${p.id}/editor`)
                          : setEditing(p)
                      }
                    >
                      <NavIcon id="edit" size={15} />
                    </button>
                    <button className="icon-btn del" title={tr('حذف', 'Delete')} onClick={() => remove(p.id)}>
                      <NavIcon id="trash" size={15} />
                    </button>
                    <span className="pm-drag" title={tr('اسحب للترتيب', 'Drag to reorder')}>
                      <NavIcon id="grip" size={15} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {wizard && (
        <NewProjectWizard
          onClose={() => setWizard(false)}
          onPickModal={(blank) => {
            setWizard(false)
            setEditing(blank)
          }}
        />
      )}

      {editing && (
        <ProjectEditor
          initial={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            router.refresh()
          }}
        />
      )}

      {importOpen && <BehanceImportModal onClose={() => setImportOpen(false)} />}

      {catsOpen && (
        <CategoriesModal
          initialImage={categoriesImage}
          initialVideo={categoriesVideo}
          onClose={() => setCatsOpen(false)}
          onSaved={() => {
            setCatsOpen(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
