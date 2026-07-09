'use client'

import React from 'react'

export type NavLink = { label: string; href: string }

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
