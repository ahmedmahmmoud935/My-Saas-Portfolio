// Client-safe: no server imports. Shared by the sidebar (client) and pages.
export type NavItem = { id: string; labelAr: string; labelEn: string; icon: string }

/**
 * Sidebar tabs, in groups.
 *
 * Ten equally-weighted entries in one list gave no clue that four of them are
 * about what the site says and four are about how it looks — you read the whole
 * list every time to find one. The grouping is presentational only: the ids,
 * their order, and their routes are unchanged.
 */
// Categories now live inside Projects; Clients/Achievements/Testimonials
// now live inside Content — so they're intentionally absent here.
export type NavGroup = { ar: string; en: string; items: NavItem[] }

export const DASHBOARD_NAV_GROUPS: NavGroup[] = [
  {
    ar: 'المحتوى',
    en: 'Content',
    items: [
      { id: 'projects', labelAr: 'المشاريع', labelEn: 'Projects', icon: '🗂️' },
      { id: 'content', labelAr: 'المحتوى', labelEn: 'Content', icon: '✏️' },
      { id: 'articles', labelAr: 'المقالات', labelEn: 'Articles', icon: '📖' },
      { id: 'highlights', labelAr: 'هاي لايتس', labelEn: 'Highlights', icon: '⭕' },
    ],
  },
  {
    ar: 'التصميم',
    en: 'Design',
    items: [
      { id: 'design', labelAr: 'التصميم', labelEn: 'Design', icon: '🎨' },
      { id: 'sections', labelAr: 'ترتيب الأقسام', labelEn: 'Sections', icon: '☰' },
      { id: 'navbar', labelAr: 'الشريط العلوي', labelEn: 'Navbar', icon: '⬆️' },
      { id: 'mobilebar', labelAr: 'شريط الموبايل', labelEn: 'Mobile bar', icon: '📱' },
    ],
  },
  {
    ar: 'الموقع',
    en: 'Site',
    items: [
      { id: 'social', labelAr: 'التواصل', labelEn: 'Social', icon: '🔗' },
      { id: 'redirects', labelAr: 'تحويل الروابط', labelEn: 'Redirects', icon: '🔀' },
      { id: 'analytics', labelAr: 'الإحصائيات', labelEn: 'Analytics', icon: '📊' },
      { id: 'seo', labelAr: 'فحص الموقع', labelEn: 'Site check', icon: '🔎' },
    ],
  },
  {
    // Talking to the platform: what it tells you, and what you tell it.
    ar: 'الدعم',
    en: 'Support',
    items: [
      { id: 'inbox', labelAr: 'الرسائل', labelEn: 'Messages', icon: '🔔' },
      { id: 'feedback', labelAr: 'اقتراحاتي', labelEn: 'Suggestions', icon: '💬' },
    ],
  },
]

/** The same tabs as one list, for anything that just needs to look an id up. */
export const DASHBOARD_NAV: NavItem[] = DASHBOARD_NAV_GROUPS.flatMap((g) => g.items)

/** Display names for the 12 portfolio sections (spec/01). */
export const SECTION_LABELS: Record<string, { ar: string; en: string }> = {
  hero: { ar: 'الرئيسية', en: 'Hero' },
  about: { ar: 'عن النفس', en: 'About' },
  projects: { ar: 'المشاريع', en: 'Projects' },
  products: { ar: 'أبعد من الصورة', en: 'Beyond the image' },
  achievements: { ar: 'الإنجازات', en: 'Achievements' },
  expertise: { ar: 'الخدمات', en: 'Key Expertise' },
  testimonials: { ar: 'آراء العملاء', en: 'Testimonials' },
  team: { ar: 'الفريق', en: 'The team' },
  logos: { ar: 'العملاء', en: 'Clients' },
  experience: { ar: 'الخبرات', en: 'Experience' },
  tools: { ar: 'الأدوات', en: 'Tools' },
  education: { ar: 'التعليم', en: 'Education' },
  skills: { ar: 'المهارات', en: 'Skills' },
  contact: { ar: 'التواصل', en: 'Contact' },
}

export const SECTION_ORDER = Object.keys(SECTION_LABELS)

/**
 * A saved section order with the sections added since it was saved put back
 * in, each right after the section it follows by default.
 *
 * Appended at the end, a new section (the digital products) landed under the
 * contact form on every site saved before it existed.
 */
export function withMissingSections<T extends { id: string }>(
  saved: T[],
  defaults: readonly string[],
  make: (id: string) => T,
): T[] {
  const out = [...saved]
  const has = new Set(out.map((s) => s.id))
  defaults.forEach((id, i) => {
    if (has.has(id)) return
    // The nearest earlier default that is on the list; first if there is none.
    let at = 0
    for (let j = i - 1; j >= 0; j--) {
      const k = out.findIndex((s) => s.id === defaults[j])
      if (k >= 0) {
        at = k + 1
        break
      }
    }
    out.splice(at, 0, make(id))
    has.add(id)
  })
  return out
}
