'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toEmbed } from '@/lib/video'

export type Reel = { id: number; title: string; videoUrl?: string | null; coverUrl?: string | null }

export default function ReelsPlayer({
  reels,
  start,
  onClose,
}: {
  reels: Reel[]
  start: number
  onClose: () => void
}) {
  const [i, setI] = useState(start)
  const [mounted, setMounted] = useState(false)
  const cur = reels[i]
  const embed = toEmbed(cur?.videoUrl)

  const go = (d: number) => setI((p) => (p + d + reels.length) % reels.length)

  useEffect(() => setMounted(true), [])

  // (Background scroll is frozen in CSS — see `html:has(.reels)` in globals.)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowUp') go(-1)
      if (e.key === 'ArrowDown') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reels.length])

  if (!cur || !mounted) return null

  // Portal to <body>: sections carry an entrance animation, and an element with
  // a filling transform animation becomes the containing block for `position:
  // fixed` children — so in place this overlay covered only its own section
  // instead of the screen.
  return createPortal(
    <div className="reels" onClick={onClose}>
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
      <div className="reels-stage" onClick={(e) => e.stopPropagation()}>
        {embed?.kind === 'file' ? (
          <video
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
      </div>
    </div>,
    document.body,
  )
}
