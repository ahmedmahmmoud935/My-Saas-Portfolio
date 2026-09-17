import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The column the S3 storage plugin adds to every collection it stores, missing
 * from `attachments` because the table was written against a schema pushed
 * with R2 switched off. Payload selects it on every read, so attaching a file
 * to a suggestion failed with "column prefix does not exist" — which reached
 * the client as "this file isn't supported". `media` got the same column when
 * R2 was first switched on.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "attachments" ADD COLUMN IF NOT EXISTS "prefix" varchar DEFAULT 'attachments';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "attachments" DROP COLUMN IF EXISTS "prefix";`)
}
