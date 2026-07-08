import { getPayload } from 'payload'
import config from '@payload-config'
import type {
  Tenant,
  Project,
  Achievement,
  Logo,
  Testimonial,
  SiteSetting,
  Media,
} from '../payload-types'

export type PortfolioData = {
  tenant: Tenant
  settings: SiteSetting | null
  projects: Project[]
  achievements: Achievement[]
  logos: Logo[]
  testimonials: Testimonial[]
}

/** Resolve a URL field (upload) to a usable src. Prefers the thumbnail when asked. */
export function mediaUrl(
  m: number | Media | null | undefined,
  size?: 'thumb' | 'card',
): string | null {
  if (!m || typeof m === 'number') return null
  if (size && m.sizes && m.sizes[size]?.url) return m.sizes[size]!.url ?? m.url ?? null
  return m.url ?? null
}

/**
 * Fetch everything needed to render a tenant's portfolio by username (slug).
 * Returns null when the slug maps to no tenant.
 */
export async function getPortfolio(
  username: string,
  locale: 'ar' | 'en' = 'ar',
): Promise<PortfolioData | null> {
  const payload = await getPayload({ config })

  const tenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: username } },
    limit: 1,
    depth: 0,
  })
  const tenant = tenants.docs[0]
  if (!tenant) return null

  const tenantFilter = { tenant: { equals: tenant.id } }

  const [settingsRes, projectsRes, achievementsRes, logosRes, testimonialsRes] =
    await Promise.all([
      payload.find({
        collection: 'site-settings',
        where: tenantFilter,
        limit: 1,
        depth: 2,
        locale,
        fallbackLocale: locale === 'ar' ? 'en' : 'ar',
      }),
      payload.find({
        collection: 'projects',
        where: tenantFilter,
        sort: 'sortOrder',
        limit: 200,
        depth: 1,
        locale,
      }),
      payload.find({
        collection: 'achievements',
        where: tenantFilter,
        sort: 'sortOrder',
        limit: 50,
        depth: 1,
        locale,
      }),
      payload.find({
        collection: 'logos',
        where: tenantFilter,
        sort: 'sortOrder',
        limit: 100,
        depth: 1,
      }),
      payload.find({
        collection: 'testimonials',
        where: { and: [tenantFilter, { approved: { equals: true } }] },
        sort: 'sortOrder',
        limit: 100,
        depth: 1,
        locale,
      }),
    ])

  return {
    tenant,
    settings: settingsRes.docs[0] ?? null,
    projects: projectsRes.docs,
    achievements: achievementsRes.docs,
    logos: logosRes.docs,
    testimonials: testimonialsRes.docs,
  }
}

/** Build the per-tenant CSS variables from settings.colors (falls back to defaults). */
export function tenantCssVars(settings: SiteSetting | null): Record<string, string> {
  const c = settings?.colors ?? {}
  return {
    '--accent': c.accent || '#f97316',
    '--bg': c.bg || '#0a0a0a',
    '--bg-2': c.bg2 || '#111111',
    '--text': c.text || '#ffffff',
    '--sub': c.subtext || '#999999',
  }
}
