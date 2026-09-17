import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// A colour for the main headings, per theme. Empty = the text colour.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "colors_heading" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "colors_heading_light" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "colors_heading";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "colors_heading_light";`)
}
