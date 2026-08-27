'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { toEmbed } from '@/lib/video'

export type Reel = {
  id: number
  title: string
  videoUrl?: string | null
  coverUrl?: string | null
  /** 'reel' = 9:16 portrait, 'video' = 16:9 landscape. */
  kind?: string | null
}

export default function ReelsPlayer({
  reels,
  start,
  lang,
  onClose,
}: {
  reels: Reel[]
  start: number
  lang?: 'ar' | 'en'
  onClose: () => void
}) {
  const [i, setI] = useState(start)
  const [mounted, setMounted] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  // Only true when the browser refused sound and we fell back to muted.
  const [silenced, setSilenced] = useState(false)
  const cur = reels[i]
  const embed = toEmbed(cur?.videoUrl)

  const go = (d: number) => setI((p) => (p + d + reels.length) % reels.length)

  useEffect(() => setMounted(true), [])

  // (Background scroll is frozen in CSS — see `html:has(.reels)` in globals.)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowUp' || e.key === 'PageUp') go(-1)
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reels.length])

  // Play with sound. A phone refuses that without a user gesture it recognises,
  // and a silent reel looks broken — so on refusal it falls back to muted and
  // says the next tap turns the sound on.
  useEffect(() => {
    const v = video.current
    if (!v) return
    setSilenced(false)
    v.muted = false
    v.play().catch(() => {
      v.muted = true
      setSilenced(true)
      v.play().catch(() => {})
    })
  }, [i, cur?.videoUrl])

  const unmute = () => {
    const v = video.current
    if (!v || !silenced) return
    v.muted = false
    setSilenced(false)
    v.play().catch(() => {})
  }

  // Swipe up for the next reel, down for the previous.
  //
  // Bound natively in the CAPTURE phase rather than through React's props: the
  // clip fills the screen and carries native controls, and those swallow the
  // touch before it ever reaches an ancestor's handler — which is why swiping
  // did nothing on a phone. Capturing means we see the gesture first, whatever
  // it lands on.
  const overlay = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = overlay.current
    if (!el) return
    let start: { x: number; y: number; at: number } | null = null
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      start = { x: t.clientX, y: t.clientY, at: Date.now() }
    }
    const onEnd = (e: TouchEvent) => {
      const s = start
      start = null
      if (!s) return
      const t = e.changedTouches[0]
      const dy = t.clientY - s.y
      const dx = t.clientX - s.x
      // A tap or a drag along the seek bar is not a swipe: it has to travel,
      // and travel further vertically than horizontally.
      if (Date.now() - s.at > 800) return
      if (Math.abs(dy) < 55 || Math.abs(dy) < Math.abs(dx)) return
      go(dy < 0 ? 1 : -1)
    }
    el.addEventListener('touchstart', onStart, { capture: true, passive: true })
    el.addEventListener('touchend', onEnd, { capture: true, passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart, { capture: true })
      el.removeEventListener('touchend', onEnd, { capture: true })
    }
  }, [reels.length])

  // The same reason sound stayed off: a tap on the clip is consumed by its own
  // controls, so the handler meant to turn sound on never ran. A capture-phase
  // pointerdown sees it first, and being a real gesture the browser allows it.
  useEffect(() => {
    const el = overlay.current
    if (!el) return
    const onDown = () => {
      const v = video.current
      if (!v || !v.muted) return
      v.muted = false
      setSilenced(false)
      v.play().catch(() => {})
    }
    el.addEventListener('pointerdown', onDown, { capture: true })
    return () => el.removeEventListener('pointerdown', onDown, { capture: true })
  }, [i])

  if (!cur || !mounted) return null

  // Portal to <body>: sections carry an entrance animation, and an element with
  // a filling transform animation becomes the containing block for `position:
  // fixed` children — so in place this overlay covered only its own section
  // instead of the screen.
  return createPortal(
    <div className="reels" ref={overlay} onClick={onClose}>
      <button className="reels-close" onClick={onClose}>
        ✕
      </button>
      {reels.length > 1 && (
        <>
          <button className="reels-nav up" onClick={(e) => { e.stopPropagation(); go(-1) }}>
            ↑
          </button>
          <button className="reels-nav down" onClick={(e) => { e.stopPropagation(); go(1) }}>
            ↓
          </button>
        </>
      )}
      <div
        // Landscape clips were letterboxed inside a 9:16 portrait stage and
        // came out tiny; the stage takes the clip's own shape now.
        className={`reels-stage${cur.kind === 'video' ? ' wide' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          unmute()
        }}
      >
        {embed?.kind === 'file' ? (
          <video
            ref={video}
            className="reels-media"
            src={embed.src}
            // The cover shows instantly while the clip buffers, instead of a
            // black rectangle.
            poster={cur.coverUrl || undefined}
            autoPlay
            controls
            playsInline
            loop
          />
        ) : embed ? (
          <iframe
            className="reels-media"
            src={embed.src}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={cur.title}
          />
        ) : cur.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="reels-media" src={cur.coverUrl} alt={cur.title} />
        ) : null}
        {silenced && (
          <button
            className="reels-unmute"
            onClick={(e) => {
              e.stopPropagation()
              unmute()
            }}
          >
            🔇 {lang === 'en' ? 'Tap for sound' : 'اضغط للصوت'}
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}
