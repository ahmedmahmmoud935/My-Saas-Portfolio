'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import ProjectEditor, { type EditableProject } from './ProjectEditor'
import { deleteProject } from '@/lib/project-actions'

export type ProjectRow = EditableProject & { id: number }

const TABS = [
  { id: 'designs', label: 'التصاميم' },
  { id: 'reels', label: 'الريلز' },
  { id: 'videos', label: 'الفيديوهات' },
] as const

function tabOf(p: ProjectRow): (typeof TABS)[number]['id'] {
  if (p.mediaType === 'image') return 'designs'
  return p.videoKind === 'video' ? 'videos' : 'reels'
}

export default function ProjectsManager({
  projects,
  categories,
}: {
  projects: ProjectRow[]
  categories: string[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('designs')
  const [cat, setCat] = useState('all')
  const [editing, setEditing] = useState<EditableProject | null>(null)

  const visible = useMemo(
    () =>
      projects.filter((p) => tabOf(p) === tab && (cat === 'all' || p.category === cat)),
    [projects, tab, cat],
  )

  async function remove(id: number) {
    if (!confirm('حذف المشروع؟')) return
    await deleteProject(id)
    router.refresh()
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

      <div className="cat-pills">
        <button className={`pill ${cat === 'all' ? 'active' : ''}`} onClick={() => setCat('all')}>
          الكل
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`pill ${cat === c ? 'active' : ''}`}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 50, color: 'var(--sub)' }}>
          لا توجد مشاريع في هذا القسم — اضغط «مشروع جديد».
        </div>
      ) : (
        <div className="proj-manage-grid">
          {visible.map((p) => (
            <div className="proj-manage-card" key={p.id}>
              <div className="pm-cover">
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt={p.title} />
                ) : (
                  <span style={{ color: 'var(--sub)' }}>لا غلاف</span>
                )}
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
