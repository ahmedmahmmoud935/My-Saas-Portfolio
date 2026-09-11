import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { LANDING_COPY } from '../lib/landing-copy'

/**
 * The landing page's sales rewrite, applied to the copy already saved.
 *
 * Saved copy wins over the defaults, and its lists win whole — so new defaults
 * alone would never reach a site whose owner has pressed Save once: the old
 * four questions and the old two plans would stay exactly where they are.
 * This writes the new words over the saved ones.
 *
 * What the rewrite did not cover is carried across untouched: the headline
 * dials, the nav labels, the drawn product, the footer, and every picture an
 * owner uploaded — feature icons and card backgrounds follow their feature to
 * its new position rather than staying at the old index, and plan colours stay
 * with the plan in the same slot.
 *
 * Two sections join the backdrop list with it: who the product is for, and
 * the testimonials.
 *
 * No down: the words being replaced are not kept anywhere to go back to, and
 * an enum value cannot be removed once a row may point at it.
 */

/**
 * Saved fields outside the rewrite, kept as the owner left them.
 *
 * The line break under the headline is not among them: the new headline is
 * written as two lines, the claim and then the accent, and left to wrap on
 * its own the accent splits across them.
 */
const KEEP = [
  'heroScale',
  'heroLeading',
  'nav',
  'login',
  'tagline',
  'mock',
  'metricsLabels',
  'panelTitle',
  'showcaseEmpty',
  'footerNote',
  'footerGroups',
  'rights',
] as const

/**
 * For each new feature, where it used to be. The old order was design,
 * projects, blog, domain, speed, contact; the new one leads with the domain.
 */
const FEATURE_WAS = [3, 0, 1, 4, 2, 5]

type Row = { id: number; _locale: string; content: unknown }
type Obj = Record<string, unknown>

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_landing_section_bg_section" ADD VALUE IF NOT EXISTS 'audience';`)
  await db.execute(sql`
    ALTER TYPE "public"."enum_landing_section_bg_section" ADD VALUE IF NOT EXISTS 'testimonials';`)

  const res = (await db.execute(
    sql`SELECT "id", "_locale", "content" FROM "landing_locales" WHERE "content" IS NOT NULL`,
  )) as unknown as { rows?: Row[] } | Row[]
  const rows = Array.isArray(res) ? res : (res.rows ?? [])

  for (const row of rows) {
    const old = (typeof row.content === 'string' ? JSON.parse(row.content) : row.content) as Obj
    if (!old || typeof old !== 'object') continue
    const base = LANDING_COPY[row._locale === 'en' ? 'en' : 'ar']
    const next: Obj = { ...base }

    for (const k of KEEP) if (old[k] !== undefined && old[k] !== null) next[k] = old[k]

    const oldFeatures = Array.isArray(old.features) ? (old.features as Obj[]) : []
    if (oldFeatures.length === FEATURE_WAS.length) {
      next.features = base.features.map((f, i) => {
        const was = oldFeatures[FEATURE_WAS[i]] ?? {}
        return {
          ...f,
          icon: (was.icon as string) || f.icon,
          iconUrl: (was.iconUrl as string) || '',
          bgUrl: (was.bgUrl as string) || '',
        }
      })
    }

    const oldHow = Array.isArray(old.how) ? (old.how as Obj[]) : []
    next.how = base.how.map((s, i) => ({
      ...s,
      n: (oldHow[i]?.n as string) || s.n,
      iconUrl: (oldHow[i]?.iconUrl as string) || '',
    }))

    const oldPlans = Array.isArray(old.plans) ? (old.plans as Obj[]) : []
    next.plans = base.plans.map((p, i) => ({ ...p, color: (oldPlans[i]?.color as string) || '' }))

    await db.execute(sql`
      UPDATE "landing_locales" SET "content" = ${JSON.stringify(next)}::jsonb WHERE "id" = ${row.id};`)
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  /* The replaced words are not kept, and enum values cannot be dropped. */
}
