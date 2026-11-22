'use client'
import React, { useState } from 'react'
export default function LandingMenu({
  children,
  openLabel,
  closeLabel,
  label,
}: {
  children: React.ReactNode
  openLabel: string
  closeLabel: string
  label: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        className="menu-button"
        aria-expanded={open}
        aria-controls="landing-navigation"
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen(!open)}
      >
        {open ? '×' : '☰'}
      </button>
      <nav
        id="landing-navigation"
        aria-label={label}
        className={open ? 'open' : ''}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) setOpen(false)
        }}
      >
        {children}
      </nav>
    </>
  )
}
