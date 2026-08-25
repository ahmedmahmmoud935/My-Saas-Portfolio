import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The Arabic and Latin faces become two separate choices.
 *
 * They came as six fixed pairs — six combinations out of nine faces the site was
 * already downloading. Existing tenants are carried over by mapping whichever
 * pair they had onto its two halves, so nobody's typography changes.
 *
 * Both columns are plain text, not enums, on purpose. `style.font` was a select
 * whose options list drifted from the editor's, and the value the editor offered
 * ('cairo') was one the enum had never been given — which made Postgres reject
 * the whole Design save, not just that field. Text can't fail that way.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "style_font_ar" varchar DEFAULT 'tajawal';
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "style_font_latin" varchar DEFAULT 'montserrat';

    UPDATE "site_settings" SET
      "style_font_ar" = CASE "style_font"::text
        WHEN 'editorial' THEN 'almarai'
        WHEN 'elegant'   THEN 'markazi'
        WHEN 'bold'      THEN 'cairo'
        ELSE 'tajawal'
      END,
      "style_font_latin" = CASE "style_font"::text
        WHEN 'modern'    THEN 'inter'
        WHEN 'editorial' THEN 'playfair'
        WHEN 'elegant'   THEN 'cormorant'
        WHEN 'bold'      THEN 'bebas'
        ELSE 'montserrat'
      END
    WHERE "style_font_ar" IS NULL OR "style_font_ar" = 'tajawal';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "style_font_ar";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "style_font_latin";`)
}
