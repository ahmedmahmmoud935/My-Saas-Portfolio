import { getPayload } from 'payload'
import config from '@payload-config'
import type {
  Tenant,
  Project,
  Achievement,
  Logo,
  Testimonial,
  Team,
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
  team: Team[]
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

export { isVideoSrc } from './media-kind'

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

  const [settingsRes, projectsRes, achievementsRes, logosRes, testimonialsRes, teamRes] =
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
        // Hide drafts (published === false); legacy rows with null stay visible.
        where: { and: [tenantFilter, { published: { not_equals: false } }] },
        // Hand-ordered first; otherwise newest first. Every migrated project
        // shares sortOrder 0, so without the tiebreak they came out oldest-first.
        sort: ['sortOrder', '-createdAt'],
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
      payload.find({
        collection: 'team',
        where: tenantFilter,
        // Hand-ordered; the order people are introduced in is a decision.
        sort: ['sortOrder', 'createdAt'],
        limit: 60,
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
    team: teamRes.docs,
  }
}

export { tenantCssVars } from './tenant-vars'
