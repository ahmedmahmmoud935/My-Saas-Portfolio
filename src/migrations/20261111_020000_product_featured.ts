import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Which product the studio look shows on its large card. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "featured";`)
}
