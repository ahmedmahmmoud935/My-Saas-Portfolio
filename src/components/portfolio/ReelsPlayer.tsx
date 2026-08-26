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

  // Swipe up for the next reel, down for the previous — the gesture everyone
  // already uses for this. A tap or a drag along the seek bar is not a swipe:
  // it has to travel, and travel further vertically than horizontally.
  const touch = useRef<{ x: number; y: number; at: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY, at: Date.now() }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current
    touch.current = null
    if (!s) return
    const t = e.changedTouches[0]
    const dy = t.clientY - s.y
    const dx = t.clientX - s.x
    if (Date.now() - s.at > 800) return
    if (Math.abs(dy) < 60 || Math.abs(dy) < Math.abs(dx)) return
    go(dy < 0 ? 1 : -1)
  }

  if (!cur || !mounted) return null

  // Portal to <body>: sections carry an entrance animation, and an element with
  // a filling transform animation becomes the containing block for `position:
  // fixed` children — so in place this overlay covered only its own section
  // instead of the screen.
  return createPortal(
    <div className="reels" onClick={onClose} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
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
