import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The landing page's copy, after a conversion review (2026-09-26).
 *
 * Each change is made only where the field still holds the text it replaces,
 * so anything the owner has rewritten since is left alone, and running this
 * twice changes nothing the second time. The hero's headline and sub-line are
 * deliberately untouched, and so are the prices.
 *
 *  - Buttons, headings and one comparison line said more precisely.
 *  - The one-time plan no longer reads as "yours forever": it is hosting and
 *    updates with no subscription, the domain renewing with its registrar —
 *    what the FAQ already says.
 *  - The FAQ answers what a freelancer asks before paying: will a client take
 *    me seriously, what happens if I stop, who owns the domain, how long it
 *    takes, and what if I have no projects ready yet. Every answer restates
 *    what the product already does or the page already promises.
 */

type Obj = Record<string, unknown>
type Row = { id: number; _locale: string; content: unknown }
type Faq = { q: string; a: string }
type Lang = 'ar' | 'en'

const SWAPS: Record<Lang, [key: string, from: string, to: string][]> = {
  ar: [
    ['heroBtn1', 'شهر مجاناً', 'ابدأ شهرك المجاني'],
    ['featuresTitle', 'لماذا فايلر بكس؟', 'كل اللي محتاجه في مكان واحد'],
    ['compareTitle', 'موقعك الشخصي', 'ليه لينك Drive بيقلل من قيمة شغلك؟'],
    ['panelHeading', 'لوحة تحكم من كوكب آخر', 'ابني وعدّل موقعك من نفس المكان'],
  ],
  en: [
    ['heroBtn1', 'Start For free', 'Start your free month'],
    ['featuresTitle', 'Why Viral-Px?', 'Everything you need, in one place'],
    ['compareTitle', 'Your Personal Website', 'Why a Drive link undersells your work'],
    ['panelHeading', 'An out-of-this-world dashboard.', 'Build and edit your site from one place'],
  ],
}

const COMPARE_OLD: Record<Lang, [string, string]> = {
  ar: ['العميل بيشوف شغل منافسينك جنب شغلك.', 'على منصة عامة، العميل بيشوف شغل منافسينك جنب شغلك.'],
  en: [
    'The client sees your competitors’ work right next to yours.',
    'On a shared platform, clients see your competitors’ work right next to yours.',
  ],
}

const FEATURE_TITLES: Record<Lang, [string, string][]> = {
  ar: [],
  en: [['A Website Under Your Name', 'A portfolio site under your own name']],
}

const LIFETIME: Record<Lang, { note: [string, string]; badge: [string, string] }> = {
  ar: {
    note: ['ادفع مرة، وموقعك ليك على طول.', 'ادفع مرة واحدة — الاستضافة وكل المميزات والتحديثات، من غير اشتراك.'],
    badge: ['مدى الحياة', 'دفعة واحدة'],
  },
  en: {
    note: ['Pay once, and your site is yours for good.', 'Pay once — hosting, every feature and all updates, no subscription.'],
    badge: ['Lifetime', 'One payment'],
  },
}

/** The existing answers that grow, matched by their question. */
const FAQ_REWRITES: Record<Lang, { from: string; to: Faq }[]> = {
  ar: [
    {
      from: 'أقدر أغيّر خطتي أو ألغي؟',
      to: {
        q: 'أقدر ألغي؟ وموقعي يحصله إيه؟',
        a: 'أيوه، تقدر تغيّر خطتك أو تلغي في أي وقت. لو لغيت، موقعك بيتوقف مؤقتًا ومحتواك بيفضل محفوظ، ولو رجعت بيرجع زي ما هو. والدومين اللي اشتريته باسمك ملكك إنت.',
      },
    },
    {
      from: 'أقدر أربط دوميني؟',
      to: {
        q: 'أقدر أربط دوميني؟ ومين يملكه؟',
        a: 'أيوه، والـSSL بيتفعّل تلقائي. الدومين بتشتريه باسمك من أي شركة دومينات، وبيفضل ملكك حتى لو سبت ViralPX. ولو معندكش دومين، بنقولك تشتريه إزاي خطوة بخطوة.',
      },
    },
  ],
  en: [
    {
      from: 'Can I change my plan or cancel?',
      to: {
        q: 'Can I cancel? What happens to my site?',
        a: 'Yes — change your plan or cancel at any time. If you cancel, your site pauses and your content stays saved; come back and it returns as it was. A domain you bought in your name stays yours.',
      },
    },
    {
      from: 'Can I connect my own domain?',
      to: {
        q: 'Can I connect my own domain? Who owns it?',
        a: 'Yes, and SSL switches on automatically. You buy the domain in your own name from any registrar, and it stays yours even if you leave ViralPX. If you don’t have one yet, we walk you through buying it step by step.',
      },
    },
  ],
}

/** New questions, and the question each is placed after ('' = first). */
const FAQ_ADDS: Record<Lang, { after: string; faq: Faq }[]> = {
  ar: [
    {
      after: '',
      faq: {
        q: 'العميل هياخدني بجدية أكتر بموقع؟',
        a: 'الموقع باسمك وعلى دومينك بيقول إنك شغّال بجد مش بتجرّب. العميل بيشوف شغلك لوحده من غير منافسين جنبه، ويقدر يكلمك بضغطة على واتساب.',
      },
    },
    {
      after: 'محتاج أعرف كود؟',
      faq: {
        q: 'الموقع بياخد قد إيه لحد ما يجهز؟',
        a: 'لو شغلك جاهز، تقدر تنشره في نفس اليوم: الموقع بيفتح بنصوص جاهزة على مجالك، وانت بتضيف مشاريعك وتعدّل اللي عايزه وتنشر.',
      },
    },
    {
      after: 'الموقع بياخد قد إيه لحد ما يجهز؟',
      faq: {
        q: 'معنديش مشاريع جاهزة، أبدأ إزاي؟',
        a: 'ابدأ باللي عندك — ٣ لـ٥ شغلانات كويسة أحسن من ٢٠ عادية، وتقدر تضيف مشاريع شخصية أو تجارب. والأقسام اللي لسه فاضية مش بتظهر للزوار، فالموقع بيبان كامل من أول يوم.',
      },
    },
  ],
  en: [
    {
      after: '',
      faq: {
        q: 'Will clients take me more seriously with a site?',
        a: 'A site in your name, on your own domain, says you work at this rather than trying it out. The client sees your work on its own, with no competitors beside it, and can reach you with one tap on WhatsApp.',
      },
    },
    {
      after: 'Do I need to know how to code?',
      faq: {
        q: 'How long until my site is ready?',
        a: 'If your work is ready, you can publish the same day: the site opens with starter text for your field, and you add your projects, adjust what you like and publish.',
      },
    },
    {
      after: 'How long until my site is ready?',
      faq: {
        q: 'I have no projects ready yet. Where do I start?',
        a: 'Start with what you have — three to five good pieces beat twenty average ones, and personal projects or experiments count. Sections that are still empty are hidden from visitors, so the site looks complete from day one.',
      },
    },
  ],
}

function revise(content: Obj, lang: Lang): boolean {
  let changed = false

  for (const [key, from, to] of SWAPS[lang]) {
    if (content[key] === from) {
      content[key] = to
      changed = true
    }
  }

  if (Array.isArray(content.compareOld)) {
    const [from, to] = COMPARE_OLD[lang]
    const next = (content.compareOld as unknown[]).map((l) => (l === from ? to : l))
    if (next.some((l, i) => l !== (content.compareOld as unknown[])[i])) {
      content.compareOld = next
      changed = true
    }
  }

  if (Array.isArray(content.features)) {
    content.features = (content.features as Obj[]).map((f) => {
      const hit = FEATURE_TITLES[lang].find(([from]) => f?.t === from)
      if (!hit) return f
      changed = true
      return { ...f, t: hit[1] }
    })
  }

  if (Array.isArray(content.plans)) {
    const { note, badge } = LIFETIME[lang]
    content.plans = (content.plans as Obj[]).map((p) => {
      if (p?.note !== note[0]) return p
      changed = true
      return { ...p, note: note[1], badge: p.badge === badge[0] ? badge[1] : p.badge }
    })
  }

  if (Array.isArray(content.faqs)) {
    let faqs = [...(content.faqs as Faq[])]
    for (const { from, to } of FAQ_REWRITES[lang]) {
      const i = faqs.findIndex((f) => f?.q === from)
      if (i >= 0) {
        faqs[i] = to
        changed = true
      }
    }
    for (const { after, faq } of FAQ_ADDS[lang]) {
      if (faqs.some((f) => f?.q === faq.q)) continue
      const at = after ? faqs.findIndex((f) => f?.q === after) : -1
      faqs = at >= 0 || !after ? [...faqs.slice(0, at + 1), faq, ...faqs.slice(at + 1)] : [...faqs, faq]
      changed = true
    }
    content.faqs = faqs
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

