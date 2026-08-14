import type { CSSProperties } from 'react'

/** The shape the Design tab saves for one theme's page background. */
export type BgConfig = {
  type?: string | null
  color1?: string | null
  color2?: string | null
  color3?: string | null
  imageUrl?: string | null
  imageFixed?: boolean | null
  dim?: number | null
}

/**
 * Turn a saved background into an inline style for `.pf-bg-layer`.
 *
 * Returns null when the theme has nothing of its own to draw, so the page just
 * shows the palette's base colour. The animated variant only sets up the
 * gradient here — the movement itself is the `pfBgShift` keyframes in CSS,
 * switched on by the `animated` class.
 */
export function pageBackground(bg?: BgConfig | null): {
  style: CSSProperties
  animated: boolean
  /** Layer scrolls away with the page instead of being pinned to the viewport. */
  scrolls: boolean
} | null {
  if (!bg) return null
  const { type, color1, color2, color3 } = bg

  if (type === 'image' && bg.imageUrl) {
    // The layer is normally pinned to the viewport, which *is* the parallax
    // look. "Scrolls with the page" therefore can't be done with
    // background-attachment — the element itself has to stop being fixed.
    return {
      style: {
        backgroundImage: `url(${JSON.stringify(bg.imageUrl)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      },
      animated: false,
      scrolls: bg.imageFixed === false,
    }
  }

  if (type === 'animated' && color1) {
    return {
      style: {
        backgroundImage: `linear-gradient(-45deg, ${color1}, ${color2 || color1}, ${
          color3 || color2 || color1
        }, ${color1})`,
        backgroundSize: '400% 400%',
      },
      animated: true,
      scrolls: false,
    }
  }

  if (type === 'gradient' && color1) {
    return {
      style: { background: `linear-gradient(160deg, ${color1}, ${color2 || 'transparent'})` },
      animated: false,
      scrolls: false,
    }
  }

  // Solid: the chosen colour replaces the palette background.
  if (type === 'solid' && color1) {
    return { style: { background: color1 }, animated: false, scrolls: false }
  }

  return null
}

/** Dim strength (0–1) to lay over an image background so text stays readable. */
export function dimOpacity(bg?: BgConfig | null): number {
  return Math.min(100, Math.max(0, bg?.dim ?? 55)) / 100
}
