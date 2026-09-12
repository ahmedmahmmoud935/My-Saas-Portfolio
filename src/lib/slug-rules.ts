/**
 * What a portfolio's username may be.
 *
 * It is the address people type, read out loud and paste into a message, so it
 * is Latin letters, digits and hyphens and nothing else — Arabic survives a URL
 * bar but turns into percent-encoded nonsense the moment someone copies it.
 *
 * Client-safe: the form that types one and the action that saves it check the
 * same rules, or the two disagree and the error arrives after the save.
 */

/** Addresses the site itself answers on. A portfolio may not take one. */
export const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'blog',
  'dashboard',
  'forgot-password',
  'legal',
  'login',
  'llms.txt',
  'owner',
  'reset-password',
  'robots.txt',
  'sitemap.xml',
  'testimonial',
  'www',
  '_next',
])

/** Everything that cannot be in a username, taken out as it is typed. */
export function cleanSlug(v: string): string {
  return v
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
}

export type SlugProblem = 'empty' | 'short' | 'long' | 'edges' | 'reserved'

/** What is wrong with this username, or null when nothing is. */
export function slugProblem(v: string): SlugProblem | null {
  const s = cleanSlug(v)
  if (!s) return 'empty'
  if (s.length < 2) return 'short'
  if (s.length > 40) return 'long'
  if (s.startsWith('-') || s.endsWith('-')) return 'edges'
  if (RESERVED_SLUGS.has(s)) return 'reserved'
  return null
}

/** The same, in words — both languages, because both dashboards show it. */
export function slugProblemText(p: SlugProblem, ar: boolean): string {
  const msgs: Record<SlugProblem, [string, string]> = {
    empty: ['اكتب اسم المستخدم', 'Type a username'],
    short: ['الاسم قصير أوي — حرفين على الأقل', 'Too short — two characters at least'],
    long: ['الاسم طويل أوي — ٤٠ حرف كحد أقصى', 'Too long — 40 characters at most'],
    edges: ['الاسم ميبدأش وميخلصش بشرطة', 'It cannot start or end with a hyphen'],
    reserved: ['الاسم ده محجوز للموقع نفسه', 'That name belongs to the site itself'],
  }
  return msgs[p][ar ? 0 : 1]
}
