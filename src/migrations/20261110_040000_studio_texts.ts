import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The lines only the studio template shows, each editable in both languages:
 * the word strip under the hero, the services, reviews and experience
 * descriptions, the contact paragraph and form title, the end of the digital
 * products section and the footer line.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_studio_strip" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_studio_services_sub" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_studio_reviews_sub" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_studio_experience_sub" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_studio_contact_body" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_studio_form_title" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_studio_digital_end" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_studio_digital_end_btn" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_studio_footer" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_studio_strip";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_studio_services_sub";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_studio_reviews_sub";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_studio_experience_sub";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_studio_contact_body";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_studio_form_title";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_studio_digital_end";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_studio_digital_end_btn";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_studio_footer";`)
}
