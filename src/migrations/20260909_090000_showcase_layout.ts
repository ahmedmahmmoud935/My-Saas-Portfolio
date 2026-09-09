import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Grid or slider for the showcase.
 *
 * A three-across grid leaves a hole whenever the number of portfolios is not a
 * multiple of three — at five it is two-thirds of an empty row, directly under
 * the work it is meant to be showing off. A rail has no such arithmetic, and
 * it reads as "there are more of these" rather than "that is all of them".
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing" ADD COLUMN IF NOT EXISTS "style_showcase_layout" varchar DEFAULT 'slider';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing" DROP COLUMN IF EXISTS "style_showcase_layout";`)
}
