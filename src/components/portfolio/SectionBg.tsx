import React from 'react'

export type SectionBgConfig = {
  mode?: string | null
  color?: string | null
  colorLight?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  fixed?: boolean | null
  dim?: number | null
}

/**
 * Wraps one page section so it can carry its own backdrop — a flat colour, a
 * photo, or a looping video — independently of the page background.
 *
 * Colours are supplied for both themes at once (as CSS variables) rather than
 * picked here, because the light/dark switch happens client-side after this
 * markup is already rendered.
 */
export default function SectionBg({
  config,
  children,
}: {
  config?: SectionBgConfig | null
  children: React.ReactNode
}) {
  if (!config) return <>{children}</>

  const mode = config.mode || 'color'
  const dim = Math.min(100, Math.max(0, config.dim ?? 45)) / 100

  if (mode === 'color') {
    const color = config.color || config.colorLight
    if (!color && !config.colorLight) return <>{children}</>
    return (
      <div
        className="pf-sec-bg"
        style={
          {
            '--sec-bg': config.color || 'transparent',
            '--sec-bg-light': config.colorLight || config.color || 'transparent',
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    )
  }

  if (mode === 'image' && config.imageUrl) {
    return (
      <div className="pf-sec-bg media">
        <span
          className="pf-sec-media"
          style={{
            backgroundImage: `url(${JSON.stringify(config.imageUrl)})`,
            backgroundAttachment: config.fixed ? 'fixed' : 'scroll',
          }}
        />
        <span className="pf-sec-dim" style={{ opacity: dim }} />
        <div className="pf-sec-inner">{children}</div>
      </div>
    )
  }

  if (mode === 'video' && config.videoUrl) {
    return (
      <div className="pf-sec-bg media">
        <video
          className="pf-sec-media"
          src={config.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          // Decorative only — never pull it in before the page is usable.
          preload="none"
        />
        <span className="pf-sec-dim" style={{ opacity: dim }} />
        <div className="pf-sec-inner">{children}</div>
      </div>
    )
  }

  return <>{children}</>
}
