import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The "studio" look (2026-11-10): the warm editorial design new portfolios
 * start in, chosen per site in Design. Existing sites keep 'classic'.
 * With it: a gallery of the latest designs under the hero (on by default),
 * and a number on the About photo with a line saying what it counts.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "style_skin" varchar DEFAULT 'classic';
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "style_hero_gallery" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "content_about_stat_value" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_about_stat_label" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "style_skin";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "style_hero_gallery";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "content_about_stat_value";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_about_stat_label";`)
}
