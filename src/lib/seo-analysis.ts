/**
 * Content analysis for the SEO panel.
 *
 * Pure functions over a piece of HTML and the fields around it, returning a
 * list of checks. No network, no database — so it runs as you type and can be
 * tested directly.
 *
 * Written for Arabic first. The readability scores everyone quotes (Flesch and
 * friends) count English syllables and mean nothing for Arabic, so nothing here
 * pretends to produce one: it measures what actually transfers between the two
 * — how long the sentences are, how long the paragraphs are, and whether the
 * headings step down in order.
 */

export type Status = 'good' | 'warn' | 'bad'

export type Check = {
  id: string
  /** good = nothing to do, warn = worth a look, bad = fix this. */
  status: Status
  ar: string
  en: string
}

export type AnalysisInput = {
  /** The article body, as HTML. */
  html: string
  title: string
  metaTitle?: string
  metaDescription?: string
  excerpt?: string
  slug?: string
  /** What this piece should be found for. Optional — the rest still runs. */
  keyphrase?: string
}

export type Analysis = {
  checks: Check[]
  score: number
  words: number
  /** Percentage of the body the keyphrase occupies. */
  density: number
}

/* ── text extraction ─────────────────────────────────────────────────────── */

const stripTags = (html: string) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Arabic words carry their grammar as prefixes and suffixes, so a plain string
 * match misses most real uses: "التصميم" and "بالتصميم" are the same word to a
 * reader and to a search engine, and would be two different strings here.
 * Definite articles and the common single-letter prepositions are trimmed so a
 * keyphrase is counted the way it is actually read.
 */
function normalise(text: string): string {
  return text
    .toLowerCase()
    // Harakat and tatweel are invisible to a reader; they must not split a match.
    .replace(/[ً-ْـ]/g, '')
    // Alef and ya and ta-marbuta are written more than one way for the same word.
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** A word with its Arabic prefixes removed, so inflected forms match. */
function stem(word: string): string {
  return word.replace(/^(وال|بال|كال|فال|ال|و|ب|ك|ف|ل)/, '').replace(/(ها|هم|كم|نا|ين|ون|ات)$/, '')
}

const words = (text: string): string[] => normalise(text).split(' ').filter(Boolean)

/** How many times a phrase occurs in a text, matching inflected forms. */
export function countPhrase(text: string, phrase: string): number {
  const needle = words(phrase).map(stem)
  if (!needle.length) return 0
  const hay = words(text).map(stem)
  let hits = 0
  for (let i = 0; i + needle.length <= hay.length; i++) {
    if (needle.every((w, j) => hay[i + j] === w)) hits++
  }
  return hits
}

const has = (text: string, phrase: string) => countPhrase(text, phrase) > 0

/* ── the checks ──────────────────────────────────────────────────────────── */

const ok = (id: string, ar: string, en: string): Check => ({ id, status: 'good', ar, en })
const warn = (id: string, ar: string, en: string): Check => ({ id, status: 'warn', ar, en })
const bad = (id: string, ar: string, en: string): Check => ({ id, status: 'bad', ar, en })

export function analyse(input: AnalysisInput): Analysis {
  const { html, title, keyphrase = '' } = input
  const body = stripTags(html)
  const bodyWords = words(body)
  const wordCount = bodyWords.length
  const checks: Check[] = []

  const metaTitle = input.metaTitle?.trim() || title
  const metaDescription = input.metaDescription?.trim() || input.excerpt?.trim() || ''
  const kp = keyphrase.trim()

  /* ── length of what a results page shows ──────────────────────────────── */
  const tLen = metaTitle.length
  checks.push(
    tLen === 0
      ? bad('title-length', 'مفيش عنوان.', 'No title.')
      : tLen > 60
        ? warn('title-length', `العنوان ${tLen} حرف — جوجل بيقص بعد ٦٠ تقريبًا.`, `Title is ${tLen} characters — Google cuts around 60.`)
        : tLen < 25
          ? warn('title-length', `العنوان ${tLen} حرف — قصير، فيه مساحة تستغلها.`, `Title is ${tLen} characters — short, there is room to say more.`)
          : ok('title-length', `طول العنوان مناسب (${tLen} حرف).`, `Title length is good (${tLen} characters).`),
  )

  const dLen = metaDescription.length
  checks.push(
    dLen === 0
      ? bad('desc-length', 'مفيش وصف — جوجل هيختار جملة من المقال بنفسه.', 'No description — Google will pick a sentence itself.')
      : dLen > 160
        ? warn('desc-length', `الوصف ${dLen} حرف — هيتقص بعد ١٦٠.`, `Description is ${dLen} characters — it will be cut after 160.`)
        : dLen < 80
          ? warn('desc-length', `الوصف ${dLen} حرف — قصير.`, `Description is ${dLen} characters — short.`)
          : ok('desc-length', `طول الوصف مناسب (${dLen} حرف).`, `Description length is good (${dLen} characters).`),
  )

  /* ── length of the piece itself ───────────────────────────────────────── */
  checks.push(
    wordCount < 120
      ? bad('length', `${wordCount} كلمة — قصير جدًا ليترتّب على أي حاجة.`, `${wordCount} words — too thin to rank for anything.`)
      : wordCount < 300
        ? warn('length', `${wordCount} كلمة — يفضّل ٣٠٠ على الأقل.`, `${wordCount} words — 300 or more works better.`)
        : ok('length', `${wordCount} كلمة.`, `${wordCount} words.`),
  )

  /* ── the keyphrase ────────────────────────────────────────────────────── */
  let density = 0
  if (!kp) {
    checks.push(warn('keyphrase', 'مفيش كلمة مفتاحية — اكتبها عشان أقدر أحلّل.', 'No focus keyphrase — set one to analyse against.'))
  } else {
    const hits = countPhrase(body, kp)
    density = wordCount ? (hits * words(kp).length * 100) / wordCount : 0

    checks.push(
      has(metaTitle, kp)
        ? ok('kp-title', 'الكلمة المفتاحية في العنوان.', 'Keyphrase is in the title.')
        : bad('kp-title', 'الكلمة المفتاحية مش في العنوان — ده أهم مكان.', 'Keyphrase is missing from the title — the single most important place.'),
    )
    checks.push(
      input.slug && has(input.slug.replace(/-/g, ' '), kp)
        ? ok('kp-slug', 'الكلمة المفتاحية في الرابط.', 'Keyphrase is in the URL.')
        : warn('kp-slug', 'الكلمة المفتاحية مش في الرابط.', 'Keyphrase is missing from the URL.'),
    )
    checks.push(
      metaDescription && has(metaDescription, kp)
        ? ok('kp-desc', 'الكلمة المفتاحية في الوصف.', 'Keyphrase is in the description.')
        : warn('kp-desc', 'الكلمة المفتاحية مش في الوصف.', 'Keyphrase is missing from the description.'),
    )

    // The opening is where a reader and a crawler both decide what this is about.
    const opening = bodyWords.slice(0, 120).join(' ')
    checks.push(
      has(opening, kp)
        ? ok('kp-intro', 'الكلمة المفتاحية في أول فقرة.', 'Keyphrase appears in the opening.')
        : warn('kp-intro', 'الكلمة المفتاحية مش في أول فقرة.', 'Keyphrase does not appear in the opening.'),
    )

    const headings = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => stripTags(m[2]))
    checks.push(
      headings.some((h) => has(h, kp))
        ? ok('kp-heading', 'الكلمة المفتاحية في عنوان فرعي.', 'Keyphrase appears in a subheading.')
        : warn('kp-heading', 'الكلمة المفتاحية مش في أي عنوان فرعي.', 'Keyphrase is in none of the subheadings.'),
    )

    checks.push(
      hits === 0
        ? bad('kp-density', 'الكلمة المفتاحية مش موجودة في المقال أصلًا.', 'The keyphrase does not appear in the article at all.')
        : density > 3
          ? bad('kp-density', `الكثافة ${density.toFixed(1)}% — تكرار زيادة، بيقرا كسبام.`, `Density is ${density.toFixed(1)}% — over-repeated, reads as spam.`)
          : density < 0.5
            ? warn('kp-density', `الكثافة ${density.toFixed(1)}% — قليلة (${hits} مرة).`, `Density is ${density.toFixed(1)}% — thin (${hits} occurrences).`)
            : ok('kp-density', `الكثافة ${density.toFixed(1)}% (${hits} مرة).`, `Density is ${density.toFixed(1)}% (${hits} occurrences).`),
    )
  }

  /* ── structure ────────────────────────────────────────────────────────── */
  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]))
  checks.push(
    levels.length === 0
      ? warn('headings', 'مفيش عناوين فرعية — النص كتلة واحدة.', 'No subheadings — the text is one block.')
      : ok('headings', `${levels.length} عنوان فرعي.`, `${levels.length} subheadings.`),
  )
  // The page already renders the article title as its H1.
  checks.push(
    levels.includes(1)
      ? warn('h1-in-body', 'فيه H1 جوّه النص — العنوان الأساسي بيتحط تلقائيًا، خليها H2.', 'There is an H1 in the body — the page already sets one, use H2.')
      : ok('h1-in-body', 'مفيش H1 مكرر.', 'No duplicate H1.'),
  )
  const skipped = levels.some((l, i) => i > 0 && l - levels[i - 1] > 1)
  checks.push(
    skipped
      ? warn('heading-order', 'ترتيب العناوين بيقفز مستوى (H2 بعدها H4 مثلًا).', 'Heading levels skip a step (H2 straight to H4).')
      : ok('heading-order', 'ترتيب العناوين سليم.', 'Heading levels step down in order.'),
  )

  /* ── images and links ─────────────────────────────────────────────────── */
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0])
  const noAlt = imgs.filter((i) => !/\balt\s*=\s*["'][^"']+["']/i.test(i)).length
  checks.push(
    imgs.length === 0
      ? warn('images', 'مفيش صور — الصور بتزوّد وقت القراءة وبتجيب من بحث الصور.', 'No images — they hold readers and bring traffic from image search.')
      : noAlt
        ? bad('images', `${noAlt} من ${imgs.length} صورة من غير وصف.`, `${noAlt} of ${imgs.length} images have no alt text.`)
        : ok('images', `${imgs.length} صورة، كلها موصوفة.`, `${imgs.length} images, all described.`),
  )
  if (kp && imgs.length) {
    const altText = imgs.map((i) => (i.match(/\balt\s*=\s*["']([^"']*)["']/i) || [, ''])[1]).join(' ')
    checks.push(
      has(altText, kp)
        ? ok('kp-alt', 'الكلمة المفتاحية في وصف صورة.', 'Keyphrase appears in an image description.')
        : warn('kp-alt', 'الكلمة المفتاحية مش في وصف أي صورة.', 'Keyphrase is in none of the image descriptions.'),
    )
  }

  const links = [...html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']*)["'][^>]*>/gi)].map((m) => m[1])
  const external = links.filter((h) => /^https?:\/\//i.test(h)).length
  checks.push(
    links.length === 0
      ? warn('links', 'مفيش روابط — اربط بمقال أو مشروع من عندك.', 'No links — point at one of your own articles or projects.')
      : ok('links', `${links.length} رابط (${external} خارجي).`, `${links.length} links (${external} external).`),
  )

  /* ── readability, measured not scored ─────────────────────────────────── */
  const sentences = body.split(/[.!?؟।\n]+|[۔]/).map((s) => s.trim()).filter((s) => s.length > 1)
  const longSentences = sentences.filter((s) => words(s).length > 25).length
  const longShare = sentences.length ? (longSentences / sentences.length) * 100 : 0
  checks.push(
    sentences.length === 0
      ? warn('sentences', 'مفيش جُمل كاملة.', 'No complete sentences.')
      : longShare > 30
        ? warn('sentences', `${Math.round(longShare)}% من الجُمل أطول من ٢٥ كلمة.`, `${Math.round(longShare)}% of sentences run past 25 words.`)
        : ok('sentences', `متوسط الجملة ${Math.round(bodyWords.length / sentences.length)} كلمة.`, `Sentences average ${Math.round(bodyWords.length / sentences.length)} words.`),
  )

  const paras = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => words(stripTags(m[1])).length)
  const longParas = paras.filter((n) => n > 150).length
  if (paras.length) {
    checks.push(
      longParas
        ? warn('paragraphs', `${longParas} فقرة أطول من ١٥٠ كلمة — قسّمها.`, `${longParas} paragraphs run past 150 words — break them up.`)
        : ok('paragraphs', `${paras.length} فقرة، أطوالها معقولة.`, `${paras.length} paragraphs, all a sensible length.`),
    )
  }

  /* ── one number ───────────────────────────────────────────────────────── */
  const weight = { good: 1, warn: 0.5, bad: 0 }
  const score = checks.length
    ? Math.round((checks.reduce((sum, c) => sum + weight[c.status], 0) / checks.length) * 100)
    : 0

  return { checks, score, words: wordCount, density }
}
