import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * A description under the hero name, and a hero layout to put it in.
 *
 * The hero could say who you are and what you're called, and then went
 * straight to the buttons — there was no field for the sentence that explains
 * the work. Localized, so it lives beside the other hero copy.
 *
 * The layout is a Postgres enum, so a new variant has to be added to the type
 * before anything can be saved with it — picking it would otherwise fail on
 * save with an invalid-input-value error, not at deploy.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_hero_desc" varchar;`)

  await db.execute(sql`
    ALTER TYPE "public"."enum_site_settings_style_hero" ADD VALUE IF NOT EXISTS 'panel';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Postgres cannot remove a value from an enum, so any site left on the new
  // layout is moved back to the one it most resembles first.
  await db.execute(sql`
    UPDATE "site_settings" SET "style_hero" = 'split' WHERE "style_hero" = 'panel';
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_hero_desc";`)
}
