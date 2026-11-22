import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* A product can be hidden from the site without deleting it. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "hidden" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "hidden";`)
}
