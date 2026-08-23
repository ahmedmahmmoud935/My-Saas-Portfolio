'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import s from './Carousel.module.css'

/**
 * A slider that behaves the way people expect from Instagram: one continuous
 * track, the swipe follows your finger, and it snaps to the next slide when you
 * let go. It's a native scroller with scroll-snap — no drag maths, so momentum
 * and accessibility come for free.
 */
export default function Carousel({
  images,
  onOpen,
  height,
  className = '',
}: {
  images: string[]
  /** Click a slide (e.g. to open the lightbox). Omit to make slides inert. */
  onOpen?: (src: string) => void
  /** CSS height for the track — the dashboard preview runs shorter. */
  height?: string
  className?: string
}) {
  const track = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)
  const n = images.length

  // Which slide is showing = how far along the track we are. Works in RTL too,
  // where scrollLeft counts the other way (and is negative in some engines).
  const onScroll = useCallback(() => {
    const el = track.current
    if (!el || !el.clientWidth) return
    setIdx(Math.max(0, Math.min(n - 1, Math.round(Math.abs(el.scrollLeft) / el.clientWidth))))
  }, [n])

  const goTo = (i: number) => {
    const el = track.current
    if (!el) return
    const rtl = getComputedStyle(el).direction === 'rtl'
    el.scrollTo({ left: (rtl ? -1 : 1) * i * el.clientWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = track.current
    if (!el) return
    // Keep the dots honest if the viewport is resized mid-scroll.
    const ro = new ResizeObserver(onScroll)
    ro.observe(el)
    return () => ro.disconnect()
  }, [onScroll])

  if (n === 0) return null

  return (
    <div className={`${s.wrap} ${className}`} style={height ? ({ ['--mc-h']: height } as React.CSSProperties) : undefined}>
      <div className={s.track} ref={track} onScroll={onScroll}>
        {images.map((src, i) => (
          <div className={s.slide} key={i} style={{ backgroundImage: `url(${src})` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              loading={i === 0 ? undefined : 'lazy'}
              draggable={false}
              onClick={onOpen ? () => onOpen(src) : undefined}
              style={onOpen ? undefined : { cursor: 'default' }}
            />
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          <span className={s.count}>
            {idx + 1}/{n}
          </span>
          <button
            className={`${s.arrow} ${s.prev}`}
            onClick={() => goTo(idx - 1)}
            disabled={idx === 0}
            aria-label="previous"
          >
            ‹
          </button>
          <button
            className={`${s.arrow} ${s.next}`}
            onClick={() => goTo(idx + 1)}
            disabled={idx === n - 1}
            aria-label="next"
          >
            ›
          </button>
          <div className={s.dots}>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === idx ? s.on : ''}
                onClick={() => goTo(i)}
                aria-label={`slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
