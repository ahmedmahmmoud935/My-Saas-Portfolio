import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The hero's headline goes back to the one the owner preferred (2026-10-08):
 * the new copy stays everywhere else, including the line and buttons under
 * the headline. The small badge above it comes back too.
 *
 * Each field changes only while it still holds the text the new copy put
 * there, so anything edited from the dashboard in the meantime is kept.
 */

type Obj = Record<string, unknown>
type Row = { id: number; _locale: string; content: unknown }
type Lang = 'ar' | 'en'

const SWAPS: Record<Lang, [key: string, from: string, to: string][]> = {
  ar: [
    ['heroEyebrow', '', 'ابدأ مجاناً'],
    ['heroTitle', 'موقع يليق', 'شغلك يستاهل موقع باسمك'],
    ['heroTitleAccent', 'بأعمالك', 'لينك درايف غير كافي'],
  ],
  en: [
    ['heroEyebrow', '', 'Start free'],
    ['heroTitle', 'A site that does', 'Your work deserves a site in your name'],
    ['heroTitleAccent', 'your work justice', 'A Drive link won’t cut it'],
  ],
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const res = (await db.execute(
    sql`SELECT "id", "_locale", "content" FROM "landing_locales" WHERE "content" IS NOT NULL`,
  )) as unknown as { rows?: Row[] } | Row[]
  const rows = Array.isArray(res) ? res : (res.rows ?? [])

  for (const row of rows) {
    const lang: Lang = row._locale === 'en' ? 'en' : 'ar'
    const content = { ...((typeof row.content === 'string' ? JSON.parse(row.content) : row.content) as Obj) }
    let changed = false
    for (const [key, from, to] of SWAPS[lang]) {
      if ((content[key] ?? '') === from) {
        content[key] = to
        changed = true
      }
    }
    if (!changed) continue
    await db.execute(sql`
      UPDATE "landing_locales" SET "content" = ${JSON.stringify(content)}::jsonb WHERE "id" = ${row.id};`)
  }
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Copy, not structure: the owner edits it from the dashboard either way.
}
