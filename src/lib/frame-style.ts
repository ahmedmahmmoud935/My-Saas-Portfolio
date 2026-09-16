import type React from 'react'

/**
 * A picture framed by hand: zoomed toward a point, and that point kept in view.
 *
 * The same numbers drive the landing card and the editor's preview of it, so
 * what the owner sets is what the page shows. Untouched (100%, centred) it
 * returns nothing, and the card's own stylesheet decides as it always did.
 */
export function frameStyle(f?: { zoom?: number; x?: number; y?: number }): React.CSSProperties | undefined {
  const zoom = f?.zoom ?? 100
  const x = f?.x ?? 50
  const y = f?.y ?? 50
  if (zoom === 100 && x === 50 && y === 50) return undefined
  return {
    objectPosition: `${x}% ${y}%`,
    transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
    transformOrigin: `${x}% ${y}%`,
  }
}
