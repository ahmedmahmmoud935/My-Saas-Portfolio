import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_content_expertise_items" ADD COLUMN "image_id" integer;
  ALTER TABLE "site_settings_content_expertise_items" ADD COLUMN "bg_zoom" numeric DEFAULT 100;
  ALTER TABLE "site_settings_content_expertise_items" ADD COLUMN "bg_overlay" numeric DEFAULT 45;
  ALTER TABLE "site_settings_content_expertise_items" ADD COLUMN "bg_pos_x" numeric DEFAULT 50;
  ALTER TABLE "site_settings_content_expertise_items" ADD COLUMN "bg_pos_y" numeric DEFAULT 50;
  ALTER TABLE "site_settings_content_expertise_items" ADD CONSTRAINT "site_settings_content_expertise_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_content_expertise_items_image_idx" ON "site_settings_content_expertise_items" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_content_expertise_items" DROP CONSTRAINT "site_settings_content_expertise_items_image_id_media_id_fk";
  
  DROP INDEX "site_settings_content_expertise_items_image_idx";
  ALTER TABLE "site_settings_content_expertise_items" DROP COLUMN "image_id";
  ALTER TABLE "site_settings_content_expertise_items" DROP COLUMN "bg_zoom";
  ALTER TABLE "site_settings_content_expertise_items" DROP COLUMN "bg_overlay";
  ALTER TABLE "site_settings_content_expertise_items" DROP COLUMN "bg_pos_x";
  ALTER TABLE "site_settings_content_expertise_items" DROP COLUMN "bg_pos_y";`)
}
