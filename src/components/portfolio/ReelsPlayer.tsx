'use client'

import React, { useEffect, useState } from 'react'
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
  const cur = reels[i]
  const embed = toEmbed(cur?.videoUrl)

  const go = (d: number) => setI((p) => (p + d + reels.length) % reels.length)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowUp') go(-1)
      if (e.key === 'ArrowDown') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reels.length])

  if (!cur) return null

  return (
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
          <video className="reels-media" src={embed.src} autoPlay controls playsInline loop />
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
        <div className="reels-title">{cur.title}</div>
      </div>
    </div>
  )
}
