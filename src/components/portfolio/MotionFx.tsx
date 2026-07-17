'use client'

import React, { useEffect, useRef } from 'react'

/**
 * Applies the tenant's Motion settings on the client:
 *  - anim: scroll-reveal for sections (fade / fade-up)
 *  - cursor: a dot-ring custom cursor
 * Both are no-ops when set to their default/off value.
 */
export default function MotionFx({ anim, cursor }: { anim?: string; cursor?: string }) {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  // ── Scroll reveal ──
  useEffect(() => {
    if (!anim || anim === 'none') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector('.pf-root')
    if (!root) return
    root.classList.add('reveal-ready')
    const sections = Array.from(root.querySelectorAll('.section'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('reveal-in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => {
      io.disconnect()
      root.classList.remove('reveal-ready')
    }
  }, [anim])

  // ── Dot-ring cursor ──
  useEffect(() => {
    if (cursor !== 'dot-ring') return
    if (window.matchMedia('(pointer: coarse)').matches) return // skip on touch
    let rx = window.innerWidth / 2
    let ry = window.innerHeight / 2
    let raf = 0
    const onMove = (e: MouseEvent) => {
      if (dot.current) dot.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`
    }
    const loop = () => {
      const target = dot.current?.getBoundingClientRect()
      if (target && ring.current) {
        rx += (target.left - rx) * 0.18
        ry += (target.top - ry) * 0.18
        ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`
      }
      raf = requestAnimationFrame(loop)
    }
    const over = (e: Event) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button')) ring.current?.classList.add('hover')
      else ring.current?.classList.remove('hover')
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', over)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', over)
      cancelAnimationFrame(raf)
    }
  }, [cursor])

  if (cursor !== 'dot-ring') return null
  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  )
}
