/**
 * The landing page's palette, shared by every page that wears its chrome.
 *
 * The look used to live inside the landing page component, which was fine
 * while the landing page was the only thing using it — then the blog borrowed
 * its `lp-*` classes and got a bare, unstyled stack of links, because none of
 * those rules existed outside that one file. The static rules now live in
 * `app/(frontend)/landing.css`; only the owner-chosen colours are still
 * generated per request, and that is what this module does.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

export type LandingLook = {
  accent: string
  bg: string
  bg2: string
  text: string
  subtext: string
  accentLight: string
  bgLight: string
  bg2Light: string
  textLight: string
  subtextLight: string
  logoUrl: string | null
  heroUrl: string | null
  heroDim: number
  ogUrl: string | null
  panelUrl: string | null
  panelKind: 'image' | 'video' | null
  showcaseStyle: string
  cardStyle: string
}

export const DEFAULT_LOOK: LandingLook = {
  // Navy rather than black. A pure black page has no room underneath it: every
  // panel drawn on it has to be lighter, so surfaces, cards and hairlines all
  // arrive as greys of the same family and the page reads flat. A deep blue
  // canvas leaves the whole range above it usable, and warms the orange.
  accent: '#F28C00',
  bg: '#060D1E',
  bg2: '#0B1736',
  text: '#F8FAFC',
  subtext: '#94A3B8',
  // The light half. A site that has only ever set dark colours gets these
  // rather than five copies of its dark palette. The text colour is the dark
  // canvas, so the two themes are recognisably the same brand.
  //
  // The accent is a much deeper orange than the dark theme's, because it has a
  // second job here: the small eyebrow above each heading is set in it, on
  // white. #F28C00 reaches 2.5:1 there and #E07B00 only 3.0 — both below the
  // 4.5 small text needs. This one reaches 5.3, and its white button label
  // reaches 5.3 as well.
  accentLight: '#A85400',
  bgLight: '#FFFFFF',
  bg2Light: '#F4F6FB',
  textLight: '#0B1736',
  subtextLight: '#64748B',
  logoUrl: null,
  heroUrl: null,
  heroDim: 40,
  ogUrl: null,
  panelUrl: null,
  panelKind: null,
  showcaseStyle: 'portrait',
  cardStyle: 'solid',
}

/**
 * Black or white on top of the owner's accent, whichever stays readable.
 *
 * The accent is a free colour picker, so the label on an accent-filled button
 * can't be a fixed white: a yellow or mint accent leaves it barely visible.
 * Perceived luminance decides, with the threshold where the two contrast
 * ratios cross.
 */
export function onAccent(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#FFFFFF'
  const n = parseInt(m[1], 16)
  const lin = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const L = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
  // The crossover, not a guess. Black scores (L + 0.05) / 0.05 against this
  // background and white scores 1.05 / (L + 0.05); they are equal at
  // L = sqrt(1.05 * 0.05) - 0.05 ≈ 0.1791. The threshold used to sit at 0.36,
  // which handed white to every mid-tone accent — on a mid orange that is a
  // contrast ratio near 3, where black would have been near 7.
  return L > 0.1791 ? '#0A0A0A' : '#FFFFFF'
}

/** Saved colours, minus the blanks — a null column must not beat the default. */
export function setOnly<T extends object>(o: unknown): Partial<T> {
  if (!o || typeof o !== 'object') return {}
  return Object.fromEntries(
    Object.entries(o as Record<string, unknown>).filter(([, v]) => v !== null && v !== ''),
  ) as Partial<T>
}

/**
 * The two rules that carry the owner's colours. Everything else about the
 * landing chrome is static and lives in the stylesheet; these are the only
 * lines that have to be written per request, so they are the only lines any
 * page has to inline.
 *
 * The hairlines are derived from the text colour rather than fixed, because a
 * chosen background can be dark or light and a fixed white hairline vanishes
 * on one of them.
 */
export function landingTokensCss(look: LandingLook): string {
  return `
.lp { --o: ${look.accent}; --lp-on-o: ${onAccent(look.accent)};
  --lp-bg: ${look.bg}; --lp-bg2: ${look.bg2};
  --lp-text: ${look.text}; --lp-sub: ${look.subtext};
  --lp-line: color-mix(in srgb, var(--lp-text) 9%, transparent);
  --lp-line-2: color-mix(in srgb, var(--lp-text) 20%, transparent);
  background: var(--lp-bg); color: var(--lp-text); overflow-x: hidden;
  font-family: var(--font-cairo), system-ui, sans-serif; }

html[data-theme='light'] .lp {
  --o: ${look.accentLight}; --lp-on-o: ${onAccent(look.accentLight)};
  --lp-bg: ${look.bgLight}; --lp-bg2: ${look.bg2Light};
  --lp-text: ${look.textLight}; --lp-sub: ${look.subtextLight};
  /* Restated, not inherited. A custom property holding a color-mix() is
     substituted where it is declared, so a hairline derived from the dark
     text colour stayed derived from it — a near-white line drawn on a white
     card, which is no line at all. */
  --lp-line: color-mix(in srgb, ${look.textLight} 12%, transparent);
  --lp-line-2: color-mix(in srgb, ${look.textLight} 24%, transparent); }
`
}

/**
 * Just the palette, for the pages that wear the landing chrome without being
 * the landing page. A failed lookup falls back to the defaults rather than
 * throwing: an unstyled page is a worse outcome than a page in the stock
 * colours.
 */
export async function getLandingLook(): Promise<LandingLook> {
  try {
    const payload = await getPayload({ config })
    const g = (await payload.findGlobal({ slug: 'landing', depth: 0 })) as {
      theme?: Partial<LandingLook>
      style?: { showcase?: string | null; card?: string | null }
    }
    return {
      ...DEFAULT_LOOK,
      ...setOnly<LandingLook>(g?.theme),
      showcaseStyle: g?.style?.showcase || DEFAULT_LOOK.showcaseStyle,
      cardStyle: g?.style?.card || DEFAULT_LOOK.cardStyle,
    }
  } catch {
    return DEFAULT_LOOK
  }
}
