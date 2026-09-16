// Client-safe: the landing page and the editor order portfolios the same way.

/**
 * Portfolios in the order the owner set: the ones they placed, in their
 * places, then everyone else as they came (newest first). A username in the
 * saved order that no longer exists is simply skipped.
 */
export function orderShowcase<T extends { slug: string }>(items: T[], order: string[] | undefined): T[] {
  const rank = new Map((order ?? []).map((slug, i) => [slug, i]))
  const placed = items.filter((x) => rank.has(x.slug)).sort((a, b) => rank.get(a.slug)! - rank.get(b.slug)!)
  const rest = items.filter((x) => !rank.has(x.slug))
  return [...placed, ...rest]
}
