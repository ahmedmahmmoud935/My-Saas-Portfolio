'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import ProjectEditor, { type EditableProject } from './ProjectEditor'
import { deleteProject, reorderProjects, saveGridCols } from '@/lib/project-actions'

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
  { id: 'designs', label: 'التصاميم' },
  { id: 'reels', label: 'الريلز' },
  { id: 'videos', label: 'الفيديوهات' },
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
  gridCols,
}: {
  projects: ProjectRow[]
  categories: string[]
  gridCols: GridCols
}) {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>('designs')
  const [cat, setCat] = useState('all')
  const [editing, setEditing] = useState<EditableProject | null>(null)

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
    if (!confirm('حذف المشروع؟')) return
    await deleteProject(id)
    router.refresh()
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
    { key: colFields[0], label: 'كمبيوتر', icon: '🖥️', max: COL_MAX.desktop },
    { key: colFields[1], label: 'تابلت', icon: '📱', max: COL_MAX.tablet },
    { key: colFields[2], label: 'موبايل', icon: '📲', max: COL_MAX.mobile },
  ]

  function setCol(key: keyof GridCols, value: number) {
    setCols((c) => ({ ...c, [key]: value }))
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveGridCols({ [key]: value } as Partial<GridCols>)
    }, 400)
  }

  const blank: EditableProject = {
    title: '',
    mediaType: tab === 'designs' ? 'image' : 'video',
    projectType: 'grid',
    videoKind: tab === 'videos' ? 'video' : 'reel',
    aspectRatio: tab === 'videos' ? '16:9' : '9:16',
    images: [],
  }

  return (
    <div>
      <PageHeader
        icon="🗂️"
        title="المشاريع"
        subtitle="أضِف وعدّل أعمالك — صور، ريلز، وفيديوهات"
        actions={
          <button className="btn btn-primary" onClick={() => setEditing(blank)}>
            + مشروع جديد
          </button>
        }
      />

      <div className="filter-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`ftab ${tab === t.id ? 'active' : ''}`}
            onClick={() => {
              setTab(t.id)
              setCat('all')
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Items-per-row control */}
      <div className="panel cols-control">
        <div className="cols-control-head">
          <span>📐 عدد العناصر في الصف</span>
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
                {b.icon} {b.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="cat-pills">
        <button className={`pill ${cat === 'all' ? 'active' : ''}`} onClick={() => setCat('all')}>
          الكل
        </button>
        {categories.map((c) => (
          <button key={c} className={`pill ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 50, color: 'var(--sub)' }}>
          لا توجد مشاريع في هذا القسم — اضغط «مشروع جديد».
        </div>
      ) : (
        <>
          {visible.length > 1 && (
            <div className="reorder-hint">↔︎ اسحب أي مشروع لتغيير ترتيبه — يُحفظ تلقائياً</div>
          )}
          <div className="proj-manage-grid">
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
                    <span style={{ color: 'var(--sub)' }}>لا غلاف</span>
                  )}
                  <span className="pm-drag" title="اسحب للترتيب">
                    ⠿
                  </span>
                </div>
                <div className="pm-body">
                  <strong>{p.title}</strong>
                  <span>{p.category || '—'}</span>
                </div>
                <div className="pm-actions">
                  <button className="icon-btn" onClick={() => setEditing(p)}>
                    ✏️
                  </button>
                  <button className="icon-btn del" onClick={() => remove(p.id)}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
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
    </div>
  )
}
