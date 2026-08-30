import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * How the landing page draws its cards: the layout of a showcase card, and the
 * finish shared by every card on the page.
 *
 * Its own migration rather than an edit to 20260831_010000, which has already
 * run — an applied migration is never replayed, so a column added to it now
 * would never exist.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "style_showcase" varchar DEFAULT 'portrait';
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "style_card" varchar DEFAULT 'solid';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "style_showcase";
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "style_card";`)
}
