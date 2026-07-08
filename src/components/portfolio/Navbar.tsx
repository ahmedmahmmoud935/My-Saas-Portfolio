'use client'

import React, { useState } from 'react'

export type NavLink = { label: string; href: string }

export default function Navbar({
  logo,
  links,
}: {
  logo: string
  links: NavLink[]
}) {
  const [, setOpen] = useState(false)
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
      <button className="nav-lang" onClick={() => setOpen((o) => !o)} aria-label="language">
        EN
      </button>
    </nav>
  )
}
