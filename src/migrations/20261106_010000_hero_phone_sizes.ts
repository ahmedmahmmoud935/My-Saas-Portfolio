import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The hero's heading and description get a size of their own on phones.
 * Empty (null) follows the computer's size, which is what every site has had
 * so far, so nothing changes until the owner moves the new sliders.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "hero_cover_title_scale_mobile" numeric;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "hero_cover_desc_scale_mobile" numeric;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "hero_cover_title_scale_mobile";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "hero_cover_desc_scale_mobile";`)
}
