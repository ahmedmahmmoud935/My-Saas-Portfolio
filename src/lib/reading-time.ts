/**
 * How long this piece takes to read.
 *
 * Counted, not typed. It used to be a number field in the editor with a
 * default of 3, which meant every article claimed three minutes whatever its
 * length — a promise to the reader that the piece then broke. It is not an SEO
 * signal in any case; it is a courtesy, and a courtesy has to be true.
 *
 * Arabic reads a little slower than English word for word, mostly because a
 * word carries more of the sentence, so the two get their own rate.
 */
const RATE = { ar: 180, en: 220 }

export function readingMinutes(html?: string | null, locale: 'ar' | 'en' = 'ar'): number {
  const text = (html ?? '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .trim()
  if (!text) return 0
  const words = text.split(/\s+/).filter(Boolean).length
  // Never "0 minutes" for something with words in it.
  return Math.max(1, Math.round(words / RATE[locale]))
}
