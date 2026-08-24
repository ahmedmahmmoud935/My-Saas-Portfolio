import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * A cover image for the video module in a free project page.
 *
 * Without one the browser picks the first frame, which on a fade-in is a black
 * rectangle. Nullable: existing video blocks keep working untouched, and the
 * cover only applies to uploaded files (YouTube and Vimeo carry their own).
 *
 * ON DELETE set null mirrors every other upload field here — deleting the image
 * from the media library must not take the video block with it.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "projects_blocks_video" ADD COLUMN IF NOT EXISTS "poster_id" integer;

    DO $$ BEGIN
      ALTER TABLE "projects_blocks_video"
        ADD CONSTRAINT "projects_blocks_video_poster_id_media_id_fk"
        FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "projects_blocks_video_poster_idx"
      ON "projects_blocks_video" USING btree ("poster_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "projects_blocks_video_poster_idx";
    ALTER TABLE "projects_blocks_video"
      DROP CONSTRAINT IF EXISTS "projects_blocks_video_poster_id_media_id_fk";
    ALTER TABLE "projects_blocks_video" DROP COLUMN IF EXISTS "poster_id";`)
}
