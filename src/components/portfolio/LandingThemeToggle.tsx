'use client'

import React, { useEffect, useState } from 'react'

const SunIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
const MoonIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

/**
 * Light/dark for the landing page.
 *
 * It writes the same `data-theme` attribute and `pf-theme` key the portfolio
 * uses, so a visitor who set light mode on a portfolio arrives here already in
 * light mode — the frontend layout applies the saved value before first paint.
 */
export default function LandingThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // Read after mount: the server has no idea which one this visitor picked, so
  // rendering either here would be a hydration mismatch.
  useEffect(() => {
    setTheme((document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark')
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('pf-theme', next)
    } catch {
      // Private browsing refuses to store; the switch still works for this visit.
    }
  }

  return (
    <button
      type="button"
      className="lp-lang lp-theme"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'switch to light mode' : 'switch to dark mode'}
      title={theme === 'dark' ? 'Light' : 'Dark'}
    >
      {theme === 'dark' ? SunIcon : MoonIcon}
    </button>
  )
}
