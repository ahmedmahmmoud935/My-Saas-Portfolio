import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Two more landing sections a backdrop can be attached to.
 *
 * The list of them is a Postgres enum, so adding one in the config alone is not
 * enough — `compare` shipped that way yesterday, and choosing it in the
 * dashboard would have failed on save with an invalid enum value. It is added
 * here alongside `panel`, which the hero panel needs now that it has moved out
 * of the hero and become a section of its own.
 *
 * There is no down: Postgres cannot drop a value from an enum, and the rows
 * that might already reference it are the owner's own settings.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_landing_section_bg_section" ADD VALUE IF NOT EXISTS 'compare';`)

  await db.execute(sql`
    ALTER TYPE "public"."enum_landing_section_bg_section" ADD VALUE IF NOT EXISTS 'panel';`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  /* An enum value cannot be removed once rows may point at it. */
}
