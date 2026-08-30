import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The landing page gets the portfolio's design system: a light palette
 * alongside the dark one, and per-section backdrops.
 *
 * The light columns are left NULL rather than seeded. A NULL there means "use
 * the shipped light palette", so a site that has only ever set dark colours
 * gets a sane light theme instead of five copies of its dark one.
 *
 * The array table mirrors "site_settings_section_bg" exactly — same column
 * names, same enums, same varchar id — so the two can be read by one component.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "theme_accent_light" varchar;
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "theme_bg_light" varchar;
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "theme_bg2_light" varchar;
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "theme_text_light" varchar;
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "theme_subtext_light" varchar;`)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_landing_section_bg_section" AS ENUM('hero', 'features', 'how', 'showcase', 'pricing', 'faq', 'cta');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_landing_section_bg_mode" AS ENUM('color', 'image', 'video');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "landing_section_bg" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "section" "enum_landing_section_bg_section",
      "mode" "enum_landing_section_bg_mode" DEFAULT 'color',
      "color" varchar,
      "image_id" integer,
      "video_url" varchar,
      "fixed" boolean,
      "dim" numeric DEFAULT 45,
      "pos_x" numeric DEFAULT 50,
      "pos_y" numeric DEFAULT 50
    );`)

  // Constraints and indexes separately: ADD CONSTRAINT has no IF NOT EXISTS, so
  // a re-run has to check the catalogue itself.
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "landing_section_bg" ADD CONSTRAINT "landing_section_bg_image_id_media_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "landing_section_bg" ADD CONSTRAINT "landing_section_bg_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."landing"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "landing_section_bg_order_idx" ON "landing_section_bg" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "landing_section_bg_parent_id_idx" ON "landing_section_bg" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "landing_section_bg_image_idx" ON "landing_section_bg" USING btree ("image_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "landing_section_bg" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_landing_section_bg_section";
    DROP TYPE IF EXISTS "public"."enum_landing_section_bg_mode";

    ALTER TABLE "landing" DROP COLUMN IF EXISTS "theme_accent_light";
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "theme_bg_light";
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "theme_bg2_light";
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "theme_text_light";
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "theme_subtext_light";`)
}
