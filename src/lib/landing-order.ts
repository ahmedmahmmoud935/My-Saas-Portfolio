/**
 * The order of the landing page's bands, and which of them are on.
 *
 * The page was a fixed sequence written into the markup, so changing where the
 * pricing sits — or taking the testimonials off until there are some — meant
 * editing the page. A portfolio has had this control since the beginning; the
 * platform's own page now has the same one.
 *
 * Client-safe: the page renders from this list and the dashboard edits it, so
 * both read the same names in the same default order.
 */

export type LandingBand = { id: string; ar: string; en: string }
export type LandingOrderItem = { id: string; on: boolean }

/**
 * Every band that can be moved, in the order the page ships with. The header
 * and the footer are not here: one is the way in and the other the way out,
 * and neither belongs in the middle of anything.
 */
export const LANDING_BANDS: LandingBand[] = [
  { id: 'hero', ar: 'القسم الرئيسي', en: 'Hero' },
  { id: 'compare', ar: 'الفرق', en: 'The difference' },
  { id: 'panel', ar: 'فيديو الشرح', en: 'Explainer video' },
  { id: 'features', ar: 'المميزات', en: 'Features' },
  { id: 'dashboard', ar: 'قسم لوحة التحكم', en: 'Dashboard tour' },
  { id: 'audience', ar: 'لمين؟', en: 'Who it is for' },
  { id: 'how', ar: 'الخطوات', en: 'Steps' },
  { id: 'metrics', ar: 'شريط الأرقام', en: 'The numbers bar' },
  { id: 'showcase', ar: 'الأمثلة', en: 'Showcase' },
  { id: 'pricing', ar: 'الأسعار', en: 'Pricing' },
  { id: 'testimonials', ar: 'آراء العملاء', en: 'Testimonials' },
  { id: 'faq', ar: 'الأسئلة', en: 'FAQ' },
  { id: 'cta', ar: 'دعوة الفعل الأخيرة', en: 'Closing call' },
]

const DEFAULT_ORDER: LandingOrderItem[] = LANDING_BANDS.map((b) => ({ id: b.id, on: true }))

/**
 * The saved order, made safe to render from.
 *
 * A saved list is a snapshot of the bands that existed when it was saved, so
 * it is reconciled rather than trusted: names the page no longer has are
 * dropped, and a band added since — today's dashboard tour, tomorrow's
 * something else — is appended rather than silently missing. A band is on
 * unless it was turned off.
 */
export function resolveLandingOrder(saved: unknown): LandingOrderItem[] {
  if (!Array.isArray(saved) || !saved.length) return DEFAULT_ORDER
  const known = new Map(LANDING_BANDS.map((b) => [b.id, b]))
  const seen = new Set<string>()
  const out: LandingOrderItem[] = []

  for (const row of saved) {
    const id = typeof row === 'string' ? row : (row as LandingOrderItem)?.id
    if (typeof id !== 'string' || !known.has(id) || seen.has(id)) continue
    seen.add(id)
    out.push({ id, on: typeof row === 'string' ? true : (row as LandingOrderItem).on !== false })
  }
  for (const b of LANDING_BANDS) if (!seen.has(b.id)) out.push({ id: b.id, on: true })
  return out
}
