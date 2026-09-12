import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * How far a service card's picture is dimmed in the light theme.
 *
 * The veil over it was black in both themes, so a card with a background stayed
 * a dark rectangle among pale ones when the visitor switched to light — and its
 * white text had to stay white to survive. The veil now turns white with the
 * theme, the text on it turns dark, and this is how strongly it does so.
 *
 * Null means "work it out from the dark one", which is what every card saved
 * before today does: a white veil needs to be heavier than a black one to lift
 * a photograph to where dark text reads on it.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_content_expertise_items"
      ADD COLUMN IF NOT EXISTS "bg_overlay_light" numeric;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_content_expertise_items"
      DROP COLUMN IF EXISTS "bg_overlay_light";`)
}
