import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "colors_accent_light" varchar DEFAULT '#F97316';
  ALTER TABLE "site_settings" ADD COLUMN "colors_bg_light" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "site_settings" ADD COLUMN "colors_bg2_light" varchar DEFAULT '#F3F5F8';
  ALTER TABLE "site_settings" ADD COLUMN "colors_text_light" varchar DEFAULT '#0C0F16';
  ALTER TABLE "site_settings" ADD COLUMN "colors_subtext_light" varchar DEFAULT '#495265';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "colors_accent_light";
  ALTER TABLE "site_settings" DROP COLUMN "colors_bg_light";
  ALTER TABLE "site_settings" DROP COLUMN "colors_bg2_light";
  ALTER TABLE "site_settings" DROP COLUMN "colors_text_light";
  ALTER TABLE "site_settings" DROP COLUMN "colors_subtext_light";`)
}
