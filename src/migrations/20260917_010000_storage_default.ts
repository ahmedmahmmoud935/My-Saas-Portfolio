import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * A new portfolio starts with a gigabyte rather than half of one.
 *
 * The collection already says so; this keeps the column's own default in step,
 * for anything that writes a tenant without going through Payload. Portfolios
 * that already exist keep whatever the admin gave them.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tenants" ALTER COLUMN "storage_limit_mb" SET DEFAULT 1024;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tenants" ALTER COLUMN "storage_limit_mb" SET DEFAULT 500;`)
}
