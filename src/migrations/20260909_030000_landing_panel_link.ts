import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * A link for the hero panel, beside the file.
 *
 * Not every video wants uploading. A finished walkthrough usually already
 * lives on YouTube or Vimeo, and pushing a copy of it through this site's
 * storage costs the owner space and the visitor a slower page for no gain.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "images_panel_video_url" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "images_panel_video_url";`)
}
