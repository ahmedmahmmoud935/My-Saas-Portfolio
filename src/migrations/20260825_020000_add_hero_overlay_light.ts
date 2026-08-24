import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * A separate veil strength for the hero cover in the light theme.
 *
 * There was one value for both, and it painted black over the cover either way.
 * On a light page that reads as a dark stain rather than as a way of keeping the
 * headline legible — light mode needs a *white* veil, and usually a weaker one,
 * so the strength has to be storable per theme.
 *
 * 25 rather than copying the dark value: a cover carries a light page more
 * easily, and anyone who wants them matched can drag the slider.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "hero_cover_overlay_light" numeric DEFAULT 25;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "hero_cover_overlay_light";`)
}
