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
  achievements: { ar: 'الإنجازات', en: 'Achievements' },
  expertise: { ar: 'الخدمات', en: 'Key Expertise' },
  testimonials: { ar: 'آراء العملاء', en: 'Testimonials' },
  logos: { ar: 'العملاء', en: 'Clients' },
  experience: { ar: 'الخبرات', en: 'Experience' },
  tools: { ar: 'الأدوات', en: 'Tools' },
  education: { ar: 'التعليم', en: 'Education' },
  skills: { ar: 'المهارات', en: 'Skills' },
  contact: { ar: 'التواصل', en: 'Contact' },
}

export const SECTION_ORDER = Object.keys(SECTION_LABELS)
