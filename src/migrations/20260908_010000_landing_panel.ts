import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The picture inside the hero.
 *
 * It was drawn in CSS from the page's own tokens — a stand-in for the product
 * until there was something real to show. This is where the real thing goes:
 * one file, an image or a video, with a line of text over it.
 *
 * The drawing stays as the fallback, so an owner who has not uploaded anything
 * yet still has a hero with a product in it rather than an empty frame.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "images_panel_id" integer;`)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "landing" ADD CONSTRAINT "landing_images_panel_id_media_id_fk"
        FOREIGN KEY ("images_panel_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "landing_images_images_panel_idx"
      ON "landing" USING btree ("images_panel_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "landing_images_images_panel_idx";
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "images_panel_id";`)
}
