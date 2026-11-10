'use client'

import { useEffect } from 'react'

/**
 * A refresh keeps the reader where they were.
 *
 * Reloading a portfolio sent it back to the top: the page scrolls smoothly
 * (scroll-behavior: smooth), and the browser's own restore does not survive
 * that with content still settling. This remembers the position per address
 * for the tab, and on a reload puts it back at once, after the page has its
 * height. Opening the page fresh, or following a link with a #section, is
 * left to the browser.
 */
export default function ScrollMemory() {
  useEffect(() => {
    const key = `pf-scroll:${location.pathname}${location.search}`
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const saved = Number(sessionStorage.getItem(key) || 0)

    if (nav?.type === 'reload' && saved > 0 && !location.hash) {
      const restore = () => window.scrollTo({ top: saved, behavior: 'instant' as ScrollBehavior })
      restore()
      // Pictures and fonts can still change the height; try again once they have.
      const late = () => restore()
      window.addEventListener('load', late, { once: true })
      document.fonts?.ready.then(late).catch(() => {})
      const t = setTimeout(late, 600)
      return () => clearTimeout(t)
    }
    return undefined
  }, [])

  useEffect(() => {
    const key = `pf-scroll:${location.pathname}${location.search}`
    let raf = 0
    const save = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        try {
          sessionStorage.setItem(key, String(Math.round(window.scrollY)))
        } catch {
          /* storage full or blocked */
        }
      })
    }
    window.addEventListener('scroll', save, { passive: true })
    window.addEventListener('pagehide', save)
    return () => {
      window.removeEventListener('scroll', save)
      window.removeEventListener('pagehide', save)
    }
  }, [])

  return null
}
