import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* The name the studio template shows in its bar and footer, per language. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_studio_brand" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_studio_brand";`)
}
