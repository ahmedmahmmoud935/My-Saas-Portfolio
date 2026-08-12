import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_section_bg_section" AS ENUM('hero', 'about', 'projects', 'achievements', 'expertise', 'testimonials', 'logos', 'experience', 'tools', 'education', 'skills', 'contact');
  CREATE TYPE "public"."enum_site_settings_section_bg_mode" AS ENUM('color', 'image', 'video');
  CREATE TYPE "public"."enum_site_settings_background_light_preset" AS ENUM('dark', 'ocean', 'sunset', 'forest', 'mono', 'pearl');
  CREATE TYPE "public"."enum_site_settings_background_light_type" AS ENUM('solid', 'gradient', 'animated', 'image');
  ALTER TYPE "public"."enum_site_settings_background_type" ADD VALUE 'animated';
  ALTER TYPE "public"."enum_site_settings_background_type" ADD VALUE 'image';
  CREATE TABLE "site_settings_section_bg" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" "enum_site_settings_section_bg_section",
  	"mode" "enum_site_settings_section_bg_mode" DEFAULT 'color',
  	"color" varchar,
  	"color_light" varchar,
  	"image_id" integer,
  	"video_url" varchar,
  	"fixed" boolean,
  	"dim" numeric DEFAULT 45
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "background_color3" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "background_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "background_image_fixed" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "background_dim" numeric DEFAULT 55;
  ALTER TABLE "site_settings" ADD COLUMN "background_light_preset" "enum_site_settings_background_light_preset" DEFAULT 'dark';
  ALTER TABLE "site_settings" ADD COLUMN "background_light_type" "enum_site_settings_background_light_type" DEFAULT 'solid';
  ALTER TABLE "site_settings" ADD COLUMN "background_light_color1" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "background_light_color2" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "background_light_color3" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "background_light_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "background_light_image_fixed" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "background_light_dim" numeric DEFAULT 55;
  ALTER TABLE "site_settings_section_bg" ADD CONSTRAINT "site_settings_section_bg_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_section_bg" ADD CONSTRAINT "site_settings_section_bg_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_section_bg_order_idx" ON "site_settings_section_bg" USING btree ("_order");
  CREATE INDEX "site_settings_section_bg_parent_id_idx" ON "site_settings_section_bg" USING btree ("_parent_id");
  CREATE INDEX "site_settings_section_bg_image_idx" ON "site_settings_section_bg" USING btree ("image_id");
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_background_light_image_id_media_id_fk" FOREIGN KEY ("background_light_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_background_background_image_idx" ON "site_settings" USING btree ("background_image_id");
  CREATE INDEX "site_settings_background_light_background_light_image_idx" ON "site_settings" USING btree ("background_light_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_section_bg" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_section_bg" CASCADE;
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_background_image_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_background_light_image_id_media_id_fk";
  
  ALTER TABLE "site_settings" ALTER COLUMN "background_type" SET DATA TYPE text;
  ALTER TABLE "site_settings" ALTER COLUMN "background_type" SET DEFAULT 'solid'::text;
  DROP TYPE "public"."enum_site_settings_background_type";
  CREATE TYPE "public"."enum_site_settings_background_type" AS ENUM('solid', 'gradient');
  ALTER TABLE "site_settings" ALTER COLUMN "background_type" SET DEFAULT 'solid'::"public"."enum_site_settings_background_type";
  ALTER TABLE "site_settings" ALTER COLUMN "background_type" SET DATA TYPE "public"."enum_site_settings_background_type" USING "background_type"::"public"."enum_site_settings_background_type";
  DROP INDEX "site_settings_background_background_image_idx";
  DROP INDEX "site_settings_background_light_background_light_image_idx";
  ALTER TABLE "site_settings" DROP COLUMN "background_color3";
  ALTER TABLE "site_settings" DROP COLUMN "background_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "background_image_fixed";
  ALTER TABLE "site_settings" DROP COLUMN "background_dim";
  ALTER TABLE "site_settings" DROP COLUMN "background_light_preset";
  ALTER TABLE "site_settings" DROP COLUMN "background_light_type";
  ALTER TABLE "site_settings" DROP COLUMN "background_light_color1";
  ALTER TABLE "site_settings" DROP COLUMN "background_light_color2";
  ALTER TABLE "site_settings" DROP COLUMN "background_light_color3";
  ALTER TABLE "site_settings" DROP COLUMN "background_light_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "background_light_image_fixed";
  ALTER TABLE "site_settings" DROP COLUMN "background_light_dim";
  DROP TYPE "public"."enum_site_settings_section_bg_section";
  DROP TYPE "public"."enum_site_settings_section_bg_mode";
  DROP TYPE "public"."enum_site_settings_background_light_preset";
  DROP TYPE "public"."enum_site_settings_background_light_type";`)
}
