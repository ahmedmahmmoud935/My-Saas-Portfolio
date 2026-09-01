import React from 'react'

/**
 * The heading, with the last word accented — and broken exactly where it was
 * typed.
 *
 * A newline in the field used to collapse to a space, so a two-line heading
 * could only be had by making the window narrow enough to wrap on its own. The
 * lines are split here rather than left to `white-space: pre-line` because the
 * accent has to land on the last word of the LAST line, which needs the lines
 * to be known.
 */
function renderName(name: string): React.ReactNode {
  const lines = name.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return name

  return lines.map((line, i) => {
    const last = i === lines.length - 1
    const parts = line.split(/\s+/)
    // Only the final line's final word is accented; a one-word heading keeps
    // its colour rather than turning entirely into the accent.
    const accentWord = last && (parts.length > 1 || lines.length > 1) ? parts.pop() : null
    return (
      <React.Fragment key={i}>
        {i > 0 && <br />}
        {parts.join(' ')}
        {accentWord && <>{parts.length ? ' ' : ''}<span className="accent">{accentWord}</span></>}
      </React.Fragment>
    )
  })
}

export default function Hero({
  eyebrow,
  name,
  desc,
  btn1,
  btn2,
  coverUrl,
  overlay = 45,
  overlayLight = 25,
  heightVh = 82,
  variant = 'split',
  coverSize = 'cover',
  gradient = 'none',
  posX = 50,
  posY = 50,
}: {
  eyebrow?: string
  name: string
  desc?: string
  btn1?: string
  btn2?: string
  coverUrl?: string | null
  overlay?: number
  overlayLight?: number
  heightVh?: number
  variant?: string
  coverSize?: string
  gradient?: string
  posX?: number
  posY?: number
}) {
  // A chosen gradient takes over the cover (even if an image is still uploaded).
  const showGradient = Boolean(gradient && gradient !== 'none')
  return (
    <header
      className={`hero hero-${variant}`}
      id="hero"
      style={
        {
          // Published as a variable, not a plain min-height: one layout set its
          // own height with `!important`, which an inline style cannot beat —
          // so the height control did nothing on that layout. Every layout
          // reads this now.
          ['--hero-h' as string]: `${heightVh}vh`,
          // Both strengths travel to CSS; the theme decides which one is used
          // and whether the veil is black or white.
          ['--hero-veil-dark' as string]: overlay / 100,
          ['--hero-veil-light' as string]: overlayLight / 100,
        } as React.CSSProperties
      }
    >
      {showGradient && (
        <>
          <div className={`hero-bg hero-grad hg-${gradient}`} aria-hidden />
          <div className="hero-overlay" />
        </>
      )}
      {!showGradient && coverUrl && (
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
        {desc && <p className="hero-desc">{desc}</p>}
        <div className="hero-btns">
          {/* The label is wrapped so it can be cap-centred: a button is a flex
              container, and bare text inside one lives in an anonymous box that
              no rule can reach. */}
          {btn1 && (
            <a className="btn btn-primary" href="#projects">
              <span className="btn-label">{btn1}</span>
            </a>
          )}
          {btn2 && (
            <a className="btn btn-outline" href="#contact">
              <span className="btn-label">{btn2}</span>
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
