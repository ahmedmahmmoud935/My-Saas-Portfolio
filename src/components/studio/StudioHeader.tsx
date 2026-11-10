'use client'

import React, { useEffect, useState } from 'react'
import { Icon } from './icons'
import type { StudioUI } from '@/lib/studio-data'

/**
 * The reference header: monogram and name, the section links, the theme and
 * language switches, the "let's talk" button, and the phone menu.
 *
 * The theme is the platform's: stored as `pf-theme`, set on <html> before the
 * page paints. The studio template starts light, as the reference does.
 */
export default function StudioHeader({
  ui,
  name,
  monogram,
  links,
  digital,
  langHref,
  isEn,
}: {
  ui: StudioUI
  name: string
  monogram: { text: string; logoUrl: string | null }
  links: { id: string; label: string }[]
  digital: boolean
  langHref: string
  isEn: boolean
}) {
  const [dark, setDark] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark')
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    try {
      localStorage.setItem('pf-theme', next ? 'dark' : 'light')
    } catch {
      /* private mode */
    }
  }

  const Arrow = isEn ? 'arrow-right' : 'arrow-left'

  return (
    <>
      <header className="st-site-header">
        <div className="st-shell st-header-inner">
          <a href="#home" className="st-brand" aria-label={name}>
            <Monogram monogram={monogram} />
            <span className="st-brand-caption">{name}</span>
          </a>
          <nav className="st-desktop-nav" aria-label={ui.navLabel}>
            {links
              .filter((l) => l.id !== 'contact')
              .map((l) => (
                <a key={l.id} href={`#${l.id}`}>
                  {l.label}
                </a>
              ))}
            {digital && (
              <a href="#digital">
                {ui.nav.digital}
                <Icon name="code-xml" size={16} />
              </a>
            )}
          </nav>
          <div className="st-header-actions">
            <button className="st-icon-button st-theme-switch" onClick={toggleTheme} aria-label={ui.theme}>
              <Icon name={dark ? 'sun' : 'moon'} size={17} />
            </button>
            <a className="st-language-switch" href={langHref} aria-label={ui.langLabel}>
              {ui.langShort}
            </a>
            <a className="st-button st-small st-primary st-header-cta" href="#contact">
              {ui.talk}
              <Icon name="arrow-up-right" size={16} />
            </a>
            <button
              className="st-icon-button st-menu-toggle"
              aria-controls="st-mobile-nav"
              aria-expanded={open}
              aria-label={open ? ui.close : ui.menu}
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? 'x' : 'menu'} />
            </button>
          </div>
        </div>
      </header>
      {open && (
        <nav className="st-mobile-nav" id="st-mobile-nav">
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)}>
              {l.label}
              <Icon name={Arrow} />
            </a>
          ))}
          {digital && (
            <a href="#digital" onClick={() => setOpen(false)}>
              {ui.nav.digitalLong}
              <Icon name="code-xml" />
            </a>
          )}
        </nav>
      )}
    </>
  )
}

/** "am®" — or the client's own logo, when one is uploaded. */
export function Monogram({ monogram, as = 'span', href }: { monogram: { text: string; logoUrl: string | null }; as?: 'span' | 'a'; href?: string }) {
  const inner = monogram.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={monogram.logoUrl} alt="" style={{ height: 40, width: 'auto' }} />
  ) : (
    <>
      {monogram.text}
      <span>®</span>
    </>
  )
  return as === 'a' ? (
    <a className="st-monogram" dir="ltr" href={href}>
      {inner}
    </a>
  ) : (
    <span className="st-monogram" dir="ltr">
      {inner}
    </span>
  )
}
