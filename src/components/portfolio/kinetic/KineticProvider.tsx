'use client'

import React, { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from 'framer-motion'

/**
 * Wraps the kinetic-theme page: enables buttery smooth scrolling (Lenis) and
 * paints an animated "aurora" backdrop behind everything. Both are skipped when
 * the visitor prefers reduced motion.
 */
export default function KineticProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [reduced])

  return (
    <>
      {!reduced && (
        <div className="kx-aurora" aria-hidden>
          <span className="kx-blob kx-blob-1" />
          <span className="kx-blob kx-blob-2" />
          <span className="kx-blob kx-blob-3" />
          <span className="kx-grain" />
        </div>
      )}
      {children}
    </>
  )
}
