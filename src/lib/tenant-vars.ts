import type { SiteSetting } from '../payload-types'

/*
 * Client-safe: the dashboard's preview paints unsaved colours with the same
 * variables the page is rendered with.
 */

/** Build the per-tenant CSS variables from settings.colors (falls back to defaults). */
export function tenantCssVars(settings: Pick<SiteSetting, 'colors'> | null): Record<string, string> {
  const c = (settings?.colors ?? {}) as Record<string, string | undefined>
  const accent = c.accent || '#f97316'
  return {
    // Dark-mode palette (default).
    '--accent': accent,
    // Kept unchanged so light mode can derive a darker, white-readable accent.
    '--accent-base': accent,
    '--bg': c.bg || '#0a0a0a',
    '--bg-2': c.bg2 || '#111111',
    '--text': c.text || '#ffffff',
    '--sub': c.subtext || '#999999',
    // Light-mode palette — consumed by `html[data-theme='light'] .pf-root`.
    '--accent-light': c.accentLight || accent,
    '--bg-light': c.bgLight || '#ffffff',
    '--bg2-light': c.bg2Light || '#f3f5f8',
    '--text-light': c.textLight || '#0c0f16',
    '--sub-light': c.subtextLight || '#495265',
    // Only when chosen: unset, the headings keep inheriting the text colour.
    ...(c.heading ? { '--heading-dark': c.heading } : {}),
    ...(c.headingLight ? { '--heading-light': c.headingLight } : {}),
  }
}
