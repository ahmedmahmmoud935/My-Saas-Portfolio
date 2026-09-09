import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The header and the footer join the list of sections a backdrop can be
 * attached to.
 *
 * They were the only two bands on the page that could not carry a colour, an
 * image or a video of their own — not by decision, only because they were
 * written before the backdrop list existed.
 *
 * No down: Postgres cannot drop a value from an enum, and any row pointing at
 * one would be the owner's own settings.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_landing_section_bg_section" ADD VALUE IF NOT EXISTS 'header';`)

  await db.execute(sql`
    ALTER TYPE "public"."enum_landing_section_bg_section" ADD VALUE IF NOT EXISTS 'footer';`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  /* An enum value cannot be removed once rows may point at it. */
}
