/**
 * The title of a portfolio page — the words in the browser tab, and the blue
 * line in a Google result.
 *
 * Client-safe on purpose: the dashboard shows the same answer live while the
 * hero is being written, so nobody has to publish a page to find out what its
 * tab will say.
 *
 * The hero has two boxes, a big one and a small one under it, and people do
 * not fill them the way the labels imply. Some write their name in the big box
 * and their craft in the small one ("كمال سميطة" / "مصور"); others write a
 * sales line across the big one and keep their name for the small ("أحوّل
 * أفكارك…" / "أحمد محمود محمد"). Both are reasonable ways to design a hero.
 *
 * Only one of them makes a usable title, though. A tab and a search result are
 * cut off around sixty characters, and they are scanned for a name — so the
 * name goes first whichever box it was typed into, and the sentence follows.
 */

/** Collapses the line breaks the hero is written with. */
function tidy(v: string | null | undefined): string {
  return (v ?? '').replace(/\s+/g, ' ').trim()
}

/** A sales line rather than a name: it runs on, or it was broken over lines. */
function isSentence(raw: string | null | undefined): boolean {
  const v = raw ?? ''
  if (/[\n\r]/.test(v)) return true
  const words = tidy(v).split(' ').filter(Boolean)
  return words.length > 4 || tidy(v).length > 32
}

export function portfolioTitle(
  name: string | null | undefined,
  title: string | null | undefined,
  fallback = '',
): string {
  const big = tidy(name)
  const small = tidy(title)
  if (!big && !small) return fallback
  if (!big) return small
  if (!small) return big

  // The name leads. When the big box holds a sentence and the small one does
  // not, the small one is the name — so they swap.
  const [lead, rest] = isSentence(name) && !isSentence(title) ? [small, big] : [big, small]
  const full = `${lead} — ${rest}`
  // Long enough to say both halves, short enough that the lead survives.
  return full.length > 70 ? `${full.slice(0, 69).trimEnd()}…` : full
}

/** The same name on its own — for a home-screen icon, where a line will not fit. */
export function portfolioName(
  name: string | null | undefined,
  title: string | null | undefined,
  fallback = '',
): string {
  const big = tidy(name)
  const small = tidy(title)
  const lead = isSentence(name) && !isSentence(title) ? small : big
  const out = lead || small || big || fallback
  return out.length > 30 ? `${out.slice(0, 29).trimEnd()}…` : out
}
