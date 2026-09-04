import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Somewhere to paste the two things Google gives you.
 *
 * A verification token, so Search Console can be connected — without a
 * verified property there is no way to see what a site is indexed for, what it
 * ranks for, or to submit a sitemap. And a GA4 id.
 *
 * Per tenant and, separately, for the platform's own landing page: both are
 * sites, and both need their own property.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "seo_tools_search_console" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "seo_tools_analytics_id" varchar;

    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "seo_tools_search_console" varchar;
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "seo_tools_analytics_id" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "seo_tools_search_console";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "seo_tools_analytics_id";

    ALTER TABLE "landing" DROP COLUMN IF EXISTS "seo_tools_search_console";
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "seo_tools_analytics_id";`)
}
