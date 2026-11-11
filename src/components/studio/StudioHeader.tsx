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
  contact,
  langHref,
  isEn,
  ltr,
  base = '',
  articlesHref,
}: {
  ui: StudioUI
  name: string
  monogram: { text: string; logoUrl: string | null }
  links: { id: string; label: string }[]
  digital: boolean
  /** Whether there is a contact section for "let's talk" to go to. */
  contact: boolean
  langHref: string
  isEn: boolean
  ltr: boolean
  /** Where the section links point: '' on the home page, its address elsewhere. */
  articlesHref?: string
  base?: string
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

  // Arrows follow the page's direction, which can differ from its language.
  const Arrow = ltr ? 'arrow-right' : 'arrow-left'

  return (
    <>
      <header className="st-site-header">
        <div className="st-shell st-header-inner">
          <a href={base || '#top'} className="st-brand" aria-label={name}>
            <Monogram monogram={monogram} />
            <span className="st-brand-caption">{name}</span>
          </a>
          <nav className="st-desktop-nav" aria-label={ui.navLabel}>
            {links
              .filter((l) => l.id !== 'contact')
              .map((l) => (
                <a key={l.id} href={`${base}#${l.id}`}>
                  {l.label}
                  {l.id === 'products' && <Icon name="code-xml" size={16} />}
                </a>
              ))}
            {digital && (
              <a href={`${base}#products`}>
                {ui.nav.digital}
                <Icon name="code-xml" size={16} />
              </a>
            )}
            {articlesHref && <a href={articlesHref}>{ui.articles}</a>}
          </nav>
          <div className="st-header-actions">
            <button className="st-icon-button st-theme-switch" onClick={toggleTheme} aria-label={ui.theme}>
              <Icon name={dark ? 'sun' : 'moon'} size={17} />
            </button>
            <a className="st-language-switch" href={langHref} aria-label={ui.langLabel}>
              {ui.langShort}
            </a>
            {contact && (
              <a className="st-button st-small st-primary st-header-cta" href={`${base}#contact`}>
                {ui.talk}
                <Icon name="arrow-up-right" size={16} />
              </a>
            )}
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
            <a key={l.id} href={`${base}#${l.id}`} onClick={() => setOpen(false)}>
              {l.label}
              <Icon name={Arrow} />
            </a>
          ))}
          {digital && (
            <a href={`${base}#products`} onClick={() => setOpen(false)}>
              {ui.nav.digitalLong}
              <Icon name="code-xml" />
            </a>
          )}
          {articlesHref && <a href={articlesHref} onClick={() => setOpen(false)}>{ui.articles}<Icon name={Arrow} /></a>}
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
