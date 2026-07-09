'use client'

import React from 'react'

export type MBtn = { pos: string; type: string; target: string; icon: string; label: string }

const waLink = (n?: string) =>
  n ? `https://wa.me/${n.replace(/[^0-9]/g, '')}` : '#'

function iconFor(type: string) {
  switch (type) {
    case 'whatsapp':
      return '💬'
    case 'articles':
      return '📖'
    case 'link':
      return '🔗'
    default:
      return '▦'
  }
}

export default function MobileBar({
  buttons,
  whatsapp,
  username,
}: {
  buttons: MBtn[]
  whatsapp?: string
  username: string
}) {
  if (!buttons.length) return null
  const order = ['right', 'center', 'left']
  const sorted = [...buttons].sort((a, b) => order.indexOf(a.pos) - order.indexOf(b.pos))

  const hrefFor = (b: MBtn) => {
    switch (b.type) {
      case 'whatsapp':
        return waLink(whatsapp)
      case 'articles':
        return `/${username}/articles`
      case 'link':
        return b.target || '#'
      default:
        return `#${b.target}`
    }
  }

  return (
    <nav className="mobile-bar">
      {sorted.map((b, i) => (
        <a key={i} href={hrefFor(b)} className={`mb-btn ${b.pos === 'center' ? 'center' : ''}`}>
          <span className="mb-icon">{iconFor(b.type)}</span>
          <span className="mb-label">{b.label}</span>
        </a>
      ))}
    </nav>
  )
}
