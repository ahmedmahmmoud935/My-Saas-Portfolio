import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The phrase an article is trying to be found for.
 *
 * Localized, because the Arabic and the English versions of a piece are aiming
 * at different searches — and often are not the same piece at all.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "articles_locales" ADD COLUMN IF NOT EXISTS "seo_keyphrase" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "articles_locales" DROP COLUMN IF EXISTS "seo_keyphrase";`)
}
