import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The landing redesign (2026-11-22) is drawn in Kufam and Manrope with the
 * showcase as a grid. A landing still on the old defaults (Tajawal,
 * Montserrat, slider) moves to the new ones; a choice the owner made away
 * from those defaults is left alone.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "landing" SET "style_font_ar" = 'kufam' WHERE "style_font_ar" IS NULL OR "style_font_ar" = 'tajawal';
    UPDATE "landing" SET "style_font_latin" = 'manrope' WHERE "style_font_latin" IS NULL OR "style_font_latin" = 'montserrat';
    UPDATE "landing" SET "style_showcase_layout" = 'grid' WHERE "style_showcase_layout" IS NULL OR "style_showcase_layout" = 'slider';
    ALTER TABLE "landing" ALTER COLUMN "style_font_ar" SET DEFAULT 'kufam';
    ALTER TABLE "landing" ALTER COLUMN "style_font_latin" SET DEFAULT 'manrope';
    ALTER TABLE "landing" ALTER COLUMN "style_showcase_layout" SET DEFAULT 'grid';`)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // The earlier defaults cannot be told apart from choices; nothing to undo.
}
