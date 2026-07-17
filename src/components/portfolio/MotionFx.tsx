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

  // ── Scroll reveal (inline styles only — hides just the below-fold sections
  //    at mount, reveals on scroll; no class toggling so it can't thrash, and
  //    if this JS never runs the sections simply stay visible). ──
  useEffect(() => {
    if (!anim || anim === 'none') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector('.pf-root')
    if (!root) return
    const sections = Array.from(root.querySelectorAll<HTMLElement>('.section'))
    const vh = window.innerHeight
    const hidden: HTMLElement[] = []
    for (const s of sections) {
      if (s.getBoundingClientRect().top > vh * 0.85) {
        s.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.16,1,.3,1)'
        s.style.opacity = '0'
        if (anim === 'fade-up') s.style.transform = 'translateY(26px)'
        hidden.push(s)
      }
    }
    if (hidden.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement
            el.style.opacity = '1'
            el.style.transform = 'none'
            io.unobserve(el)
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )
    hidden.forEach((s) => io.observe(s))
    return () => io.disconnect()
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
