import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The landing page's Google title and description follow the hero from now
 * on (2026-10-08): empty fields mean "use the headline and the line under
 * it". The two values the new copy wrote are cleared so the page starts
 * following; anything else in those fields was typed by the owner and stays.
 */

type Obj = Record<string, unknown>
type Row = { id: number; _locale: string; content: unknown }

const WRITTEN = [
  'ViralPX — موقع بورتفوليو يليق بأعمالك',
  'اجمع مشاريعك وصورك وفيديوهاتك في موقع بورتفوليو باسمك، وتحكّم في محتواه وتصميمه بنفسك. جرّبه 30 يومًا مجانًا.',
  'ViralPX — A portfolio site that does your work justice',
  'Bring your projects, photos and videos together in a portfolio site under your own name, and manage it yourself. Try it free for 30 days.',
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const res = (await db.execute(
    sql`SELECT "id", "_locale", "content" FROM "landing_locales" WHERE "content" IS NOT NULL`,
  )) as unknown as { rows?: Row[] } | Row[]
  const rows = Array.isArray(res) ? res : (res.rows ?? [])

  for (const row of rows) {
    const content = { ...((typeof row.content === 'string' ? JSON.parse(row.content) : row.content) as Obj) }
    let changed = false
    for (const key of ['seoTitle', 'seoDescription']) {
      if (WRITTEN.includes(String(content[key] ?? ''))) {
        content[key] = ''
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
