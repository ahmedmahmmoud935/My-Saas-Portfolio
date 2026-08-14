import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Remove three Design-tab settings that were saved but never read:
 *
 * - `style_theme` ('default' | 'kinetic') — nothing in the site or the editor
 *   ever looked at it.
 * - `background_preset` / `background_light_preset` — a decorative radial tint
 *   so faint it was invisible, and it sat next to the solid-colour suggestions
 *   looking like the same kind of control. The colour suggestions do the job.
 *
 * Dropping them rather than leaving them dormant: an option that stores a value
 * and changes nothing is worse than no option.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "style_theme";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "background_preset";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "background_light_preset";
    DROP TYPE IF EXISTS "public"."enum_site_settings_style_theme";
    DROP TYPE IF EXISTS "public"."enum_site_settings_background_preset";
    DROP TYPE IF EXISTS "public"."enum_site_settings_background_light_preset";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_settings_style_theme" AS ENUM('default', 'kinetic');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_settings_background_preset" AS ENUM('dark', 'ocean', 'sunset', 'forest', 'mono', 'pearl');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_settings_background_light_preset" AS ENUM('dark', 'ocean', 'sunset', 'forest', 'mono', 'pearl');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "style_theme" "enum_site_settings_style_theme" DEFAULT 'default';
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "background_preset" "enum_site_settings_background_preset" DEFAULT 'dark';
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "background_light_preset" "enum_site_settings_background_light_preset" DEFAULT 'dark';`)
}
