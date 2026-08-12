import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Per-section headings (about/experience/education/skills/tools) plus headings
 * for the two collection-driven sections (clients/testimonials). All localized,
 * so they live on site_settings_locales.
 *
 * NOTE: the generator also wanted to add `media.prefix` here — that column
 * already exists in production (see 20260709_171646_add_r2_storage); it only
 * looked missing because the local dev database was pushed without R2 enabled.
 * Adding it again would abort the migration on boot, so it is left out.
 * IF NOT EXISTS keeps this re-runnable against any environment.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_about_title" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_experience_title" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_education_title" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_skills_title" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_clients_title" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_testimonials_title" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_tools_title" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_about_title";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_experience_title";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_education_title";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_skills_title";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_clients_title";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_testimonials_title";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_tools_title";`)
}
