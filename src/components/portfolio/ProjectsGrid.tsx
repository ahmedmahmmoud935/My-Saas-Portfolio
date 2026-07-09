'use client'

import React, { useMemo, useState } from 'react'
import ReelsPlayer, { type Reel } from './ReelsPlayer'

export type ProjectCard = {
  id: number
  title: string
  category?: string | null
  coverUrl?: string | null
  mediaType: 'image' | 'video'
  videoKind?: 'reel' | 'video' | null
  videoUrl?: string | null
}

type TabId = 'designs' | 'reels' | 'videos'

export default function ProjectsGrid({
  title,
  subtitle,
  imageCategories,
  videoCategories,
  projects,
  username,
  tabLabels,
}: {
  title: string
  subtitle?: string
  imageCategories: string[]
  videoCategories: string[]
  projects: ProjectCard[]
  username: string
  tabLabels?: Partial<Record<TabId, string>>
}) {
  const groups: Record<TabId, ProjectCard[]> = {
    designs: projects.filter((p) => p.mediaType === 'image'),
    reels: projects.filter((p) => p.mediaType === 'video' && p.videoKind !== 'video'),
    videos: projects.filter((p) => p.mediaType === 'video' && p.videoKind === 'video'),
  }
  const tabs = (['designs', 'reels', 'videos'] as TabId[]).filter((t) => groups[t].length > 0)
  const defaultLabels: Record<TabId, string> = { designs: 'التصاميم', reels: 'الريلز', videos: 'الفيديوهات' }

  const [tab, setTab] = useState<TabId>(tabs[0] ?? 'designs')
  const [cat, setCat] = useState('all')
  const [player, setPlayer] = useState<{ reels: Reel[]; start: number } | null>(null)

  const activeTab = tabs.includes(tab) ? tab : tabs[0] ?? 'designs'
  const cats = activeTab === 'designs' ? imageCategories : videoCategories
  const list = useMemo(
    () => groups[activeTab].filter((p) => cat === 'all' || p.category === cat),
    [activeTab, cat, projects],
  )

  const gridClass =
    activeTab === 'reels' ? 'project-grid reels-grid' : activeTab === 'videos' ? 'project-grid videos-grid' : 'project-grid'

  const openVideo = (clicked: ProjectCard) => {
    const reels: Reel[] = groups[activeTab].map((p) => ({ id: p.id, title: p.title, videoUrl: p.videoUrl, coverUrl: p.coverUrl }))
    const start = Math.max(0, reels.findIndex((r) => r.id === clicked.id))
    setPlayer({ reels, start })
  }

  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-sub">{subtitle}</p>}
        </div>

        {tabs.length > 1 && (
          <div className="filter-bar">
            {tabs.map((t) => (
              <button
                key={t}
                className={`filter-pill ${activeTab === t ? 'active' : ''}`}
                onClick={() => { setTab(t); setCat('all') }}
              >
                {tabLabels?.[t] || defaultLabels[t]}
              </button>
            ))}
          </div>
        )}

        {cats.length > 0 && (
          <div className="filter-bar">
            <button className={`filter-pill ${cat === 'all' ? 'active' : ''}`} onClick={() => setCat('all')}>
              All
            </button>
            {cats.map((c) => (
              <button key={c} className={`filter-pill ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        <div className={gridClass}>
          {list.map((p) => {
            const inner = (
              <>
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt={p.title} loading="lazy" decoding="async" />
                ) : null}
                {p.mediaType === 'video' && <span className="play-badge">▶</span>}
                <div className="project-ov">
                  <h4>{p.title}</h4>
                  {p.category && <span>{p.category}</span>}
                </div>
              </>
            )
            return p.mediaType === 'video' ? (
              <button className="project-card" key={p.id} onClick={() => openVideo(p)}>
                {inner}
              </button>
            ) : (
              <a className="project-card" key={p.id} href={`/${username}/project/${p.id}`}>
                {inner}
              </a>
            )
          })}
        </div>
      </div>

      {player && <ReelsPlayer reels={player.reels} start={player.start} onClose={() => setPlayer(null)} />}
    </section>
  )
}
