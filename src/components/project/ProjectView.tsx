'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { resolveVideoUrl } from '@/lib/video'

export type Mod =
  | { type: 'text'; textType: 'h1' | 'h2' | 'p'; value: string }
  | { type: 'image'; src: string | null }
  | { type: 'grid'; items: { src: string; ar: number }[] }
  | { type: 'carousel'; items: string[] }
  | { type: 'video'; embedUrl: string }
  | {
      type: 'beforeafter'
      before: string | null
      after: string | null
      labelBefore?: string | null
      labelAfter?: string | null
    }
  | { type: 'separator'; spacing: 'compact' | 'normal' | 'large' }

export type SerializedProject = {
  title: string
  category?: string | null
  description?: string | null
  projectType: 'grid' | 'free' | 'stacked'
  cover?: string | null
  images: string[]
  modules: Mod[]
}

/* ── Before/after slider ─────────────────────────────────────────────── */
function BeforeAfter({
  before,
  after,
  labelBefore,
  labelAfter,
}: {
  before: string
  after: string
  labelBefore?: string | null
  labelAfter?: string | null
}) {
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef(false)

  const move = useCallback((clientX: number) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }, [])

  useEffect(() => {
    const up = () => (drag.current = false)
    const mm = (e: MouseEvent) => drag.current && move(e.clientX)
    const tm = (e: TouchEvent) => drag.current && move(e.touches[0].clientX)
    window.addEventListener('mouseup', up)
    window.addEventListener('mousemove', mm)
    window.addEventListener('touchmove', tm)
    return () => {
      window.removeEventListener('mouseup', up)
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('touchmove', tm)
    }
  }, [move])

  return (
    <div
      className="ba"
      ref={ref}
      onMouseDown={(e) => {
        drag.current = true
        move(e.clientX)
      }}
      onTouchStart={(e) => {
        drag.current = true
        move(e.touches[0].clientX)
      }}
    >
      {/* `before` sizes the box at its natural height (no crop). The two images
          must share the same dimensions. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ba-before" src={before} alt="before" draggable={false} />
      {/* `after` overlays exactly and is revealed left→right by a moving clip —
          the image itself never shifts or scales. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="ba-after"
        src={after}
        alt="after"
        draggable={false}
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <div className="handle" style={{ left: `${pos}%` }} />
      {labelBefore && (
        <span className="ba-label" style={{ insetInlineStart: 12 }}>
          {labelBefore}
        </span>
      )}
      {labelAfter && (
        <span className="ba-label" style={{ insetInlineEnd: 12 }}>
          {labelAfter}
        </span>
      )}
    </div>
  )
}

/* ── Carousel: centred image, sides show a blurred peek of the prev/next ──── */
function Carousel({ images, onOpen }: { images: string[]; onOpen: (src: string) => void }) {
  const [idx, setIdx] = useState(0)
  if (images.length === 0) return null
  const n = images.length
  const go = (d: number) => setIdx((i) => (i + d + n) % n)
  const prevSrc = n > 1 ? images[(idx - 1 + n) % n] : null
  const nextSrc = n > 1 ? images[(idx + 1) % n] : null
  return (
    <div className="mod-carousel">
      <div className="mc-viewport">
        {/* Blurred peek of the previous (start side) and next (end side) images. */}
        {prevSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="mc-side mc-side-start" src={prevSrc} alt="" aria-hidden="true" />
        )}
        {nextSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="mc-side mc-side-end" src={nextSrc} alt="" aria-hidden="true" />
        )}
        {/* Sharp current image, cross-fading. */}
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            className={`mc-fg${i === idx ? ' active' : ''}`}
            src={src}
            alt=""
            loading="lazy"
            onClick={() => onOpen(src)}
          />
        ))}
        {n > 1 && (
          <>
            <button className="mc-arrow mc-prev" onClick={() => go(-1)} aria-label="previous">
              ‹
            </button>
            <button className="mc-arrow mc-next" onClick={() => go(1)} aria-label="next">
              ›
            </button>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="mc-dots">
          {images.map((_, i) => (
            <span
              key={i}
              className={i === idx ? 'on' : ''}
              onClick={() => setIdx(i)}
              role="button"
              aria-label={`slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjectView({ project }: { project: SerializedProject }) {
  const [lb, setLb] = useState<number | null>(null)
  const gallery = useRef<string[]>([])

  // Build the lightbox gallery from images + image/grid modules.
  gallery.current = [
    ...project.images,
    ...project.modules.flatMap((m) =>
      m.type === 'image' && m.src
        ? [m.src]
        : m.type === 'grid'
          ? m.items.map((it) => it.src)
          : m.type === 'carousel'
            ? m.items
            : [],
    ),
  ]

  const open = (src: string) => {
    const i = gallery.current.indexOf(src)
    setLb(i >= 0 ? i : 0)
  }
  const nav = (d: number) =>
    setLb((c) => (c === null ? c : (c + d + gallery.current.length) % gallery.current.length))

  useEffect(() => {
    if (lb === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLb(null)
      if (e.key === 'ArrowRight') nav(1)
      if (e.key === 'ArrowLeft') nav(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lb])

  return (
    <div className="detail">
      <div className="detail-nav">
        <button className="detail-back" onClick={() => history.back()}>
          ← Back
        </button>
      </div>

      {project.projectType === 'stacked' && project.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="detail-banner" src={project.cover} alt={project.title} />
      )}

      <div className="detail-head">
        {project.category && <div className="detail-cat">{project.category}</div>}
        <h1>{project.title}</h1>
        {project.description && (
          <p style={{ color: 'var(--sub)', lineHeight: 1.9 }}>{project.description}</p>
        )}
      </div>

      {/* GRID layout — 3-col gallery */}
      {project.projectType === 'grid' && (
        <div className="mod-wrap">
          <div className="detail-grid">
            {(project.images.length ? project.images : project.cover ? [project.cover] : []).map(
              (src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" loading="lazy" onClick={() => open(src)} />
              ),
            )}
          </div>
        </div>
      )}

      {/* STACKED layout — full-width images */}
      {project.projectType === 'stacked' && (
        <div className="mod-wrap stack">
          {project.images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" loading="lazy" onClick={() => open(src)} />
          ))}
        </div>
      )}

      {/* FREE layout — the module page builder */}
      {project.projectType === 'free' && (
        <div className="mod-wrap">
          {project.modules.map((m, i) => {
            switch (m.type) {
              case 'text':
                if (m.textType === 'h1') return <h1 className="mod-h1" key={i}>{m.value}</h1>
                if (m.textType === 'h2') return <h2 className="mod-h2" key={i}>{m.value}</h2>
                return <p className="mod-p" key={i}>{m.value}</p>
              case 'image':
                return m.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="mod-img" key={i} src={m.src} alt="" loading="lazy" onClick={() => open(m.src!)} />
                ) : null
              case 'grid':
                return (
                  <div className="mod-row" key={i}>
                    {m.items.map((it, j) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={j}
                        src={it.src}
                        alt=""
                        loading="lazy"
                        // flex-grow ∝ aspect ratio → all images in the row share one
                        // height, widths proportional, and the row fills the container.
                        style={{ flexGrow: it.ar }}
                        onClick={() => open(it.src)}
                      />
                    ))}
                  </div>
                )
              case 'carousel':
                return <Carousel key={i} images={m.items} onOpen={open} />
              case 'video': {
                const v = resolveVideoUrl(m.embedUrl)
                if (!v) return null
                return (
                  <div className="mod-video" key={i}>
                    {v.kind === 'file' ? (
                      <video src={v.url} controls playsInline preload="metadata" />
                    ) : (
                      <iframe
                        src={v.url}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`video-${i}`}
                      />
                    )}
                  </div>
                )
              }
              case 'beforeafter':
                return m.before && m.after ? (
                  <BeforeAfter
                    key={i}
                    before={m.before}
                    after={m.after}
                    labelBefore={m.labelBefore}
                    labelAfter={m.labelAfter}
                  />
                ) : null
              case 'separator':
                return <hr className={`mod-sep ${m.spacing}`} key={i} />
              default:
                return null
            }
          })}
        </div>
      )}

      {/* Lightbox */}
      {lb !== null && gallery.current[lb] && (
        <div className="lightbox" onClick={() => setLb(null)}>
          <button className="lb-btn lb-close" onClick={() => setLb(null)}>
            ✕
          </button>
          {gallery.current.length > 1 && (
            <>
              <button
                className="lb-btn lb-prev"
                onClick={(e) => {
                  e.stopPropagation()
                  nav(-1)
                }}
              >
                ‹
              </button>
              <button
                className="lb-btn lb-next"
                onClick={(e) => {
                  e.stopPropagation()
                  nav(1)
                }}
              >
                ›
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gallery.current[lb]} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
