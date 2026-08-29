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

/** The section's backdrop. One layer for both themes — only the veil over it
 *  changes colour, and CSS does that. */
function Layer({ config }: { config: SectionBgConfig }) {
  const mode = config.mode || 'color'
  if (mode === 'image' && config.imageUrl) {
    // "Fixed" used to mean `background-attachment: fixed`, which forces the
    // browser to repaint the picture on every scroll frame — the shimmer you
    // could see. A sticky layer gives the same held-in-place look and is moved
    // by the compositor instead, so nothing is repainted.
    return (
      <span className={`pf-sec-layer${config.fixed ? ' pinned' : ''}`}>
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
      <span className="pf-sec-layer">
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
  config,
  children,
}: {
  config?: SectionBgConfig | null
  children: React.ReactNode
}) {
  if (!config) return <>{children}</>

  const isColour = (config.mode || 'color') === 'color'
  const colour = isColour ? config.color || null : null
  const hasMedia = !isColour

  return (
    <div
      className={`pf-sec-bg${hasMedia ? ' media' : ''}`}
      style={(colour ? { '--sec-bg': colour } : {}) as React.CSSProperties}
    >
      <Layer config={config} />
      {hasMedia ? <div className="pf-sec-inner">{children}</div> : children}
    </div>
  )
}
