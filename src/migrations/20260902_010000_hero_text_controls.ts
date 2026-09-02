import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Size and position controls for the hero text.
 *
 * The heading size was already adjustable and the whole block scaled with it,
 * which is right for keeping the proportions but leaves nothing to say for a
 * description that wants to be a little larger, or for a block that should sit
 * at the top of the hero rather than in the middle.
 *
 * 'auto' on the two alignments means "whatever this layout already does" —
 * which is exactly what every existing site is doing today, so nothing moves
 * until someone chooses otherwise.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "hero_cover_desc_scale" numeric DEFAULT 100;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "hero_cover_align" varchar DEFAULT 'auto';
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "hero_cover_valign" varchar DEFAULT 'auto';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "hero_cover_desc_scale";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "hero_cover_align";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "hero_cover_valign";`)
}
