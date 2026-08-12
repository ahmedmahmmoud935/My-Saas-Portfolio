import type { CSSProperties } from 'react'

/** The shape the Design tab saves for one theme's page background. */
export type BgConfig = {
  preset?: string | null
  type?: string | null
  color1?: string | null
  color2?: string | null
  color3?: string | null
  imageUrl?: string | null
  imageFixed?: boolean | null
  dim?: number | null
}

/** Soft decorative tints — the original "preset" backgrounds. */
const TINTS: Record<string, string> = {
  dark: '',
  ocean: 'radial-gradient(1200px 640px at 82% -12%, rgba(56,189,248,0.16), transparent 60%)',
  sunset: 'radial-gradient(1200px 640px at 82% -12%, rgba(249,115,22,0.16), transparent 60%)',
  forest: 'radial-gradient(1200px 640px at 82% -12%, rgba(16,185,129,0.14), transparent 60%)',
  mono: 'radial-gradient(1200px 640px at 82% -12%, rgba(160,160,160,0.10), transparent 60%)',
  pearl: 'radial-gradient(1200px 640px at 82% -12%, rgba(120,120,120,0.08), transparent 60%)',
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

  const tint = bg.preset ? TINTS[bg.preset] : ''

  // Solid: the chosen colour replaces the palette background, with the
  // decorative tint (if any) sitting on top of it.
  if (type === 'solid' && color1) {
    return { style: { background: tint ? `${tint}, ${color1}` : color1 }, animated: false, scrolls: false }
  }

  return tint ? { style: { background: tint }, animated: false, scrolls: false } : null
}

/** Dim strength (0–1) to lay over an image background so text stays readable. */
export function dimOpacity(bg?: BgConfig | null): number {
  return Math.min(100, Math.max(0, bg?.dim ?? 55)) / 100
}
