import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * A section's flat colour, once per theme.
 *
 * One backdrop serving both themes is right for a picture — the same photograph
 * under a veil that turns from black to white. It is wrong for a colour: a dark
 * grey chosen to sit under the dark theme is still that grey when the visitor
 * switches to light, where it reads as a black band across a white page.
 *
 * So the media stays shared and the colour splits. An empty light colour keeps
 * the old behaviour (both themes wear the dark one), which is what every row
 * saved before today does.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_section_bg" ADD COLUMN IF NOT EXISTS "color_light" varchar;
    ALTER TABLE "landing_section_bg" ADD COLUMN IF NOT EXISTS "color_light" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_section_bg" DROP COLUMN IF EXISTS "color_light";
    ALTER TABLE "landing_section_bg" DROP COLUMN IF EXISTS "color_light";`)
}
