import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The hero's gradient is picked once per theme. Empty means "the same as the
// light one", which is how every site that picked a gradient before looks.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "hero_cover_gradient_dark" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "hero_cover_gradient_dark";`)
}
