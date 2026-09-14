/**
 * The language a portfolio is written in.
 *
 * Its owner pins a direction in the dashboard, and that is the answer. When
 * they have not, the headline decides: a name or a title in Arabic script is
 * not an English page, whatever the default says.
 *
 * Read in two places — the map the middleware runs on, and the sitemap — which
 * have to agree: one says which address answers in which language, the other
 * tells a search engine the same thing.
 */
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/

/** The script a headline is written in, when there is a headline to read. */
export function scriptOf(text: unknown): 'ar' | null {
  return typeof text === 'string' && ARABIC.test(text) ? 'ar' : null
}

type SettingsLike = {
  style?: { direction?: string } | null
  content?: { hero?: { name?: string | null; title?: string | null } | null } | null
}

/** The pinned direction, else the script of the headline, else nothing. */
export function settingsLang(s: SettingsLike | null | undefined): 'ar' | 'en' | null {
  const dir = s?.style?.direction
  if (dir === 'rtl') return 'ar'
  if (dir === 'ltr') return 'en'
  const hero = s?.content?.hero
  return scriptOf(hero?.name) ?? scriptOf(hero?.title)
}
