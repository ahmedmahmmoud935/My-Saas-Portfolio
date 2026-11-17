'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { isVideoSrc } from '@/lib/media-kind'

export type Story = {
  title: string
  coverUrl: string | null
  items: { type: string; url: string | null }[]
}

const IMAGE_MS = 4500
// A press longer than this is a "hold to pause", not a tap to move on.
const HOLD_MS = 220
// A downward drag this long closes the viewer, as on a phone's own stories.
const SWIPE_CLOSE_PX = 90

/**
 * The circle thumbnail. When a highlight has no cover we fall back to its first
 * item — which may be a video, and putting a video URL in an <img> makes the
 * browser download and fail to decode the whole clip. Use a metadata-only
 * <video> for those so the page stays responsive.
 */
function Ring({ src, title }: { src: string; title: string }) {
  if (!src) return null
  if (isVideoSrc(src)) return <video src={`${src}#t=0.1`} muted playsInline preload="metadata" />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={title} />
}

type Item = { type: 'image' | 'video'; url: string }

/**
 * Story highlights and their full-screen viewer.
 *
 * The progress bar is drawn straight onto the bar's element each frame
 * rather than through React state: re-rendering twenty times a second made
 * every frame rebuild the slide, which restarted the photo timer (a photo
 * story could sit still for ever) and re-sent "play" to a video several times
 * a second (it stuttered). Now a photo's clock starts once the photo has
 * loaded, a video drives its own bar, each slide moves on exactly once, and
 * the next slide is fetched while the current one plays.
 */
export default function StoryHighlights({ stories }: { stories: Story[] }) {
  const valid = useMemo(() => stories.filter((s) => s.items.some((i) => i.url)), [stories])
  const [open, setOpen] = useState<number | null>(null)
  const [idx, setIdx] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  const fill = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  // The photo clock: time already shown, and when the current run started.
  const shown = useRef(0)
  const runFrom = useRef<number | null>(null)
  const paused = useRef(false)
  // Which slide has already moved on, so `ended` and the clock can't both do it.
  const moved = useRef('')
  const press = useRef<{ t: number; y: number } | null>(null)
  const loaded = useRef(false)

  useEffect(() => setMounted(true), [])

  // Trust the file over the stored type: a video rendered in an <img> locks the
  // whole page up while the browser tries to decode it.
  const items: Item[] = useMemo(
    () =>
      open === null
        ? []
        : valid[open].items
            .filter((i): i is { type: string; url: string } => !!i.url)
            .map((i) => ({ url: i.url, type: isVideoSrc(i.url) || i.type === 'video' ? 'video' : 'image' })),
    [open, valid],
  )
  const current = items[idx]
  const key = `${open}:${idx}`

  // A new slide starts clean: empty bar, clock at zero, not yet loaded.
  useEffect(() => {
    setFailed(false)
    setReady(false)
    shown.current = 0
    runFrom.current = null
    paused.current = false
    loaded.current = false
    moved.current = ''
    if (fill.current) fill.current.style.transform = 'scaleX(0)'
  }, [key])

  const close = useCallback(() => setOpen(null), [])

  const go = useCallback(
    (dir: 1 | -1) => {
      if (open === null) return
      // Each slide moves on once: `ended`, the clock and a tap can't stack up.
      if (moved.current === key) return
      moved.current = key
      if (dir === -1) {
        if (idx > 0) setIdx(idx - 1)
        else if (open > 0) {
          setOpen(open - 1)
          setIdx(0)
        }
        return
      }
      if (idx + 1 < items.length) setIdx(idx + 1)
      else if (open + 1 < valid.length) {
        setOpen(open + 1)
        setIdx(0)
      } else setOpen(null)
    },
    [open, idx, key, items.length, valid.length],
  )

  // One loop for the bar: a photo runs on its own clock once loaded; a video
  // reads its playhead. Nothing here sets React state.
  useEffect(() => {
    if (open === null || !current) return
    let raf = 0
    const tick = () => {
      let pct = 0
      if (current.type === 'video') {
        const v = video.current
        if (v && v.duration && isFinite(v.duration)) {
          pct = v.currentTime / v.duration
          // Some encodings never fire `ended`; a clip parked on its last frame moves on.
          if (v.paused && !paused.current && v.currentTime >= v.duration - 0.05) go(1)
        }
      } else {
        // Zero until the photo has loaded and started its clock.
        const running = runFrom.current !== null && !paused.current ? performance.now() - runFrom.current : 0
        pct = (shown.current + running) / IMAGE_MS
        if (pct >= 1) go(1)
      }
      if (fill.current) fill.current.style.transform = `scaleX(${Math.min(1, pct)})`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [open, current, go])

  // A photo's clock starts the moment it has loaded, not before.
  const photoLoaded = () => {
    loaded.current = true
    setReady(true)
    if (runFrom.current === null && !paused.current) runFrom.current = performance.now()
  }

  // Each video starts once, with sound if the browser allows it (opening a
  // story is a tap), muted otherwise rather than not at all.
  useEffect(() => {
    if (open === null || current?.type !== 'video') return
    const v = video.current
    if (!v) return
    v.muted = false
    v.play().catch(() => {
      v.muted = true
      v.play().catch(() => {})
    })
  }, [key, open, current?.type])

  // The slide after this one is fetched now, so moving on doesn't wait.
  const upcoming = items[idx + 1] ?? (open !== null ? valid[open + 1]?.items.find((i) => i.url) : undefined)
  useEffect(() => {
    if (!upcoming?.url || isVideoSrc(upcoming.url)) return
    const img = new Image()
    img.src = upcoming.url
  }, [upcoming?.url])

  const pause = () => {
    paused.current = true
    if (current?.type === 'video') video.current?.pause()
    else if (runFrom.current !== null) {
      shown.current += performance.now() - runFrom.current
      runFrom.current = null
    }
  }
  const resume = () => {
    paused.current = false
    if (current?.type === 'video') video.current?.play().catch(() => {})
    else if (loaded.current) runFrom.current = performance.now()
  }

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      // Right-to-left reading: the left arrow is "next".
      if (e.key === 'ArrowLeft') go(1)
      if (e.key === 'ArrowRight') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go, close])

  /* Tap a side to move, hold anywhere to pause, drag down to close. */
  const down = (e: React.PointerEvent) => {
    press.current = { t: performance.now(), y: e.clientY }
    pause()
  }
  const up = (dir: 1 | -1) => (e: React.PointerEvent) => {
    const p = press.current
    press.current = null
    if (!p) return
    if (e.clientY - p.y > SWIPE_CLOSE_PX) return close()
    resume()
    if (performance.now() - p.t < HOLD_MS) go(dir)
  }
  const cancel = () => {
    if (press.current) {
      press.current = null
      resume()
    }
  }

  if (valid.length === 0) return null

  const upcomingVideo = upcoming?.url && isVideoSrc(upcoming.url) ? upcoming.url : null

  return (
    <div className="container" style={{ marginTop: 8 }}>
      <div className="story-row">
        {valid.map((s, i) => (
          <button
            key={i}
            className="story-circle"
            onClick={() => {
              moved.current = ''
              setOpen(i)
              setIdx(0)
            }}
          >
            <span className="story-ring">
              <Ring src={s.coverUrl || s.items[0]?.url || ''} title={s.title} />
            </span>
            <span className="story-title">{s.title}</span>
          </button>
        ))}
      </div>

      {mounted &&
        open !== null &&
        current &&
        createPortal(
          <div className="story-viewer" onClick={close}>
            <div className="story-stage" onClick={(e) => e.stopPropagation()}>
              <div className="story-bars">
                {items.map((_, i) => (
                  <div className="story-bar" key={i}>
                    <div
                      ref={i === idx ? fill : undefined}
                      className="story-bar-fill"
                      style={{ transform: `scaleX(${i < idx ? 1 : 0})` }}
                    />
                  </div>
                ))}
              </div>
              <button className="story-close" onClick={close} aria-label="Close">
                ✕
              </button>

              {failed ? (
                <div className="story-fail">تعذّر تشغيل هذا المقطع · Couldn’t play this clip</div>
              ) : current.type === 'video' ? (
                <video
                  key={key}
                  ref={video}
                  className={`story-media${ready ? ' is-ready' : ''}`}
                  src={current.url}
                  autoPlay
                  playsInline
                  preload="auto"
                  onLoadedData={() => setReady(true)}
                  onEnded={() => go(1)}
                  // A broken clip must not freeze the viewer — move on when
                  // there's more to show, otherwise say so instead of closing.
                  onError={() => (items.length > 1 ? go(1) : setFailed(true))}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={key}
                  className={`story-media${ready ? ' is-ready' : ''}`}
                  src={current.url}
                  alt=""
                  loading="eager"
                  decoding="async"
                  onLoad={photoLoaded}
                  onError={() => (items.length > 1 ? go(1) : setFailed(true))}
                />
              )}
              {!ready && !failed && <span className="story-loading" aria-hidden="true" />}

              <div className="story-tap prev" onPointerDown={down} onPointerUp={up(-1)} onPointerLeave={cancel} onPointerCancel={cancel} />
              <div className="story-tap next" onPointerDown={down} onPointerUp={up(1)} onPointerLeave={cancel} onPointerCancel={cancel} />

              {/* The next clip, buffering quietly while this one plays. */}
              {upcomingVideo && <video className="story-preload" src={upcomingVideo} preload="auto" muted playsInline aria-hidden="true" />}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
