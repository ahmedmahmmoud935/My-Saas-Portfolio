'use client'

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * A video played over the page, at a size worth watching.
 *
 * Played inside its card, a YouTube clip was the width of half a column, and
 * its own "Watch on YouTube" was the easiest way to see it bigger — which
 * takes the reader off the page that was selling to them. Here it opens over
 * the page instead: wide, 16:9, and closed by the ✕, the Escape key or a click
 * outside it, leaving the reader where they were.
 */
export default function VideoLightbox({
  kind,
  src,
  title,
  closeLabel,
  onClose,
}: {
  kind: 'file' | 'iframe'
  src: string
  title: string
  closeLabel: string
  onClose: () => void
}) {
  const closeBtn = useRef<HTMLButtonElement>(null)
  // Read through a ref: the callers pass a fresh arrow each render, and the
  // setup below should run once per opening, not once per render.
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current()
    }
    // The page underneath stays where it was, rather than scrolling behind.
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    closeBtn.current?.focus()
    return () => {
      document.body.style.overflow = before
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return createPortal(
    <div className="vlb" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="vlb-box" onClick={(e) => e.stopPropagation()}>
        <button ref={closeBtn} type="button" className="vlb-close" onClick={onClose} aria-label={closeLabel}>
          ✕
        </button>
        {kind === 'file' ? (
          <video className="vlb-media" src={src} controls autoPlay playsInline />
        ) : (
          <iframe
            className="vlb-media"
            src={`${src}${src.includes('?') ? '&' : '?'}autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}
      </div>
    </div>,
    document.body,
  )
}

/** YouTube's own still for a video, for when no poster was uploaded. */
export function youTubePoster(embedUrl: string): string | null {
  const id = embedUrl.match(/youtube\.com\/embed\/([\w-]{11})/)?.[1]
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}
