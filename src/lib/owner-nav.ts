// Client-safe: no server imports. Shared by the owner sidebar and its pages.
import type { NavItem } from './dashboard-nav'

/**
 * The admin area — running ViralPX itself, as opposed to editing one portfolio.
 * Kept apart from the client dashboard so the owner's own portfolio is managed
 * exactly like every other client's.
 */
export const OWNER_NAV: NavItem[] = [
  { id: 'landing', labelAr: 'الصفحة الرئيسية', labelEn: 'Landing page', icon: '' },
  { id: 'blog', labelAr: 'المدوّنة', labelEn: 'Blog', icon: '' },
  { id: 'users', labelAr: 'العملاء', labelEn: 'Clients', icon: '' },
]

/** Icon ids (see components/dashboard/icons.tsx) for the owner nav. */
export const OWNER_NAV_ICONS: Record<string, string> = {
  landing: 'landing',
  blog: 'articles',
  users: 'users',
}
