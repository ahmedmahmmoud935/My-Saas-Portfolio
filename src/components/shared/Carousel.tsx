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
  /** Max height for the track — the dashboard preview runs shorter. */
  height?: string
  className?: string
}) {
  const track = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)
  // Shape the frame around the actual pictures. A fixed 16:9 box left a
  // portrait shot as a stamp in the middle of a blurred field. The FIRST slide
  // sets the shape (as on Instagram) — taking the tallest would let one
  // outlier stretch the whole set.
  const [ratio, setRatio] = useState<number | null>(null)
  const n = images.length

  const noteRatio = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (!img.naturalWidth || !img.naturalHeight) return
    // 4:5 is as tall as Instagram goes; 1.91:1 as wide.
    setRatio(Math.max(0.8, Math.min(1.91, img.naturalWidth / img.naturalHeight)))
  }

  // Which slide is showing = how far along the track we are. Works in RTL too,
  // where scrollLeft counts the other way (and is negative in some engines).
  const onScroll = useCallback(() => {
    const el = track.current
    if (!el || !el.clientWidth) return
    setIdx(Math.max(0, Math.min(n - 1, Math.round(Math.abs(el.scrollLeft) / el.clientWidth))))
  }, [n])

  const goTo = (i: number) => {
    const el = track.current
    const slide = el?.children[i] as HTMLElement | undefined
    if (!el || !slide) return
    const from = el.scrollLeft
    slide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    // Some engines quietly ignore a smooth scroll on an RTL track. If nothing
    // has moved a moment later, jump — arriving without the animation beats a
    // button that does nothing.
    setTimeout(() => {
      if (el.scrollLeft === from) slide.scrollIntoView({ inline: 'center', block: 'nearest' })
    }, 250)
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
    <div
      className={`${s.wrap} ${className}`}
      style={
        {
          ...(height ? { ['--mc-max']: height } : {}),
          ...(ratio ? { ['--mc-ar']: String(ratio) } : {}),
        } as React.CSSProperties
      }
    >
      <div className={s.track} ref={track} onScroll={onScroll}>
        {images.map((src, i) => (
          <div className={s.slide} key={i} style={{ backgroundImage: `url(${src})` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              loading={i === 0 ? undefined : 'lazy'}
              draggable={false}
              onLoad={i === 0 ? noteRatio : undefined}
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
