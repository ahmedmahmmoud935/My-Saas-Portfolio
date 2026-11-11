import type { CSSProperties } from 'react'

// The same presets as classic, shared by studio's render and live preview.
const gradients: Record<string, string> = {"aurora": "linear-gradient(120deg, #06b6d4, #3b82f6, #8b5cf6, #06b6d4)", "sunset": "linear-gradient(120deg, #f97316, #ef4444, #ec4899, #f97316)", "ocean": "linear-gradient(120deg, #0ea5e9, #2563eb, #06b6d4, #0ea5e9)", "candy": "linear-gradient(120deg, #ec4899, #a855f7, #8b5cf6, #ec4899)", "mint": "linear-gradient(120deg, #10b981, #14b8a6, #22d3ee, #10b981)", "ember": "linear-gradient(120deg, #ef4444, #f59e0b, #f97316, #ef4444)", "dusk": "linear-gradient(120deg, #6366f1, #8b5cf6, #ec4899, #6366f1)", "peach": "linear-gradient(120deg, #ffe4d2, #fcd5e5, #fff1c9, #ffe4d2)", "sky": "linear-gradient(120deg, #d6e8ff, #dff4fb, #e8e2ff, #d6e8ff)", "fresh": "linear-gradient(120deg, #d3f5e4, #d2f3f0, #e6f6d6, #d3f5e4)", "lilac": "linear-gradient(120deg, #ebe4ff, #fbe1ef, #dfe6ff, #ebe4ff)", "midnight": "linear-gradient(120deg, #0b1026, #17245c, #2a1f5c, #0b1026)", "embers": "linear-gradient(120deg, #140806, #5a1d0c, #7a2e0e, #140806)", "forest": "linear-gradient(120deg, #03140f, #0b3b2e, #0d3440, #03140f)", "nebula": "linear-gradient(120deg, #120b2b, #3b1560, #5c1540, #120b2b)"}

export function studioHeroStyle(h: { height?: number | null; gradient?: string | null; gradientDark?: string | null }): CSSProperties {
  return {
    // 82 is the editor's historical default; keep studio's natural height there.
    '--st-hero-height': h.height && h.height !== 82 ? `${h.height}vh` : 'auto',
    '--st-hero-gradient': gradients[h.gradient || ''] || 'none',
    '--st-hero-gradient-dark': gradients[h.gradientDark || h.gradient || ''] || 'none',
  } as CSSProperties
}
