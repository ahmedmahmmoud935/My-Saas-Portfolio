// Client-safe: no server imports. Shared by the sidebar (client) and pages.
export type NavItem = { id: string; labelAr: string; labelEn: string; icon: string }

/** Sidebar tabs — order + labels from spec/02. */
export const DASHBOARD_NAV: NavItem[] = [
  { id: 'projects', labelAr: 'المشاريع', labelEn: 'Projects', icon: '🗂️' },
  { id: 'highlights', labelAr: 'هاي لايتس', labelEn: 'Highlights', icon: '⭕' },
  { id: 'analytics', labelAr: 'الإحصائيات', labelEn: 'Analytics', icon: '📊' },
  { id: 'categories', labelAr: 'التصنيفات', labelEn: 'Categories', icon: '🏷️' },
  { id: 'design', labelAr: 'التصميم', labelEn: 'Design', icon: '🎨' },
  { id: 'sections', labelAr: 'ترتيب الأقسام', labelEn: 'Sections', icon: '☰' },
  { id: 'navbar', labelAr: 'الشريط العلوي', labelEn: 'Navbar', icon: '⬆️' },
  { id: 'mobilebar', labelAr: 'شريط الموبايل', labelEn: 'Mobile bar', icon: '📱' },
  { id: 'content', labelAr: 'المحتوى', labelEn: 'Content', icon: '✏️' },
  { id: 'logos', labelAr: 'العملاء', labelEn: 'Clients', icon: '👥' },
  { id: 'achievements', labelAr: 'الإنجازات', labelEn: 'Achievements', icon: '🏆' },
  { id: 'testimonials', labelAr: 'آراء العملاء', labelEn: 'Testimonials', icon: '💬' },
  { id: 'articles', labelAr: 'المقالات', labelEn: 'Articles', icon: '📖' },
  { id: 'social', labelAr: 'التواصل', labelEn: 'Social', icon: '🔗' },
]

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
