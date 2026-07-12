'use client'

import React, { useRef, useState } from 'react'

export type StackCard = {
  title: string
  description?: string | null
  iconUrl?: string | null
  imageUrl?: string | null
  bgZoom?: number
  bgOverlay?: number
  bgPosX?: number
  bgPosY?: number
}

/**
 * A deck of cards: the front card can be swiped/clicked away, revealing the next
 * one; the rest peek behind it. Each card shows its image as a background with
 * the title/description over it.
 */
export default function CardStack({ items }: { items: StackCard[] }) {
  const [order, setOrder] = useState(() => items.map((_, i) => i))
  const [exiting, setExiting] = useState<0 | 1 | -1>(0) // 1 = fly to next, -1 = fly to prev
  const [drag, setDrag] = useState(0)
  const start = useRef<number | null>(null)

  const advance = (dir: 1 | -1) => {
    if (exiting) return
    setExiting(dir)
    setDrag(0)
    window.setTimeout(() => {
      setOrder((o) => (dir === 1 ? [...o.slice(1), o[0]] : [o[o.length - 1], ...o.slice(0, -1)]))
      setExiting(0)
    }, 340)
  }

  const onDown = (e: React.PointerEvent) => {
    if (exiting) return
    start.current = e.clientY
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (start.current === null) return
    setDrag(e.clientY - start.current)
  }
  const onUp = () => {
    if (start.current === null) return
    const d = drag
    start.current = null
    if (Math.abs(d) > 70) advance(d < 0 ? 1 : -1)
    else setDrag(0)
  }

  if (items.length === 0) return null
  const topOriginal = order[0]

  return (
    <div className="cs-wrap">
      <div className="cs-stack">
        {order.map((itemIdx, rank) => {
          const it = items[itemIdx]
          const isTop = rank === 0
          const dragY = isTop ? drag : 0
          const flyY = isTop && exiting ? (exiting === 1 ? -420 : 420) : 0
          const rot = isTop ? (dragY + flyY) * 0.03 : 0
          const style: React.CSSProperties = {
            zIndex: items.length - rank,
            transform: `translateY(${-rank * 26 + dragY + flyY}px) scale(${1 - Math.min(rank, 4) * 0.06})`,
            opacity: rank > 4 ? 0 : isTop && exiting ? 0 : 1,
            rotate: `${rot}deg`,
            transition: start.current !== null && isTop ? 'none' : 'transform .34s ease, opacity .34s ease, rotate .34s ease',
          }
          return (
            <div
              key={itemIdx}
              className={`cs-card${isTop ? ' top' : ''}`}
              style={style}
              onPointerDown={isTop ? onDown : undefined}
              onPointerMove={isTop ? onMove : undefined}
              onPointerUp={isTop ? onUp : undefined}
              onPointerCancel={isTop ? onUp : undefined}
            >
              {it.imageUrl || it.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="cs-bg"
                  src={it.imageUrl || it.iconUrl || ''}
                  alt=""
                  draggable={false}
                  style={{
                    transform: `scale(${(it.bgZoom ?? 100) / 100})`,
                    objectPosition: `${it.bgPosX ?? 50}% ${it.bgPosY ?? 50}%`,
                  }}
                />
              ) : (
                <div className="cs-bg cs-bg-fallback" />
              )}
              <div className="cs-shade" />
              <div className="cs-dim" style={{ opacity: (it.bgOverlay ?? 45) / 100 }} />
              <div className="cs-body">
                <h4>{it.title}</h4>
                {it.description && <p>{it.description}</p>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="cs-controls">
        <button className="cs-arrow" onClick={() => advance(-1)} aria-label="previous">
          ‹
        </button>
        <div className="cs-dots">
          {items.map((_, i) => (
            <span key={i} className={i === topOriginal ? 'on' : ''} />
          ))}
        </div>
        <button className="cs-arrow" onClick={() => advance(1)} aria-label="next">
          ›
        </button>
      </div>
      <p className="cs-hint">اسحب الكارت أو استخدم الأسهم · Drag the card or use the arrows</p>
    </div>
  )
}
