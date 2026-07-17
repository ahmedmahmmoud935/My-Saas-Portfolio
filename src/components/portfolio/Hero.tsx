import React from 'react'

// Accent the last word of a multi-word name (e.g. "Ahmed Mahmoud").
function renderName(name: string): React.ReactNode {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) return name
  const last = parts.pop()
  return (
    <>
      {parts.join(' ')} <span className="accent">{last}</span>
    </>
  )
}

export default function Hero({
  eyebrow,
  name,
  btn1,
  btn2,
  coverUrl,
  overlay = 45,
  heightVh = 82,
  variant = 'split',
  coverSize = 'cover',
  gradient = 'none',
  posX = 50,
  posY = 50,
}: {
  eyebrow?: string
  name: string
  btn1?: string
  btn2?: string
  coverUrl?: string | null
  overlay?: number
  heightVh?: number
  variant?: string
  coverSize?: string
  gradient?: string
  posX?: number
  posY?: number
}) {
  // A chosen gradient replaces the (missing) cover image.
  const showGradient = !coverUrl && gradient && gradient !== 'none'
  return (
    <header
      className={`hero hero-${variant}`}
      id="hero"
      style={{ minHeight: `${heightVh}vh`, ['--hero-overlay' as string]: overlay / 100 } as React.CSSProperties}
    >
      {showGradient && (
        <>
          <div className={`hero-bg hero-grad hg-${gradient}`} aria-hidden />
          <div className="hero-overlay" />
        </>
      )}
      {coverUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hero-bg"
            src={coverUrl}
            alt=""
            style={{
              // The framed "split" image always fills its frame (cover), set in CSS;
              // other variants honour the contain/cover size control.
              ...(variant === 'split' ? {} : { objectFit: coverSize as React.CSSProperties['objectFit'] }),
              objectPosition: `${posX}% ${posY}%`,
            }}
          />
          <div className="hero-overlay" />
        </>
      )}
      <div className="container hero-inner">
        <h1 className="hero-name">{renderName(name)}</h1>
        {eyebrow && <p className="hero-eyebrow">{eyebrow}</p>}
        <div className="hero-btns">
          {btn1 && (
            <a className="btn btn-primary" href="#projects">
              {btn1}
            </a>
          )}
          {btn2 && (
            <a className="btn btn-outline" href="#contact">
              {btn2}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
