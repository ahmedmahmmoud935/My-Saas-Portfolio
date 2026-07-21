'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type Story = {
  title: string
  coverUrl: string | null
  items: { type: string; url: string | null }[]
}

const IMAGE_MS = 4500

export default function StoryHighlights({ stories }: { stories: Story[] }) {
  const valid = stories.filter((s) => s.items.some((i) => i.url))
  const [open, setOpen] = useState<number | null>(null)
  const [idx, setIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => setMounted(true), [])

  // Lock background scroll while the viewer is open.
  useEffect(() => {
    if (open === null) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  const items = open !== null ? valid[open].items.filter((i) => i.url) : []
  const current = items[idx]

  const clearTimer = () => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
  }

  const next = useCallback(() => {
    setIdx((i) => {
      if (i + 1 < items.length) return i + 1
      // advance to next highlight or close
      setOpen((o) => (o !== null && o + 1 < valid.length ? o + 1 : null))
      return 0
    })
    setProgress(0)
  }, [items.length, valid.length])

  const prev = () => {
    setIdx((i) => Math.max(0, i - 1))
    setProgress(0)
  }

  useEffect(() => {
    clearTimer()
    if (open === null || !current) return
    if (current.type === 'video') return // videos advance on ended
    const start = Date.now()
    timer.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / IMAGE_MS) * 100)
      setProgress(p)
      if (p >= 100) next()
    }, 50)
    return clearTimer
  }, [open, idx, current, next])

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') prev()
      if (e.key === 'ArrowLeft') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, next])

  if (valid.length === 0) return null

  return (
    <div className="container" style={{ marginTop: 8 }}>
      <div className="story-row">
        {valid.map((s, i) => (
          <button
            key={i}
            className="story-circle"
            onClick={() => {
              setOpen(i)
              setIdx(0)
              setProgress(0)
            }}
          >
            <span className="story-ring">
              {s.coverUrl || s.items[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.coverUrl || s.items[0]?.url || ''} alt={s.title} />
              ) : null}
            </span>
            <span className="story-title">{s.title}</span>
          </button>
        ))}
      </div>

      {mounted &&
        open !== null &&
        current &&
        createPortal(
          <div className="story-viewer" onClick={() => setOpen(null)}>
            <div className="story-stage" onClick={(e) => e.stopPropagation()}>
              <div className="story-bars">
                {items.map((_, i) => (
                  <div className="story-bar" key={i}>
                    <div
                      className="story-bar-fill"
                      style={{ width: i < idx ? '100%' : i === idx ? `${progress}%` : '0%' }}
                    />
                  </div>
                ))}
              </div>
              <button className="story-close" onClick={() => setOpen(null)}>
                ✕
              </button>

              {current.type === 'video' ? (
                <video
                  className="story-media"
                  src={current.url || ''}
                  poster={valid[open].coverUrl || undefined}
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  onEnded={next}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="story-media" src={current.url || ''} alt="" loading="eager" decoding="async" />
              )}

              <div className="story-tap prev" onClick={prev} />
              <div className="story-tap next" onClick={next} />
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
