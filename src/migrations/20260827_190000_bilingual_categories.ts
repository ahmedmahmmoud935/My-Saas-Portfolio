import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * An Arabic and an English label for each category.
 *
 * `name` stays exactly as it is and keeps its old job: it is the KEY a project
 * is filed under (`projects.category` holds that string). Only the labels are
 * new, so no project loses its category and renaming a label never unfiles
 * anything.
 *
 * Existing categories were typed in English, so their English label is seeded
 * from the key and the Arabic side is left empty — an empty side falls back to
 * the key, which is what those categories show today.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_categories_image" ADD COLUMN IF NOT EXISTS "name_ar" varchar;
    ALTER TABLE "site_settings_categories_image" ADD COLUMN IF NOT EXISTS "name_en" varchar;
    ALTER TABLE "site_settings_categories_video" ADD COLUMN IF NOT EXISTS "name_ar" varchar;
    ALTER TABLE "site_settings_categories_video" ADD COLUMN IF NOT EXISTS "name_en" varchar;

    UPDATE "site_settings_categories_image" SET "name_en" = "name" WHERE "name_en" IS NULL;
    UPDATE "site_settings_categories_video" SET "name_en" = "name" WHERE "name_en" IS NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_categories_image" DROP COLUMN IF EXISTS "name_ar";
    ALTER TABLE "site_settings_categories_image" DROP COLUMN IF EXISTS "name_en";
    ALTER TABLE "site_settings_categories_video" DROP COLUMN IF EXISTS "name_ar";
    ALTER TABLE "site_settings_categories_video" DROP COLUMN IF EXISTS "name_en";`)
}
