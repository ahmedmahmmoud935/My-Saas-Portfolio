import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "landing" ADD COLUMN "theme_accent" varchar;
  ALTER TABLE "landing" ADD COLUMN "theme_bg" varchar;
  ALTER TABLE "landing" ADD COLUMN "theme_bg2" varchar;
  ALTER TABLE "landing" ADD COLUMN "theme_text" varchar;
  ALTER TABLE "landing" ADD COLUMN "theme_subtext" varchar;
  ALTER TABLE "landing" ADD COLUMN "images_logo_id" integer;
  ALTER TABLE "landing" ADD COLUMN "images_hero_id" integer;
  ALTER TABLE "landing" ADD COLUMN "images_hero_dim" numeric DEFAULT 40;
  ALTER TABLE "landing" ADD COLUMN "images_og_image_id" integer;
  ALTER TABLE "landing" ADD CONSTRAINT "landing_images_logo_id_media_id_fk" FOREIGN KEY ("images_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing" ADD CONSTRAINT "landing_images_hero_id_media_id_fk" FOREIGN KEY ("images_hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing" ADD CONSTRAINT "landing_images_og_image_id_media_id_fk" FOREIGN KEY ("images_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "landing_images_images_logo_idx" ON "landing" USING btree ("images_logo_id");
  CREATE INDEX "landing_images_images_hero_idx" ON "landing" USING btree ("images_hero_id");
  CREATE INDEX "landing_images_images_og_image_idx" ON "landing" USING btree ("images_og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "landing" DROP CONSTRAINT "landing_images_logo_id_media_id_fk";
  
  ALTER TABLE "landing" DROP CONSTRAINT "landing_images_hero_id_media_id_fk";
  
  ALTER TABLE "landing" DROP CONSTRAINT "landing_images_og_image_id_media_id_fk";
  
  DROP INDEX "landing_images_images_logo_idx";
  DROP INDEX "landing_images_images_hero_idx";
  DROP INDEX "landing_images_images_og_image_idx";
  ALTER TABLE "landing" DROP COLUMN "theme_accent";
  ALTER TABLE "landing" DROP COLUMN "theme_bg";
  ALTER TABLE "landing" DROP COLUMN "theme_bg2";
  ALTER TABLE "landing" DROP COLUMN "theme_text";
  ALTER TABLE "landing" DROP COLUMN "theme_subtext";
  ALTER TABLE "landing" DROP COLUMN "images_logo_id";
  ALTER TABLE "landing" DROP COLUMN "images_hero_id";
  ALTER TABLE "landing" DROP COLUMN "images_hero_dim";
  ALTER TABLE "landing" DROP COLUMN "images_og_image_id";`)
}
