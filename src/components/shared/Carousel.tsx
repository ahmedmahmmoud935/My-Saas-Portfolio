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
  const first = images[0]

  // With more than one picture the track carries a copy of the LAST slide
  // before the first and of the FIRST after the last. They are only there to
  // be looked at: they fill the strip either side of the centred slide, so the
  // ends of the carousel show the wrapped-around neighbour instead of a gap.
  const peeks = n > 1
  const strip = peeks ? [images[n - 1], ...images, images[0]] : images
  /** Track child for a real slide index. */
  const childOf = useCallback((i: number) => (peeks ? i + 1 : i), [peeks])

  // Measure the first slide. An `onLoad` prop alone is not enough: an image
  // already in the browser's cache finishes loading before React attaches the
  // handler, so the event never arrives and the frame keeps its 4:3 default —
  // which is exactly what a returning visitor saw.
  useEffect(() => {
    if (!first) return
    let alive = true
    // 4:5 is as tall as Instagram goes; 1.91:1 as wide.
    const apply = (w: number, h: number) => {
      if (alive && w && h) setRatio(Math.max(0.8, Math.min(1.91, w / h)))
    }
    const shown = track.current?.querySelector('img')
    if (shown?.complete && shown.naturalWidth) {
      apply(shown.naturalWidth, shown.naturalHeight)
      return
    }
    const probe = new window.Image()
    probe.onload = () => apply(probe.naturalWidth, probe.naturalHeight)
    probe.src = first
    return () => {
      alive = false
    }
  }, [first])

  // Which slide is showing = how far along the track we are. Works in RTL too,
  // where scrollLeft counts the other way (and is negative in some engines).
  const currentIndex = useCallback(() => {
    const el = track.current
    if (!el || !el.clientWidth) return 0
    // Whichever slide sits closest to the middle. Dividing scroll distance by
    // the track width stopped working once the track grew side padding for the
    // peeking neighbours and a gap between slides.
    const centre = Math.abs(el.scrollLeft) + el.clientWidth / 2
    let best = 0
    let bestGap = Infinity
    for (let i = 0; i < el.children.length; i++) {
      const c = el.children[i] as HTMLElement
      const gap = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centre)
      if (gap < bestGap) {
        bestGap = gap
        best = i
      }
    }
    // Back to a real slide index — the copies at either end don't count.
    return Math.max(0, Math.min(n - 1, peeks ? best - 1 : best))
  }, [n, peeks])

  const onScroll = useCallback(() => setIdx(currentIndex()), [currentIndex])

  // Where the last arrow press was headed. Two quick presses would otherwise
  // both read the track mid-animation, aim at the same slide, and lose a step.
  const aim = useRef<{ i: number; at: number } | null>(null)
  const fromHere = () => {
    const a = aim.current
    return a && Date.now() - a.at < 600 ? a.i : currentIndex()
  }

  // Wraps around: past the last slide is the first one again. The arrows used
  // to switch off at the ends, and a switched-off arrow is transparent and
  // click-through — so pressing it opened the lightbox on the slide behind it.
  const goTo = (i: number) => {
    const el = track.current
    const wrapped = ((i % n) + n) % n
    const slide = el?.children[childOf(wrapped)] as HTMLElement | undefined
    if (!el || !slide) return
    aim.current = { i: wrapped, at: Date.now() }
    const from = el.scrollLeft
    // Sliding the whole track back for a wrap is a long, confusing sweep; jump.
    const behavior = wrapped === i ? 'smooth' : 'auto'
    slide.scrollIntoView({ behavior, inline: 'center', block: 'nearest' })
    // Some engines quietly ignore a smooth scroll on an RTL track. If nothing
    // has moved a moment later, jump — arriving without the animation beats a
    // button that does nothing.
    setTimeout(() => {
      if (el.scrollLeft === from) slide.scrollIntoView({ inline: 'center', block: 'nearest' })
    }, 250)
  }

  // Start on the first real slide: scroll position 0 would park the carousel
  // on the copy of the last one.
  useEffect(() => {
    const el = track.current
    if (!el || !peeks) return
    const centreFirst = () => {
      const slide = el.children[1] as HTMLElement | undefined
      if (!slide || !el.clientWidth) return
      el.scrollLeft = slide.offsetLeft - (el.clientWidth - slide.offsetWidth) / 2
    }
    centreFirst()
    // The slides are sized from the picture, so do it again once it has loaded.
    const t = setTimeout(centreFirst, 120)
    return () => clearTimeout(t)
  }, [peeks, ratio, n])

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
        {strip.map((src, i) => {
          const copy = peeks && (i === 0 || i === strip.length - 1)
          const centred = !copy && (peeks ? i - 1 : i) === idx
          return (
            <div
              className={`${s.slide}${copy ? ` ${s.copy}` : ''}${centred ? ` ${s.active}` : ''}`}
              key={i}
              style={{ backgroundImage: `url(${src})` }}
              aria-hidden={copy || undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading={i <= 1 ? undefined : 'lazy'}
                draggable={false}
                onClick={onOpen && !copy ? () => onOpen(src) : undefined}
                style={onOpen && !copy ? undefined : { cursor: 'default' }}
              />
            </div>
          )
        })}
      </div>

      {n > 1 && (
        <>
          <span className={s.count}>
            {idx + 1}/{n}
          </span>
          <button
            className={`${s.arrow} ${s.prev}`}
            onClick={() => goTo(fromHere() - 1)}
            aria-label="previous"
          >
            ‹
          </button>
          <button
            className={`${s.arrow} ${s.next}`}
            onClick={() => goTo(fromHere() + 1)}
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
