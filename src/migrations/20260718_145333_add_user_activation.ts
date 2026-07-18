import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "activated" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN "reset_token" varchar;
  ALTER TABLE "users" ADD COLUMN "reset_code" varchar;
  ALTER TABLE "users" ADD COLUMN "reset_exp" numeric;
  UPDATE "users" SET "activated" = true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "activated";
  ALTER TABLE "users" DROP COLUMN "reset_token";
  ALTER TABLE "users" DROP COLUMN "reset_code";
  ALTER TABLE "users" DROP COLUMN "reset_exp";`)
}
