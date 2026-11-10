import { STUDIO_LOOK } from './design-types'

/**
 * What the Design settings mean for the studio template: the CSS variables
 * and data attributes set on `.st-root`.
 *
 * Client-safe on purpose: the portfolio page calls it with the saved
 * settings, and the dashboard's live preview calls it with the unsaved form,
 * so a change in Design looks the same before and after saving.
 */

type Colors = Record<string, string | null | undefined>
export type StudioLookInput = {
  colors?: Colors | null
  style?: Record<string, unknown> | null
  themeConfig?: { components?: Record<string, unknown> | null } | null
  heroCover?: Record<string, unknown> | null
} | null

const trim = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

/* The fonts the platform loads, by the id the Design tab saves. */
const AR_FONTS: Record<string, string> = {
  tajawal: 'var(--font-cairo)',
  cairo: 'var(--f-cairo)',
  almarai: 'var(--f-almarai)',
  markazi: 'var(--f-markazi)',
  kufam: 'var(--f-kufam)',
}
const LATIN_FONTS: Record<string, string> = {
  montserrat: 'var(--font-montserrat)',
  inter: 'var(--f-inter)',
  playfair: 'var(--f-playfair)',
  cormorant: 'var(--f-cormorant)',
  bebas: 'var(--f-bebas)',
  poppins: 'var(--f-poppins)',
  manrope: 'var(--f-manrope)',
}

/* The reference's own surfaces for its palette. With other colours they are
   worked out from the client's, in the same proportions. */
const REF = {
  light: { soft: '#efeae1', line: '#ddd6cb', accentLight: '#f5e0d3', hover: '#963918' },
  dark: { soft: '#252923', line: '#464a40', accentLight: '#37362b', strong: '#c77649' },
}

function paletteVars(c: Colors): Record<string, string> {
  const pick = (k: string, d: string) => (trim(c[k]) || d).toLowerCase()
  const L = {
    bg: pick('bgLight', STUDIO_LOOK.colors.bgLight),
    surface: pick('bg2Light', STUDIO_LOOK.colors.bg2Light),
    ink: pick('textLight', STUDIO_LOOK.colors.textLight),
    muted: pick('subtextLight', STUDIO_LOOK.colors.subtextLight),
    accent: pick('accentLight', STUDIO_LOOK.colors.accentLight),
  }
  const D = {
    bg: pick('bg', STUDIO_LOOK.colors.bg),
    surface: pick('bg2', STUDIO_LOOK.colors.bg2),
    ink: pick('text', STUDIO_LOOK.colors.text),
    muted: pick('subtext', STUDIO_LOOK.colors.subtext),
    accent: pick('accent', STUDIO_LOOK.colors.accent),
  }
  const same = (o: Record<string, string>, ref: Record<string, string>) =>
    Object.entries(o).every(([k, v]) => v === ref[k].toLowerCase())
  const refL = same(L, { bg: STUDIO_LOOK.colors.bgLight, surface: STUDIO_LOOK.colors.bg2Light, ink: STUDIO_LOOK.colors.textLight, muted: STUDIO_LOOK.colors.subtextLight, accent: STUDIO_LOOK.colors.accentLight })
  const refD = same(D, { bg: STUDIO_LOOK.colors.bg, surface: STUDIO_LOOK.colors.bg2, ink: STUDIO_LOOK.colors.text, muted: STUDIO_LOOK.colors.subtext, accent: STUDIO_LOOK.colors.accent })
  const heading = trim(c.headingLight)
  const headingD = trim(c.heading)
  return {
    '--t-bg': L.bg,
    '--t-surface': L.surface,
    '--t-ink': L.ink,
    '--t-muted': L.muted,
    '--t-accent': L.accent,
    '--t-soft': refL ? REF.light.soft : `color-mix(in srgb, ${L.ink} 6%, ${L.bg})`,
    '--t-line': refL ? REF.light.line : `color-mix(in srgb, ${L.ink} 14%, ${L.bg})`,
    '--t-accent-light': refL ? REF.light.accentLight : `color-mix(in srgb, ${L.accent} 16%, ${L.surface})`,
    '--t-accent-hover': refL ? REF.light.hover : `color-mix(in srgb, ${L.accent} 80%, #000)`,
    '--t-bg-d': D.bg,
    '--t-surface-d': D.surface,
    '--t-ink-d': D.ink,
    '--t-muted-d': D.muted,
    '--t-accent-d': D.accent,
    '--t-soft-d': refD ? REF.dark.soft : `color-mix(in srgb, ${D.surface} 45%, ${D.bg})`,
    '--t-line-d': refD ? REF.dark.line : `color-mix(in srgb, ${D.ink} 22%, ${D.bg})`,
    '--t-accent-light-d': refD ? REF.dark.accentLight : `color-mix(in srgb, ${D.accent} 12%, ${D.surface})`,
    '--t-accent-strong-d': refD ? REF.dark.strong : `color-mix(in srgb, ${D.accent} 78%, #000)`,
    // The headings' own colour, per theme, when one is chosen.
    ...(heading ? { '--t-heading': heading } : {}),
    ...(headingD ? { '--t-heading-d': headingD } : {}),
  }
}

export function studioRootVars(settings: StudioLookInput): { vars: Record<string, string>; attrs: Record<string, string> } {
  const style = (settings?.style ?? {}) as Record<string, unknown>
  const comp = (settings?.themeConfig?.components ?? {}) as Record<string, unknown>
  const cover = (settings?.heroCover ?? {}) as Record<string, unknown>
  const ar = AR_FONTS[trim(style.fontAr)] ?? AR_FONTS.kufam
  const latin = LATIN_FONTS[trim(style.fontLatin)] ?? LATIN_FONTS.manrope
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0)
  const pct = (v: unknown) => (n(v) > 0 ? String(n(v) / 100) : '')

  const vars: Record<string, string> = {
    ...paletteVars((settings?.colors ?? {}) as Colors),
    '--ar': `${ar}, Tahoma, sans-serif`,
    '--en': `${latin}, ${ar}, Arial, sans-serif`,
  }
  // The hero's heading and line sizes, on the computer and on a phone.
  const t = pct(cover.titleScale)
  const d = pct(cover.descScale)
  const tm = pct(cover.titleScaleMobile)
  const dm = pct(cover.descScaleMobile)
  if (t) vars['--t-h1'] = t
  if (d) vars['--t-desc'] = d
  if (tm) vars['--t-h1-m'] = tm
  if (dm) vars['--t-desc-m'] = dm

  return {
    vars,
    attrs: {
      'data-card': ['glass', 'outline'].includes(trim(comp.card)) ? trim(comp.card) : 'solid',
      'data-navbar': ['blur', 'transparent'].includes(trim(comp.navbar)) ? trim(comp.navbar) : 'solid',
      'data-btn': ['rounded', 'sharp'].includes(trim(comp.button)) ? trim(comp.button) : 'pill',
      'data-anim': ['fade-up', 'fade'].includes(trim(style.anim)) ? trim(style.anim) : 'none',
      'data-cursor': trim(style.cursor) === 'dot-ring' ? 'dot-ring' : 'default',
    },
  }
}
