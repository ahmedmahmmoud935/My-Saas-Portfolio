import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * How many images a photo grid puts across on a phone.
 *
 * The row was hard-wired to one per line below 640px, so a three-up set became
 * three full-width pictures and the composition was lost. Wider screens keep
 * the proportional row and are unaffected.
 *
 * Defaults to 1 — exactly what every existing grid does today, so nothing that
 * is already published moves.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "projects_blocks_grid"
      ADD COLUMN IF NOT EXISTS "mobile_cols" numeric DEFAULT 1;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "projects_blocks_grid" DROP COLUMN IF EXISTS "mobile_cols";`)
}
