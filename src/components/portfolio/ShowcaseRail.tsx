'use client'

import React, { useEffect, useRef, useState } from 'react'

/**
 * The showcase rail, steered by name.
 *
 * A scrollbar under a row of portfolios says "this scrolls" and nothing else.
 * The names say who is in there — which is the actual question a reader has in
 * front of a row of strangers' work — so they are the control, and the
 * scrollbar goes away.
 *
 * The rail still scrolls by every means the browser already offers; the names
 * are an addition to that, not a replacement, so a drag or a swipe keeps
 * working and simply lights the name it lands on.
 */
export default function ShowcaseRail({
  className,
  names,
  rail: isRail,
  children,
}: {
  className: string
  names: string[]
  /** False when the owner chose the grid: no names, nothing to steer. */
  rail: boolean
  children: React.ReactNode
}) {
  const rail = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // Which card is nearest the rail's leading edge. Read on scroll rather than
  // written on click, so a drag and a click agree about where we are.
  useEffect(() => {
    const el = rail.current
    if (!el) return
    let frame = 0
    const read = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const edge = el.getBoundingClientRect()
        const start = getComputedStyle(el).direction === 'rtl' ? edge.right : edge.left
        let best = 0
        let bestGap = Infinity
        Array.from(el.children).forEach((child, i) => {
          const box = child.getBoundingClientRect()
          const gap = Math.abs((getComputedStyle(el).direction === 'rtl' ? box.right : box.left) - start)
          if (gap < bestGap) {
            bestGap = gap
            best = i
          }
        })
        setActive(best)
      })
    }
    el.addEventListener('scroll', read, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('scroll', read)
    }
  }, [])

  const go = (i: number) => {
    const el = rail.current
    const card = el?.children[i] as HTMLElement | undefined
    if (!el || !card) return
    // Scrolling the rail itself, not the page: scrollIntoView would drag the
    // whole document sideways and vertically to reach the card.
    const delta = card.getBoundingClientRect().left - el.getBoundingClientRect().left
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  if (!isRail) return <div className={className}>{children}</div>

  return (
    <>
      {names.length > 1 && (
        <div className="lp-rail-names" role="tablist">
          {names.map((name, i) => (
            <button
              key={name + i}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`lp-rail-name${i === active ? ' active' : ''}`}
              onClick={() => go(i)}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      <div className={className} ref={rail}>
        {children}
      </div>
    </>
  )
}
