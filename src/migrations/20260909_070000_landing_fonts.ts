import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The landing page gets the same two font choices a portfolio has.
 *
 * Every face is already loaded by the frontend layout, for the portfolios —
 * the landing page simply had no way to ask for one, so it was fixed on the
 * pair the code shipped with while every client could change theirs.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "style_font_ar" varchar DEFAULT 'tajawal';
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "style_font_latin" varchar DEFAULT 'montserrat';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "style_font_ar";
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "style_font_latin";`)
}
