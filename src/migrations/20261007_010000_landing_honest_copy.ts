import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The landing page says how you actually start, and what the dashboard is
 * actually like (2026-10-07).
 *
 * There is no sign-up form: every "start" button opens WhatsApp, the account
 * is made for you, and an email lets you choose your password. The first step
 * and the "do I need a card" answer said "sign up" as if you could do it
 * yourself. "Everything by drag and drop" overstated it: dragging is how things
 * are ordered, the rest is fields and choices. The data answer now says how
 * often the backups run, which is every six hours to separate storage.
 *
 * Each text changes only where it still holds the words it replaces, so
 * anything the owner has rewritten since is left alone.
 */

type Obj = Record<string, unknown>
type Row = { id: number; _locale: string; content: unknown }
type Lang = 'ar' | 'en'

const STEP_ONE: Record<Lang, { from: [string, string]; to: [string, string] }> = {
  ar: {
    from: ['سجّل مجانًا', 'ادخل لوحة التحكم وابدأ من قالب جاهز، من غير بطاقة دفع.'],
    to: ['كلّمنا على واتساب', 'ابعتلنا رسالة وهنجهّزلك موقعك، ويوصلك إيميل تختار منه كلمة السر — من غير بطاقة دفع.'],
  },
  en: {
    from: ['Sign up free', 'Open the dashboard and start from a ready template — no card needed.'],
    to: ['Message us on WhatsApp', 'Send us a message and we set up your site, then an email lets you choose your password — no card needed.'],
  },
}

/** Answers that change, as [question, old answer, new answer]. */
const ANSWERS: Record<Lang, [string, string, string][]> = {
  ar: [
    [
      'محتاج أدخل بطاقة دفع عشان أجرّب؟',
      'لأ. سجّل وابدأ على طول — مش هتدفع حاجة غير لما تختار خطة.',
      'لأ. كلّمنا على واتساب وهنجهّزلك موقعك على طول — مش هتدفع حاجة غير لما تختار خطة.',
    ],
    [
      'محتاج أعرف كود؟',
      'خالص. كل حاجة من لوحة التحكم بالسحب والإفلات.',
      'خالص. كل حاجة بتتعدّل من لوحة التحكم بخانات واختيارات بسيطة، والترتيب بالسحب والإفلات.',
    ],
    [
      'بياناتي في أمان؟',
      'الموقع شغال على HTTPS، وبياناتك بيتعملها نسخ احتياطي بشكل دوري.',
      'الموقع شغال على HTTPS، وبنعمل نسخة احتياطية من بياناتك كل 6 ساعات ونحفظها في مكان منفصل.',
    ],
  ],
  en: [
    [
      'Do I need a card to try it?',
      'No. Sign up and start straight away — you pay nothing until you choose a plan.',
      'No. Message us on WhatsApp and we set your site up straight away — you pay nothing until you choose a plan.',
    ],
    [
      'Do I need to know how to code?',
      'Not at all. Everything is done from the dashboard, with drag and drop.',
      'Not at all. You change everything from the dashboard with simple fields and choices, and reorder by dragging.',
    ],
    [
      'Is my data safe?',
      'The site runs on HTTPS, and your data is backed up regularly.',
      'The site runs on HTTPS, and your data is backed up every 6 hours to separate storage.',
    ],
  ],
}

function revise(content: Obj, lang: Lang): boolean {
  let changed = false

  if (Array.isArray(content.how)) {
    const { from, to } = STEP_ONE[lang]
    content.how = (content.how as Obj[]).map((s) => {
      if (s?.t !== from[0] || s?.d !== from[1]) return s
      changed = true
      return { ...s, t: to[0], d: to[1] }
    })
  }

  if (Array.isArray(content.faqs)) {
    content.faqs = (content.faqs as Obj[]).map((f) => {
      const hit = ANSWERS[lang].find(([q, a]) => f?.q === q && f?.a === a)
      if (!hit) return f
      changed = true
      return { ...f, a: hit[2] }
    })
  }

  return changed
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const res = (await db.execute(
    sql`SELECT "id", "_locale", "content" FROM "landing_locales" WHERE "content" IS NOT NULL`,
  )) as unknown as { rows?: Row[] } | Row[]
  const rows = Array.isArray(res) ? res : (res.rows ?? [])

  for (const row of rows) {
    const lang: Lang = row._locale === 'en' ? 'en' : 'ar'
    const content = {
      ...((typeof row.content === 'string' ? JSON.parse(row.content) : row.content) as Obj),
    }
    if (!revise(content, lang)) continue
    await db.execute(sql`
      UPDATE "landing_locales" SET "content" = ${JSON.stringify(content)}::jsonb WHERE "id" = ${row.id};`)
  }
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Copy, not structure: the owner edits it from the dashboard either way.
}
