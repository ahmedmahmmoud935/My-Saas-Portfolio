import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The hour a piece goes live.
 *
 * Localized, because publishing already is: the two languages of an article
 * are often not the same piece, and one can be ready a week before the other.
 *
 * Nothing flips the published switch when the time arrives — the queries ask
 * "published, or scheduled for a moment that has passed", so a scheduled piece
 * appears by itself with no job to run and nothing to fail.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "articles_locales"
      ADD COLUMN IF NOT EXISTS "publish_at" timestamp(3) with time zone;
    ALTER TABLE "posts_locales"
      ADD COLUMN IF NOT EXISTS "publish_at" timestamp(3) with time zone;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "articles_locales" DROP COLUMN IF EXISTS "publish_at";
    ALTER TABLE "posts_locales" DROP COLUMN IF EXISTS "publish_at";`)
}
