import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Which part of a section's background picture stays in frame.
 *
 * The picture is cropped to cover the section, and until now the crop was
 * always taken from the centre — so a face or a logo near an edge was simply
 * cut off with no way to say otherwise. The hero cover has had these two
 * controls all along; this gives them to section backgrounds too.
 *
 * 50/50 is dead centre, which is exactly what every existing row does today.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_section_bg" ADD COLUMN IF NOT EXISTS "pos_x" numeric DEFAULT 50;
    ALTER TABLE "site_settings_section_bg" ADD COLUMN IF NOT EXISTS "pos_y" numeric DEFAULT 50;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_section_bg" DROP COLUMN IF EXISTS "pos_x";
    ALTER TABLE "site_settings_section_bg" DROP COLUMN IF EXISTS "pos_y";`)
}
