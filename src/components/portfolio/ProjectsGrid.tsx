'use client'

import React, { useMemo, useState } from 'react'

export type ProjectCard = {
  id: number
  title: string
  category?: string | null
  coverUrl?: string | null
}

export default function ProjectsGrid({
  title,
  subtitle,
  categories,
  projects,
  username,
}: {
  title: string
  subtitle?: string
  categories: string[]
  projects: ProjectCard[]
  username: string
}) {
  const [active, setActive] = useState<string>('all')

  const filtered = useMemo(
    () => (active === 'all' ? projects : projects.filter((p) => p.category === active)),
    [active, projects],
  )

  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-sub">{subtitle}</p>}
        </div>

        {categories.length > 0 && (
          <div className="filter-bar">
            <button
              className={`filter-pill ${active === 'all' ? 'active' : ''}`}
              onClick={() => setActive('all')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={`filter-pill ${active === c ? 'active' : ''}`}
                onClick={() => setActive(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="project-grid">
          {filtered.map((p) => (
            <a className="project-card" key={p.id} href={`/${username}/project/${p.id}`}>
              {p.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverUrl} alt={p.title} loading="lazy" decoding="async" />
              ) : null}
              <div className="project-ov">
                <h4>{p.title}</h4>
                {p.category && <span>{p.category}</span>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
