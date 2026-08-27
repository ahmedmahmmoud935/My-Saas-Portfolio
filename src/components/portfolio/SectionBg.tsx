import React from 'react'

export type SectionBgConfig = {
  mode?: string | null
  color?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  fixed?: boolean | null
  dim?: number | null
  posX?: number | null
  posY?: number | null
}

const dimOf = (c?: SectionBgConfig | null) => Math.min(100, Math.max(0, c?.dim ?? 45)) / 100

/** One theme's backdrop layer. Both are rendered; CSS reveals the active one. */
function Layer({ config, theme }: { config: SectionBgConfig; theme: 'dark' | 'light' }) {
  const mode = config.mode || 'color'
  if (mode === 'image' && config.imageUrl) {
    // "Fixed" used to mean `background-attachment: fixed`, which forces the
    // browser to repaint the picture on every scroll frame — the shimmer you
    // could see. A sticky layer gives the same held-in-place look and is moved
    // by the compositor instead, so nothing is repainted.
    return (
      <span className={`pf-sec-layer for-${theme}${config.fixed ? ' pinned' : ''}`}>
        <span
          className="pf-sec-media"
          style={{
            backgroundImage: `url(${JSON.stringify(config.imageUrl)})`,
            backgroundPosition: `${config.posX ?? 50}% ${config.posY ?? 50}%`,
          }}
        />
        <span className="pf-sec-dim" style={{ opacity: dimOf(config) }} />
      </span>
    )
  }
  if (mode === 'video' && config.videoUrl) {
    return (
      <span className={`pf-sec-layer for-${theme}`}>
        <video
          className="pf-sec-media"
          src={config.videoUrl}
          style={{ objectPosition: `${config.posX ?? 50}% ${config.posY ?? 50}%` }}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        />
        <span className="pf-sec-dim" style={{ opacity: dimOf(config) }} />
      </span>
    )
  }
  return null
}

/**
 * Wraps one page section so it can carry its own backdrop — a flat colour, a
 * photo, or a looping video — independently of the page background.
 *
 * Light and dark are configured separately and both are rendered here, because
 * the theme switch happens in the browser after this markup is already sent.
 */
export default function SectionBg({
  dark,
  light,
  children,
}: {
  dark?: SectionBgConfig | null
  light?: SectionBgConfig | null
  children: React.ReactNode
}) {
  if (!dark && !light) return <>{children}</>

  const colourOf = (c?: SectionBgConfig | null) =>
    c && (c.mode || 'color') === 'color' ? c.color || null : null
  const darkColour = colourOf(dark)
  const lightColour = colourOf(light)
  const hasMedia =
    (dark && dark.mode !== 'color') || (light && light.mode !== 'color') ? true : false

  return (
    <div
      className={`pf-sec-bg${hasMedia ? ' media' : ''}`}
      style={
        {
          ...(darkColour ? { '--sec-bg': darkColour } : {}),
          ...(lightColour ? { '--sec-bg-light': lightColour } : {}),
        } as React.CSSProperties
      }
    >
      {dark && <Layer config={dark} theme="dark" />}
      {light && <Layer config={light} theme="light" />}
      {hasMedia ? <div className="pf-sec-inner">{children}</div> : children}
    </div>
  )
}
