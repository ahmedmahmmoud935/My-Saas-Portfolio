'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './icons'
import type { StudioData, StudioProject, WorkType } from '@/lib/studio-data'

/**
 * "Selected work": the type tabs, the category filters, the grid, and the
 * project window — the reference's own behaviour. A cover or caption opens the
 * project over the page (a <dialog>), with previous / next through what is
 * filtered and a button to the project's full page.
 */
export default function StudioWork({ work, ui, isEn }: { work: NonNullable<StudioData['work']>; ui: StudioData['ui']; isEn: boolean }) {
  const [type, setType] = useState<WorkType>(work.tabs[0]?.id ?? 'designs')
  const [cat, setCat] = useState('all')
  const [open, setOpen] = useState<StudioProject | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  const list = useMemo(
    () => work.projects.filter((p) => p.type === type && (cat === 'all' || p.category === cat)),
    [work.projects, type, cat],
  )
  const cats = work.categories[type]

  useEffect(() => {
    if (open) dialog.current?.showModal()
    else dialog.current?.close()
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => {
    setOpen(null)
    opener.current?.focus()
  }
  const step = (d: number) => {
    if (!open) return
    const i = list.findIndex((p) => p.id === open.id)
    setOpen(list[(i + d + list.length) % list.length])
    dialog.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const show = (p: StudioProject) => (e: React.MouseEvent<HTMLElement>) => {
    opener.current = e.currentTarget
    setOpen(p)
  }

  return (
    <section className="st-work-section st-section" id="work">
      <div className="st-shell">
        <div className="st-work-heading">
          <div className="st-section-title">
            <h2>{work.title}</h2>
            {work.subtitle && <p className="st-section-subtitle">{work.subtitle}</p>}
          </div>
        </div>
        {work.tabs.length > 1 && (
          <div className="st-work-toolbar">
            <div className="st-type-tabs" role="group" aria-label={ui.typesLabel}>
              {work.tabs.map((t) => (
                <button
                  key={t.id}
                  aria-pressed={type === t.id}
                  className={type === t.id ? 'st-active' : ''}
                  onClick={() => {
                    setType(t.id)
                    setCat('all')
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {cats.length > 0 && (
          <div className="st-category-filters" role="group" aria-label={ui.catsLabel}>
            {[{ id: 'all', label: ui.all }, ...cats].map((c) => (
              <button key={c.id} aria-pressed={cat === c.id} className={cat === c.id ? 'st-active' : ''} onClick={() => setCat(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        )}
        <div className={`st-project-grid st-grid-${type}`} aria-live="polite">
          {list.map((p) => (
            <article className="st-project-card" key={p.id}>
              <button className="st-project-cover" aria-label={`${ui.view}: ${p.title}`} onClick={show(p)}>
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt={p.title} loading="lazy" width={600} height={600} />
                ) : null}
                {p.type !== 'designs' && (
                  <span className="st-play-mark">
                    <Icon name="play" size={22} fill="currentColor" />
                  </span>
                )}
                <span className="st-project-open">
                  <Icon name="arrow-up-right" size={23} />
                </span>
              </button>
              <div className="st-project-caption">
                <button onClick={show(p)}>
                  {p.title}
                  <Icon name="arrow-up-right" size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {!list.length && <p className="st-empty-state">{ui.empty}</p>}
        {work.more && (
          <div className="st-work-footer">
            <a href={work.more.href} target="_blank" rel="noopener noreferrer">
              {work.more.label}
              <Icon name="arrow-up-right" size={17} />
            </a>
          </div>
        )}
      </div>

      <dialog
        className="st-project-dialog"
        ref={dialog}
        onCancel={close}
        onClick={(e) => e.target === e.currentTarget && close()}
        aria-labelledby="st-project-title"
      >
        {open && (
          <div className="st-dialog-content">
            <button className="st-dialog-close st-icon-button" onClick={close} aria-label={ui.close}>
              <Icon name="x" size={23} />
            </button>
            <div className={`st-dialog-media ${open.type === 'reels' ? 'st-reel' : ''}`}>
              {open.video?.kind === 'iframe' ? (
                <iframe src={open.video.url} title={open.title} allow="fullscreen; picture-in-picture; autoplay" allowFullScreen />
              ) : open.video?.kind === 'file' ? (
                <video src={open.video.url} controls playsInline style={{ maxHeight: '70dvh', maxWidth: '100%' }} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={open.coverUrl} alt={open.title} />
              )}
            </div>
            <div className="st-dialog-body">
              <h2 id="st-project-title">{open.title}</h2>
              <div className="st-dialog-actions">
                <a className="st-button st-primary st-small" href={open.pageHref}>
                  {ui.projectSource}
                  <Icon name="external-link" size={15} />
                </a>
                {list.length > 1 && (
                  <div className="st-dialog-nav">
                    <button className="st-icon-button" aria-label={ui.previous} onClick={() => step(-1)}>
                      <Icon name={isEn ? 'arrow-left' : 'arrow-right'} size={18} />
                    </button>
                    <span dir="ltr">
                      {list.findIndex((p) => p.id === open.id) + 1} / {list.length}
                    </span>
                    <button className="st-icon-button" aria-label={ui.next} onClick={() => step(1)}>
                      <Icon name={isEn ? 'arrow-right' : 'arrow-left'} size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}
