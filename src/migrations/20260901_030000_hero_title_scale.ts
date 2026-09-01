import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * A size control for the hero heading.
 *
 * Each layout sizes its heading for its own shape, and that is a starting
 * point, not an answer: the right size depends on how long the name actually
 * is, which only the person typing it knows. Stored as a percentage of the
 * layout's own size, so every layout keeps its proportions and 100 means
 * exactly what shipped.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "hero_cover_title_scale" numeric DEFAULT 100;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "hero_cover_title_scale";`)
}
