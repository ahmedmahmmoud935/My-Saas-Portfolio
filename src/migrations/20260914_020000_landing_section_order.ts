import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Which bands the landing page shows, and in what order.
 *
 * The sequence was written into the page, so moving the pricing above the
 * examples — or taking the testimonials off until there are some — was a code
 * change. A portfolio has had this control from the start; the platform's own
 * page gets the same one.
 *
 * Null means the order the page ships with, which is what every install has
 * been showing until now.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "section_order" jsonb;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "section_order";`)
}
