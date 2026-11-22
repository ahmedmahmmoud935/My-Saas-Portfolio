import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The landing redesign (2026-11-22) is drawn in a warm light palette. The
 * landing's saved colours were the old defaults (filled in by an earlier save,
 * never chosen), which would have painted the new page black. Each colour still
 * equal to one of the old defaults moves to the new palette; a colour the owner
 * picked is left alone.
 */
const SET = (col: string, value: string, olds: string[]) =>
  `UPDATE "landing" SET "${col}" = '${value}' WHERE "${col}" IS NULL OR upper("${col}") IN (${olds.map((o) => `'${o.toUpperCase()}'`).join(', ')});`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const statements = [
    SET('theme_accent', '#b84b24', ['#F97316', '#F28C00']),
    SET('theme_bg', '#f8f5ef', ['#0A0A0A', '#060D1E']),
    SET('theme_bg2', '#fffdfa', ['#111111', '#0B1736']),
    SET('theme_text', '#252520', ['#FFFFFF', '#F8FAFC']),
    SET('theme_subtext', '#706c64', ['#9AA0AA', '#94A3B8']),
    SET('theme_accent_light', '#b84b24', ['#F97316', '#A85400']),
    SET('theme_bg_light', '#f8f5ef', ['#FFFFFF']),
    SET('theme_bg2_light', '#fffdfa', ['#F3F5F8', '#F4F6FB']),
    SET('theme_text_light', '#252520', ['#0C0F16', '#0B1736']),
    SET('theme_subtext_light', '#706c64', ['#495265', '#64748B']),
  ]
  await db.execute(sql.raw(statements.join('\n')))
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // The old defaults cannot be told apart from choices; nothing to undo.
}
