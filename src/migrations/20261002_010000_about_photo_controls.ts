import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// How the About picture sits in its frame: filling or whole, and its focus.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "about_photo_size" varchar DEFAULT 'cover';
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "about_photo_pos_x" numeric DEFAULT 50;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "about_photo_pos_y" numeric DEFAULT 50;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "about_photo_size";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "about_photo_pos_x";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "about_photo_pos_y";`)
}
