import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// NOTE: migrate:create was run without R2_* env, so the auto-diff also tried to
// DROP media."prefix" (added by the s3 storage plugin, only present when R2 is
// configured). That drop is intentionally removed — it would break R2 uploads.
// This migration only adds projects."published".

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "published" boolean DEFAULT true;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "published";`)
}
