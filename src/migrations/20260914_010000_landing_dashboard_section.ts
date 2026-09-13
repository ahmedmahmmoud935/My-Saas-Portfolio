import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The dashboard tour joins the list of bands a backdrop can be attached to.
 *
 * No down: Postgres cannot drop a value from an enum, and any row pointing at
 * one would be the owner's own settings.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_landing_section_bg_section" ADD VALUE IF NOT EXISTS 'dashboard';`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  /* An enum value cannot be removed once rows may point at it. */
}
