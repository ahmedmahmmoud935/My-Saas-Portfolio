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
}: {
  eyebrow?: string
  name: string
  btn1?: string
  btn2?: string
  coverUrl?: string | null
  overlay?: number
  heightVh?: number
}) {
  return (
    <header className="hero" id="hero" style={{ minHeight: `${heightVh}vh` }}>
      {coverUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hero-bg" src={coverUrl} alt="" />
          <div
            className="hero-overlay"
            style={{
              background: `linear-gradient(90deg, var(--bg) 8%, transparent 70%), rgba(0,0,0,${
                overlay / 100
              })`,
            }}
          />
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
