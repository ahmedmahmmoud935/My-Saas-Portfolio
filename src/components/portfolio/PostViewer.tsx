'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

export type Post = {
  id: number
  title: string
  category?: string | null
  frames: string[]
}

/**
 * Instagram-style viewer: swipe LEFT/RIGHT through the frames of the current
 * post, and UP/DOWN to move between posts. Opened from the designs grid.
 */
export default function PostViewer({
  posts,
  start,
  onClose,
}: {
  posts: Post[]
  start: number
  onClose: () => void
}) {
  const [post, setPost] = useState(start)
  const [frame, setFrame] = useState(0)
  const touch = useRef<{ x: number; y: number } | null>(null)

  const current = posts[post]
  const frames = current?.frames ?? []

  const goPost = useCallback(
    (d: number) => {
      setPost((p) => {
        const n = Math.min(posts.length - 1, Math.max(0, p + d))
        if (n !== p) setFrame(0)
        return n
      })
    },
    [posts.length],
  )
  const goFrame = useCallback(
    (d: number) => setFrame((f) => Math.min(frames.length - 1, Math.max(0, f + d))),
    [frames.length],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goFrame(1)
      else if (e.key === 'ArrowLeft') goFrame(-1)
      else if (e.key === 'ArrowDown') goPost(1)
      else if (e.key === 'ArrowUp') goPost(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goFrame, goPost, onClose])

  if (!current) return null

  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) < 40 && Math.abs(dy) < 40) return
    if (Math.abs(dx) > Math.abs(dy)) goFrame(dx < 0 ? 1 : -1) // swipe left → next frame
    else goPost(dy < 0 ? 1 : -1) // swipe up → next post
  }

  return (
    <div className="pv" onClick={onClose}>
      <button className="pv-btn pv-close" onClick={onClose} aria-label="close">
        ✕
      </button>

      {/* Post navigation (vertical) */}
      {post > 0 && (
        <button
          className="pv-btn pv-up"
          onClick={(e) => {
            e.stopPropagation()
            goPost(-1)
          }}
          aria-label="previous project"
        >
          ⌃
        </button>
      )}
      {post < posts.length - 1 && (
        <button
          className="pv-btn pv-down"
          onClick={(e) => {
            e.stopPropagation()
            goPost(1)
          }}
          aria-label="next project"
        >
          ⌄
        </button>
      )}

      <div
        className="pv-stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pv-img" src={frames[frame]} alt={current.title} />

        {/* Frame navigation (horizontal) */}
        {frames.length > 1 && (
          <>
            {frame > 0 && (
              <button className="pv-arrow pv-prev" onClick={() => goFrame(-1)} aria-label="previous">
                ‹
              </button>
            )}
            {frame < frames.length - 1 && (
              <button className="pv-arrow pv-next" onClick={() => goFrame(1)} aria-label="next">
                ›
              </button>
            )}
            <div className="pv-dots">
              {frames.map((_, i) => (
                <span key={i} className={i === frame ? 'on' : ''} />
              ))}
            </div>
          </>
        )}

        <div className="pv-cap">
          <strong>{current.title}</strong>
          {current.category && <span>{current.category}</span>}
        </div>
      </div>
    </div>
  )
}
