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

export default function Navbar({
  logo,
  links,
  langHref,
  langLabel = 'EN',
}: {
  logo: string
  links: NavLink[]
  langHref?: string
  langLabel?: string
}) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const t = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
    setTheme(t)
  }, [])

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
      <div className="nav-logo display">{logo}</div>
      <ul className="nav-links">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
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
    </nav>
  )
}
