'use client'

import React, { useEffect, useRef } from 'react'

// Elements inside a section that cascade in (staggered) when it reveals.
const STAGGER_SEL =
  '.section-head, .project-card, .card, .tool, .exp-item, .chip, .cs-card, .achievement, .logo-item, .testimonial, .about-photo, .contact-info, .contact-card, .lp-card'

/**
 * Applies the tenant's Motion settings on the client:
 *  - anim: scroll-reveal for sections + a staggered cascade of their contents
 *  - cursor: a fast dot-ring custom cursor
 * Both are no-ops when set to their default/off value.
 */
export default function MotionFx({ anim, cursor }: { anim?: string; cursor?: string }) {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  // ── Scroll reveal (WAAPI so it's independent of CSS transitions) ──
  useEffect(() => {
    if (!anim || anim === 'none') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector('.pf-root')
    if (!root) return
    const sections = Array.from(root.querySelectorAll<HTMLElement>('.section'))
    const vh = window.innerHeight
    const ease = 'cubic-bezier(.16,1,.3,1)'
    const up = anim === 'fade-up'
    const hidden: HTMLElement[] = []
    for (const s of sections) {
      if (s.getBoundingClientRect().top > vh * 0.82) {
        s.style.opacity = '0'
        hidden.push(s)
      }
    }
    if (hidden.length === 0) return

    const reveal = (el: HTMLElement) => {
      el.style.opacity = '1'
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease', fill: 'both' })
      // Cascade the section's notable children for a motion you actually feel.
      const items = Array.from(el.querySelectorAll<HTMLElement>(STAGGER_SEL)).slice(0, 14)
      const targets = items.length ? items : [el]
      targets.forEach((it, i) => {
        it.animate(
          [
            { opacity: 0, transform: up ? 'translateY(34px)' : 'translateY(0)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 620, delay: Math.min(i, 10) * 85, easing: ease, fill: 'both' },
        )
      })
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal(e.target as HTMLElement)
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    )
    hidden.forEach((s) => io.observe(s))

    // Safety net: reveal anything still hidden after 5s (e.g. observer missed).
    const safety = window.setTimeout(() => {
      io.disconnect()
      hidden.forEach((s) => (s.style.opacity = '1'))
    }, 5000)
    return () => {
      io.disconnect()
      window.clearTimeout(safety)
    }
  }, [anim])

  // ── Fast dot-ring cursor (position tracked in vars — no layout reads) ──
  useEffect(() => {
    if (cursor !== 'dot-ring') return
    if (window.matchMedia('(pointer: coarse)').matches) return // skip on touch
    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my
    let raf = 0
    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (dot.current) dot.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`
    }
    const loop = () => {
      rx += (mx - rx) * 0.35
      ry += (my - ry) * 0.35
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`
      raf = requestAnimationFrame(loop)
    }
    const over = (e: Event) => {
      const t = e.target as HTMLElement
      ring.current?.classList.toggle('hover', !!t.closest('a, button'))
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
