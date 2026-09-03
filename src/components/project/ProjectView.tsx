'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Carousel from '@/components/shared/Carousel'
import HtmlEmbed from '@/components/shared/HtmlEmbed'
import { isEmbeddablePage, recoverEscapedHtml } from '@/lib/html-embed'
import { resolveVideoUrl } from '@/lib/video'

export type Mod =
  | { type: 'text'; textType: 'h1' | 'h2' | 'p'; value: string }
  | { type: 'image'; src: string | null }
  | { type: 'grid'; items: { src: string; ar: number }[]; mobileCols?: number }
  | { type: 'carousel'; items: string[]; ratio?: number | null }
  | { type: 'video'; embedUrl: string; poster?: string | null }
  | {
      type: 'beforeafter'
      before: string | null
      after: string | null
      labelBefore?: string | null
      labelAfter?: string | null
    }
  | { type: 'separator'; spacing: 'compact' | 'normal' | 'large' }

/** A picture plus the size it was stored at, so the browser can reserve room. */
export type Pic = { src: string; w?: number | null; h?: number | null }

export type SerializedProject = {
  title: string
  category?: string | null
  description?: string | null
  projectType: 'grid' | 'free' | 'stacked'
  cover?: string | null
  images: Pic[]
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

const ChevronL = (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
)
const ChevronR = (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 6l6 6-6 6" /></svg>
)
const CloseIcon = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
)

export default function ProjectView({ project }: { project: SerializedProject }) {
  const [lb, setLb] = useState<number | null>(null)
  const touchX = useRef<number | null>(null)
  const gallery = useRef<string[]>([])

  // Build the lightbox gallery from images + image/grid modules.
  gallery.current = [
    ...project.images.map((p) => p.src),
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
          <div
            className="mod-rich"
            style={{ color: 'var(--sub)', lineHeight: 1.9 }}
            // Same rich editor as the text modules — HTML, or legacy plain text.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: /<[a-z][\s\S]*>/i.test(project.description)
                ? project.description
                : project.description.replace(/\n/g, '<br />'),
            }}
          />
        )}
      </div>

      {/* GRID layout — 3-col gallery */}
      {project.projectType === 'grid' && (
        <div className="mod-wrap">
          <div className="detail-grid">
            {(project.images.length
              ? project.images
              : project.cover
                ? [{ src: project.cover } as Pic]
                : []
            ).map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={p.src}
                alt={`${project.title} — ${i + 1}`}
                // The size it was stored at. Without it the browser cannot
                // reserve the space and the page jumps as each picture lands —
                // the shift search engines measure as CLS.
                width={p.w ?? undefined}
                height={p.h ?? undefined}
                loading="lazy"
                onClick={() => open(p.src)}
              />
            ))}
          </div>
        </div>
      )}

      {/* STACKED layout — full-width images */}
      {project.projectType === 'stacked' && (
        <div className="mod-wrap stack">
          {project.images.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={p.src}
              alt={`${project.title} — ${i + 1}`}
              width={p.w ?? undefined}
              height={p.h ?? undefined}
              loading="lazy"
              onClick={() => open(p.src)}
            />
          ))}
        </div>
      )}

      {/* FREE layout — the module page builder */}
      {project.projectType === 'free' && (
        <div className="mod-wrap">
          {project.modules.map((m, i) => {
            switch (m.type) {
              case 'text': {
                // Markup pasted into the visual editor was stored escaped, so
                // the page used to print `<!doctype html>` at the reader.
                const raw = recoverEscapedHtml(m.value)

                // A whole HTML page pasted in as a case study: render it with
                // its own stylesheet, confined to this element. Same component
                // the dashboard previews with.
                if (isEmbeddablePage(raw)) return <HtmlEmbed key={i} value={raw} />

                // Ordinary rich text. Older projects hold plain text — keep
                // their line breaks instead of collapsing them.
                const html = {
                  __html: /<[a-z][\s\S]*>/i.test(raw) ? raw : raw.replace(/\n/g, '<br />'),
                }
                const cls = m.textType === 'h1' ? 'mod-h1' : m.textType === 'h2' ? 'mod-h2' : 'mod-p'
                // eslint-disable-next-line react/no-danger
                return <div className={`${cls} mod-rich`} key={i} dangerouslySetInnerHTML={html} />
              }
              case 'image':
                return m.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="mod-img" key={i} src={m.src} alt={project.title} loading="lazy" onClick={() => open(m.src!)} />
                ) : null
              case 'grid':
                return (
                  <div
                    className="mod-row"
                    key={i}
                    // How many fit across on a phone. The row was hard-wired to
                    // one per line there, which turned a three-up set into three
                    // full-width pictures.
                    style={{ ['--row-cols']: m.mobileCols ?? 1 } as React.CSSProperties}
                  >
                    {m.items.map((it, j) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={j}
                        src={it.src}
                        alt={`${project.title} — ${j + 1}`}
                        loading="lazy"
                        // Aspect ratio as a variable, not an inline flex-grow:
                        // an inline value would outrank the phone rule below.
                        style={{ ['--ar']: it.ar } as React.CSSProperties}
                        onClick={() => open(it.src)}
                      />
                    ))}
                  </div>
                )
              case 'carousel':
                return <Carousel key={i} images={m.items} ratio={m.ratio} onOpen={open} />
              case 'video': {
                const v = resolveVideoUrl(m.embedUrl)
                if (!v) return null
                return (
                  <div className="mod-video" key={i}>
                    {v.kind === 'file' ? (
                      // With a cover set, don't spend the visitor's bandwidth
                      // fetching a first frame nobody will see.
                      <video
                        src={v.url}
                        poster={m.poster || undefined}
                        controls
                        playsInline
                        preload={m.poster ? 'none' : 'metadata'}
                      />
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

      {/* Lightbox — simple viewer: big side arrows, counter, tap/keys/swipe */}
      {lb !== null && gallery.current[lb] && (
        <div
          className="lightbox"
          onClick={() => setLb(null)}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            touchX.current = null
            if (Math.abs(dx) > 50) nav(dx < 0 ? 1 : -1)
          }}
        >
          <button className="lb-btn lb-close" onClick={() => setLb(null)} aria-label="close">
            {CloseIcon}
          </button>
          {gallery.current.length > 1 && (
            <>
              <button
                className="lb-btn lb-prev"
                aria-label="previous"
                onClick={(e) => {
                  e.stopPropagation()
                  nav(-1)
                }}
              >
                {ChevronL}
              </button>
              <button
                className="lb-btn lb-next"
                aria-label="next"
                onClick={(e) => {
                  e.stopPropagation()
                  nav(1)
                }}
              >
                {ChevronR}
              </button>
              <div className="lb-count">
                {lb + 1} / {gallery.current.length}
              </div>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gallery.current[lb]} alt={project.title} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
