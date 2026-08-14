import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Per-section backgrounds become theme-scoped: each row belongs to either the
 * dark or the light theme, so the two can differ completely (different type,
 * image, even video) instead of sharing everything but the colour.
 *
 * Existing rows are dark by definition — `color` was the dark colour. Any row
 * that also carried a light colour is copied into a matching light row before
 * `color_light` goes away, so nothing already configured is lost.
 *
 * Written by hand rather than generated: the generator can't tell that
 * `color_light` is being split out rather than renamed, and it has no way to
 * express the backfill.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_settings_section_bg_theme" AS ENUM('dark', 'light');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    ALTER TABLE "site_settings_section_bg"
      ADD COLUMN IF NOT EXISTS "theme" "enum_site_settings_section_bg_theme" DEFAULT 'dark';

    UPDATE "site_settings_section_bg" SET "theme" = 'dark' WHERE "theme" IS NULL;`)

  // Split each row that carried a light colour into its own light row. Ids are
  // varchar in Payload's array tables, so suffixing keeps them unique.
  await db.execute(sql`
    INSERT INTO "site_settings_section_bg"
      ("_order", "_parent_id", "id", "theme", "section", "mode", "color", "image_id", "video_url", "fixed", "dim")
    SELECT
      "_order", "_parent_id", "id" || '-light', 'light', "section", "mode",
      "color_light", "image_id", "video_url", "fixed", "dim"
    FROM "site_settings_section_bg"
    WHERE "color_light" IS NOT NULL
      AND "color_light" <> ''
      AND "theme" = 'dark'
    ON CONFLICT DO NOTHING;`)

  await db.execute(sql`
    ALTER TABLE "site_settings_section_bg" DROP COLUMN IF EXISTS "color_light";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_section_bg" ADD COLUMN IF NOT EXISTS "color_light" varchar;

    UPDATE "site_settings_section_bg" d
      SET "color_light" = l."color"
      FROM "site_settings_section_bg" l
      WHERE l."id" = d."id" || '-light' AND l."theme" = 'light';

    DELETE FROM "site_settings_section_bg" WHERE "theme" = 'light';
    ALTER TABLE "site_settings_section_bg" DROP COLUMN IF EXISTS "theme";
    DROP TYPE IF EXISTS "public"."enum_site_settings_section_bg_theme";`)
}
