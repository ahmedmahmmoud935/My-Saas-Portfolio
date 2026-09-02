'use client'

import React, { useEffect, useState } from 'react'

export type NavLink = { label: string; href: string }

const SunIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
const MoonIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)
const MenuIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)
const CloseIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export default function Navbar({
  logo,
  logoUrl,
  homeHref,
  links,
  langHref,
  langLabel = 'EN',
}: {
  /** Fallback mark: the first letter of the name. */
  logo: string
  /** The uploaded logo, when the owner has set one. */
  logoUrl?: string | null
  /** Where "home" is. Omitted on the portfolio itself, where it scrolls up. */
  homeHref?: string
  links: NavLink[]
  langHref?: string
  langLabel?: string
}) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  // The section menu on a phone, where the inline list has nowhere to sit.
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const t = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
    setTheme(t)
  }, [])

  // Escape closes it, and so does growing the window past the width that hides
  // the inline list — otherwise the panel stays open over a menu that is
  // already visible.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    const wide = window.matchMedia('(min-width: 821px)')
    const onWide = () => wide.matches && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    wide.addEventListener('change', onWide)
    return () => {
      window.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
    }
  }, [menuOpen])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('pf-theme', next)
    } catch {
      /* ignore */
    }
  }

  return (
    <nav className="nav">
      {/* The logo doubles as the way home: on the portfolio it returns you to
          the top, elsewhere it goes back to the portfolio. */}
      {homeHref ? (
        <a className="nav-logo display" href={homeHref} aria-label="home">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" />
          ) : (
            logo
          )}
        </a>
      ) : (
        <button
          type="button"
          className="nav-logo display"
          aria-label="back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" />
          ) : (
            logo
          )}
        </button>
      )}
      <ul className="nav-links">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>

      {/* Phone only. The inline list is hidden under 820px and the sections
          were unreachable from the top of the page. */}
      {links.length > 0 && (
        <button
          type="button"
          className="nav-burger"
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          aria-label={menuOpen ? 'close menu' : 'open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? CloseIcon : MenuIcon}
        </button>
      )}
      <button
        className="nav-theme"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'switch to light mode' : 'switch to dark mode'}
        title={theme === 'dark' ? 'Light' : 'Dark'}
      >
        {theme === 'dark' ? SunIcon : MoonIcon}
      </button>
      {langHref ? (
        <a className="nav-lang" href={langHref} aria-label="language">
          {langLabel}
        </a>
      ) : (
        <span className="nav-lang" style={{ opacity: 0.4 }}>
          {langLabel}
        </span>
      )}

      {/* Rendered always so it can be animated open and closed; `hidden` keeps
          it out of the tab order and out of a screen reader while it is shut. */}
      <div className={`nav-menu${menuOpen ? ' open' : ''}`} id="nav-menu" hidden={!menuOpen}>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
