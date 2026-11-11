import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Keep every custom setting; only the retired template choice changes.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings" SET "style_skin" = 'studio';
    ALTER TABLE "site_settings" ALTER COLUMN "style_skin" SET DEFAULT 'studio';
  `)
}

// Previous choices cannot be recovered; rollback only restores the old default.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ALTER COLUMN "style_skin" SET DEFAULT 'classic';
  `)
}
