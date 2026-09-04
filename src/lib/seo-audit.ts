/**
 * A whole-site check: everything a search engine would object to, found in one
 * pass instead of one page at a time.
 *
 * The per-article panel answers "is this piece any good". This answers the
 * questions you can only ask across a site — what is duplicated, what nothing
 * links to, and what is missing the same field everywhere.
 *
 * Pure over already-loaded content, so it can be unit-tested and costs no
 * requests of its own.
 */

export type Severity = 'bad' | 'warn' | 'info'

export type Finding = {
  id: string
  severity: Severity
  ar: string
  en: string
  /** Where to go and fix it. */
  href?: string
  /** Which page this is about, for grouping. */
  page?: string
}

export type PageInput = {
  kind: 'portfolio' | 'article' | 'project'
  id?: number
  title: string
  path: string
  /** Dashboard address where this is edited. */
  editHref?: string
  description?: string | null
  metaTitle?: string | null
  html?: string | null
  cover?: string | null
  published?: boolean
  noindex?: boolean
}

export type AuditResult = {
  findings: Finding[]
  counts: { bad: number; warn: number; info: number }
  pages: number
}

const stripTags = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

const wordsOf = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)

/** Words too common to say two pages are about the same thing. */
const STOP = new Set([
  'التي', 'الذي', 'هذا', 'هذه', 'ذلك', 'كان', 'كانت', 'يكون', 'على', 'عن', 'مع', 'من', 'الى', 'الي',
  'this', 'that', 'with', 'from', 'have', 'here', 'they', 'your', 'about', 'into', 'more', 'will',
])

export function auditSite(pages: PageInput[]): AuditResult {
  const findings: Finding[] = []
  const add = (f: Finding) => findings.push(f)

  const live = pages.filter((p) => p.published !== false)

  /* ── per page ─────────────────────────────────────────────────────────── */
  for (const p of live) {
    const label = p.title || p.path

    if (!p.description || !p.description.trim()) {
      add({
        id: `desc-${p.path}`,
        severity: 'bad',
        page: label,
        href: p.editHref,
        ar: 'مفيش وصف — جوجل هيختار جملة بنفسه.',
        en: 'No description — Google will pick a sentence itself.',
      })
    } else if (p.description.length > 160) {
      add({
        id: `desc-long-${p.path}`,
        severity: 'warn',
        page: label,
        href: p.editHref,
        ar: `الوصف ${p.description.length} حرف — هيتقص.`,
        en: `Description is ${p.description.length} characters — it will be cut.`,
      })
    }

    const title = p.metaTitle || p.title
    if (title.length > 60) {
      add({
        id: `title-${p.path}`,
        severity: 'warn',
        page: label,
        href: p.editHref,
        ar: `العنوان ${title.length} حرف — هيتقص في النتائج.`,
        en: `Title is ${title.length} characters — it will be cut in results.`,
      })
    }

    if (!p.cover) {
      add({
        id: `cover-${p.path}`,
        severity: 'warn',
        page: label,
        href: p.editHref,
        ar: 'مفيش صورة — المشاركة هتطلع بكارت فاضي.',
        en: 'No image — a shared link will show an empty card.',
      })
    }

    // A page hidden on purpose is fine; a page hidden by accident is not, and
    // the two look identical from outside. Worth naming either way.
    if (p.noindex) {
      add({
        id: `noindex-${p.path}`,
        severity: 'info',
        page: label,
        href: p.editHref,
        ar: 'الصفحة دي ممنوعة من الفهرسة (noindex).',
        en: 'This page is set to noindex.',
      })
    }

    if (p.html) {
      const text = stripTags(p.html)
      const count = text.split(/\s+/).filter(Boolean).length
      if (p.kind === 'article' && count < 300) {
        add({
          id: `thin-${p.path}`,
          severity: count < 120 ? 'bad' : 'warn',
          page: label,
          href: p.editHref,
          ar: `${count} كلمة — قصير.`,
          en: `${count} words — thin.`,
        })
      }
      const imgs = [...p.html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0])
      const noAlt = imgs.filter((i) => !/\balt\s*=\s*["'][^"']+["']/i.test(i)).length
      if (noAlt) {
        add({
          id: `alt-${p.path}`,
          severity: 'bad',
          page: label,
          href: p.editHref,
          ar: `${noAlt} صورة من غير وصف.`,
          en: `${noAlt} images with no alt text.`,
        })
      }
    }
  }

  /* ── across pages: the same line used twice ───────────────────────────── */
  const seenTitle = new Map<string, string[]>()
  const seenDesc = new Map<string, string[]>()
  for (const p of live) {
    const t = (p.metaTitle || p.title || '').trim().toLowerCase()
    if (t) seenTitle.set(t, [...(seenTitle.get(t) ?? []), p.title || p.path])
    const d = (p.description || '').trim().toLowerCase()
    if (d) seenDesc.set(d, [...(seenDesc.get(d) ?? []), p.title || p.path])
  }
  for (const [, group] of seenTitle) {
    if (group.length > 1) {
      add({
        id: `dup-title-${group[0]}`,
        severity: 'bad',
        ar: `${group.length} صفحات بنفس العنوان: ${group.join(' · ')}`,
        en: `${group.length} pages share one title: ${group.join(' · ')}`,
      })
    }
  }
  for (const [, group] of seenDesc) {
    if (group.length > 1) {
      add({
        id: `dup-desc-${group[0]}`,
        severity: 'warn',
        ar: `${group.length} صفحات بنفس الوصف: ${group.join(' · ')}`,
        en: `${group.length} pages share one description: ${group.join(' · ')}`,
      })
    }
  }

  /* ── orphans: pages nothing points at ─────────────────────────────────── */
  //
  // The portfolio links to every project and article by design, so an orphan
  // here means something narrower and more useful: an article no OTHER piece
  // of writing mentions. Those are the ones that sit at the end of the site
  // with nothing carrying a reader — or a crawler — to them.
  const articles = live.filter((p) => p.kind === 'article')
  const allHtml = live.map((p) => p.html || '').join(' ')
  for (const a of articles) {
    const linkedFrom = live.filter(
      (p) => p !== a && (p.html || '').includes(a.path),
    ).length
    if (linkedFrom === 0 && articles.length > 1) {
      add({
        id: `orphan-${a.path}`,
        severity: 'warn',
        page: a.title || a.path,
        href: a.editHref,
        ar: 'مفيش أي مقال تاني بيوصّل للمقال ده.',
        en: 'No other article links to this one.',
      })
    }
  }
  void allHtml

  /* ── internal links: what each piece could point at ───────────────────── */
  for (const a of articles) {
    const own = new Set(wordsOf(`${a.title} ${a.description ?? ''}`).filter((w) => !STOP.has(w)))
    if (own.size < 2) continue

    const links = a.html || ''
    const candidates = live
      .filter((p) => p !== a && !links.includes(p.path))
      .map((p) => {
        const theirs = wordsOf(`${p.title} ${p.description ?? ''}`).filter((w) => !STOP.has(w))
        const shared = theirs.filter((w) => own.has(w))
        return { page: p, score: new Set(shared).size }
      })
      .filter((c) => c.score >= 2)
      .sort((a2, b2) => b2.score - a2.score)
      .slice(0, 2)

    for (const c of candidates) {
      add({
        id: `link-${a.path}-${c.page.path}`,
        severity: 'info',
        page: a.title || a.path,
        href: a.editHref,
        ar: `ممكن تربط من هنا لـ«${c.page.title}» — بيتكلموا عن نفس الحاجة.`,
        en: `Could link from here to “${c.page.title}” — they cover the same ground.`,
      })
    }
  }

  const counts = {
    bad: findings.filter((f) => f.severity === 'bad').length,
    warn: findings.filter((f) => f.severity === 'warn').length,
    info: findings.filter((f) => f.severity === 'info').length,
  }
  return { findings, counts, pages: live.length }
}
