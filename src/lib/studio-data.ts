import type { PortfolioData } from './portfolio'
import { mediaUrl } from './portfolio'
import { resolveVideoUrl } from './video'
import { telTarget, waNumber } from './phone'
import { safeHref } from './safe-url'
import { toCategoryRows, catLabel } from './category-types'
import { studioRootVars, type StudioLookInput } from './studio-look'
import type { SectionBgConfig } from '@/components/portfolio/SectionBg'

/**
 * Everything the studio template shows, read out of a portfolio's data and
 * resolved for one language, so the components only lay it out.
 *
 * The template is the owner's reference design; each line of it is a field
 * the client fills in the dashboard. Where the reference had wording of its
 * own (the buttons, the labels), it is kept here per language, word for word.
 */

export type Lang = 'ar' | 'en'

/** The reference's own interface wording. */
export const STUDIO_UI = {
  ar: {
    nav: { work: 'الأعمال', about: 'عنّي', services: 'الخدمات', experience: 'الخبرات', contact: 'تواصل', digital: 'مواقع وأنظمة', digitalLong: 'المواقع والأنظمة' },
    talk: 'لنتحدث',
    seeWork: 'استكشف أعمالي',
    all: 'الكل',
    view: 'عرض المشروع',
    projectSource: 'تفاصيل المشروع',
    videoSource: 'مشاهدة الفيديو',
    previous: 'السابق',
    next: 'التالي',
    close: 'إغلاق',
    discuss: 'لنتحدث عن مشروعك',
    whatsappUs: 'تواصل على واتساب',
    callUs: 'اتصل بي',
    serviceAsk: 'مرحباً، أريد الاستفسار عن خدمة:',
    addReview: 'أضف رأيك',
    readMore: 'اقرأ المزيد',
    readLess: 'عرض أقل',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    formName: 'الاسم',
    formEmail: 'بريدك الإلكتروني',
    formSubject: 'نوع المشروع',
    formMessage: 'تفاصيل المشروع',
    namePlaceholder: 'كيف أناديك؟',
    messagePlaceholder: 'ما الفكرة التي ترغب في تنفيذها؟',
    select: 'اختر الخدمة',
    other: 'تعاون آخر',
    submit: 'إرسال الرسالة',
    sending: 'جارٍ الإرسال…',
    formHint: 'رسالتك بتوصل مباشرة على بريدي، وبرد عليك في أقرب وقت.',
    sent: 'وصلتني رسالتك. شكراً لتواصلك، وهرد عليك قريب.',
    failed: 'الرسالة ما اتبعتتش. جرّب تاني، أو ابعتلي على البريد مباشرة.',
    top: 'إلى الأعلى',
    menu: 'فتح القائمة',
    theme: 'تغيير المظهر',
    langLabel: 'Switch to English',
    langShort: 'EN',
    empty: 'لا توجد مشاريع في هذا التصنيف.',
    more: 'المزيد على Behance',
    allWork: 'عرض كل المشاريع',
    backHome: 'الرئيسية',
    previewLabel: 'معاينة تصميمية للواجهة',
    previewIdea: 'معاينة تصميمية لفكرة الصفحة',
    details: 'التفاصيل',
    visit: 'زور الموقع',
    navLabel: 'التنقل الرئيسي',
    typesLabel: 'نوع الأعمال',
    catsLabel: 'تصنيفات المشاريع',
    gallery: 'لمحة من أعمالي',
    call: 'اتصل',
  },
  en: {
    nav: { work: 'Work', about: 'About', services: 'Services', experience: 'Experience', contact: 'Contact', digital: 'Web & systems', digitalLong: 'Websites & systems' },
    talk: "Let's talk",
    seeWork: 'Explore my work',
    all: 'All',
    view: 'View project',
    projectSource: 'Project details',
    videoSource: 'Watch the video',
    previous: 'Previous',
    next: 'Next',
    close: 'Close',
    discuss: 'Discuss your project',
    whatsappUs: 'Message on WhatsApp',
    callUs: 'Call me',
    serviceAsk: 'Hello, I would like to ask about:',
    addReview: 'Add your review',
    readMore: 'Read more',
    readLess: 'Show less',
    email: 'Email',
    phone: 'Phone',
    formName: 'Name',
    formEmail: 'Your email',
    formSubject: 'Project type',
    formMessage: 'Project details',
    namePlaceholder: 'What should I call you?',
    messagePlaceholder: 'What would you like to make?',
    select: 'Choose a service',
    other: 'Something else',
    submit: 'Send message',
    sending: 'Sending…',
    formHint: 'Your message comes straight to my inbox, and I reply as soon as I can.',
    sent: 'Got your message. Thank you — I’ll be in touch soon.',
    failed: 'The message did not go out. Try again, or email me directly.',
    top: 'Back to top',
    menu: 'Open menu',
    theme: 'Change theme',
    langLabel: 'التبديل إلى العربية',
    langShort: 'عربي',
    empty: 'No projects in this category.',
    more: 'More on Behance',
    allWork: 'View all projects',
    backHome: 'Home',
    previewLabel: 'Illustrative interface preview',
    previewIdea: 'Illustrative layout of the design concept',
    details: 'Details',
    visit: 'Visit the site',
    navLabel: 'Main navigation',
    typesLabel: 'Type of work',
    catsLabel: 'Project categories',
    gallery: 'A glimpse of my work',
    call: 'Call',
  },
} as const

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> }
export type StudioUI = Widen<(typeof STUDIO_UI)['ar']>

/** A heading as the reference writes them: plain lines, the last one in the accent. */
export type Heading = { lines: string[]; accentLast: boolean }

export type WorkType = 'designs' | 'reels' | 'videos'
export type StudioProject = {
  id: number
  title: string
  category: string
  type: WorkType
  coverUrl: string
  /** An embeddable player, or a video file. */
  video: { kind: 'iframe' | 'file'; url: string } | null
  pageHref: string
  videoHref: string | null
}

/** The template's sections, in the order they can be arranged. */
export type StudioSection = 'hero' | 'about' | 'work' | 'digital' | 'services' | 'reviews' | 'team' | 'clients' | 'experience' | 'tools' | 'education' | 'skills' | 'contact'

export type StudioData = {
  lang: Lang
  dir: 'rtl' | 'ltr'
  order: StudioSection[]
  cursor: boolean
  ui: StudioUI
  vars: Record<string, string>
  attrs: Record<string, string>
  name: string
  /** The home page and the all-projects page, in this language. */
  homeHref: string
  workHref: string
  monogram: { text: string; logoUrl: string | null }
  langHref: string
  hero: {
    kicker: string
    title: string[]
    desc: string
    btn1: string
    btn2: string
    btn2Href: string
    /** Whether the photos under the hero show on phones. */
    tilesMobile: boolean
    /** A cover picture behind the hero, with its veil per theme. */
    cover: { url: string; posX: number; posY: number; fit: string; dark: number; light: number } | null
    tiles: (
      | { kind: 'image'; cls: 'identity' | 'middle' | 'campaign'; href: string; img: string; caption: string }
      | { kind: 'digital'; href: string; brand: string; message: string; imgs: string[]; caption: string }
    )[]
  }
  strip: string[]
  about: {
    photo: string | null
    frame: { fit: string; posX: number; posY: number }
    stat: { number: string; suffix: string; label: string } | null
    heading: Heading
    paragraphs: string[]
    chips: string[]
  } | null
  work: {
    title: string
    subtitle: string
    tabs: { id: WorkType; label: string }[]
    categories: Record<WorkType, { id: string; label: string }[]>
    projects: StudioProject[]
    more: { href: string; label: string } | null
    /** Columns per screen size, when the client chose other than the template's own. */
    cols: Record<WorkType, { d?: number; t?: number; m?: number }>
  } | null
  digital: {
    title: string
    subtitle: string
    items: {
      id: number
      title: string
      tag: string
      description: string
      details: string
      image: string | null
      url: string
      btn: string
      host: string
      detailsLabel: string
      /** Shown on the large card, the rest under it. */
      featured: boolean
      preview: 'image' | 'site' | 'landing' | 'chart'
      mock: { brand: string; tagline: string; headline: string[]; cta: string; imgs: string[] }
    }[]
    endText: string
    endBtn: string
  } | null
  services: {
    heading: Heading
    subtitle: string
    items: { title: string; desc: string; iconUrl: string | null; icon: string }[]
  } | null
  reviews: {
    title: string
    subtitle: string
    addHref: string
    items: { id: number; text: string; rating: number; name: string; role: string; avatar: string | null; initials: string }[]
  } | null
  clients: {
    title: string
    logos: { id: number; name: string; img: string; href: string | null }[]
    stats: { value: string; label: string }[]
  } | null
  experience: {
    title: string
    subtitle: string
    jobs: { date: string; company: string; role: string; place: string }[]
  } | null
  tools: { title: string; items: { name: string; letters: string; bg: string; fg: string; iconUrl: string | null }[] } | null
  education: {
    title: string
    items: { title: string; org: string; text: string; period: string }[]
  } | null
  contact: {
    title: string
    subtitle: string
    body: string
    email: string
    phone: { href: string; display: string } | null
    whatsapp: { href: string; display: string } | null
    socials: { label: string; href: string }[]
    formTitle: string
    services: string[]
    tenantId: number
  } | null
  team: { title: string; members: { id: number; name: string; role: string; bio: string; photo: string | null; initials: string }[] } | null
  skills: { title: string; items: string[] } | null
  /** Backgrounds the client gave sections in Design, by template section. */
  sectionBg: Partial<Record<StudioSection, SectionBgConfig>>
  /** The top bar's links: the client's, when set in the bar editor. */
  nav: { id: string; label: string }[] | null
  footer: string
  call: string | null
}

const trim = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const lines = (v: unknown) =>
  trim(v)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
const words = (v: unknown) =>
  trim(v)
    .split(/[,،\n]/)
    .map((w) => w.trim())
    .filter(Boolean)

/** "6+" → 6 and +, as the photo note sets the suffix in the accent. */
function splitStat(v: string) {
  const m = v.match(/^([\d.,٠-٩]+)(.*)$/)
  return m ? { number: m[1], suffix: m[2].trim() } : { number: v, suffix: '' }
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/* The reference draws each tool as a coloured letter tile. Known tools get
   their own colours; anything else takes the accent. */
const TOOL_TILES: [RegExp, string, string, string][] = [
  [/photoshop/i, 'Ps', '#113462', '#72b5ff'],
  [/after\s*effects/i, 'Ae', '#27215d', '#b0a7ff'],
  [/premiere/i, 'Pr', '#2e225d', '#d1b2ff'],
  [/illustrator/i, 'Ai', '#2e1600', '#ff9a00'],
  [/indesign/i, 'Id', '#49021f', '#ff3366'],
  [/lightroom/i, 'Lr', '#001e36', '#31a8ff'],
  [/\bxd\b|adobe xd/i, 'Xd', '#470137', '#ff61f6'],
  [/capcut/i, 'C', '#1d1e1e', '#fff'],
  [/figma/i, 'Fi', '#ffe9de', '#bc4f31'],
  [/blender/i, 'Bl', '#1d1e1e', '#f5792a'],
  [/davinci|resolve/i, 'Dr', '#1d1e1e', '#fff'],
  [/cinema\s*4d|c4d/i, 'C4', '#0b1b3a', '#8ec5ff'],
  [/canva/i, 'Ca', '#e0f7fa', '#00a0b0'],
]
function toolTile(name: string) {
  for (const [re, letters, bg, fg] of TOOL_TILES) if (re.test(name)) return { letters, bg, fg }
  const l = name.replace(/[^A-Za-z؀-ۿ]/g, '').slice(0, 2)
  return { letters: l ? l[0].toUpperCase() + (l[1] ?? '').toLowerCase() : '•', bg: 'var(--accent-light)', fg: 'var(--accent)' }
}

const SERVICE_ICONS = ['palette', 'clapperboard', 'layers', 'monitor', 'layout-dashboard', 'sparkles']
/* Each service draws the icon its name asks for, as the reference's do;
   a name that matches none takes the next in the reference's order. */
const SERVICE_ICON_RULES: [RegExp, string][] = [
  [/ذكاء|\bai\b|artificial/i, 'sparkles'],
  [/نظام|أنظمة|انظمة|لوحة|لوحات|dashboard|system/i, 'layout-dashboard'],
  [/موقع|مواقع|ويب|web|site/i, 'monitor'],
  [/فيديو|مونتاج|ريلز|video|edit|reel/i, 'clapperboard'],
  [/حمل|محتوى|موشن|campaign|content|motion/i, 'layers'],
  [/تصميم|هوية|جرافيك|design|brand|graphic|ui|ux/i, 'palette'],
]
function serviceIcon(title: string, i: number) {
  for (const [re, icon] of SERVICE_ICON_RULES) if (re.test(title)) return icon
  return SERVICE_ICONS[i % SERVICE_ICONS.length]
}

const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function buildStudioData(data: PortfolioData, lang: Lang, q: string): StudioData {
  const { tenant, settings, projects, achievements, logos, testimonials, products } = data
  const ui: StudioUI = STUDIO_UI[lang]
  const c = (settings?.content ?? {}) as Record<string, Record<string, unknown> | undefined>
  const studio = (c.studio ?? {}) as Record<string, unknown>
  const brand = (settings?.brand ?? {}) as Record<string, unknown>
  const style = (settings?.style ?? {}) as Record<string, unknown>
  const social = (settings?.social ?? {}) as Record<string, string | null | undefined>
  const visibleSocial = new Set(((social as { visible?: string[] }).visible ?? ['behance', 'instagram', 'linkedin', 'vimeo']) as string[])

  /* Hidden in the section order stays hidden here; the order itself is the
     reference's, which is what makes it the reference. */
  const hidden = new Set(
    (settings?.sections ?? []).filter((s) => s.visible === false).map((s) => String(s.sectionId)),
  )
  const on = (id: string) => !hidden.has(id)

  // The name in the bar and the footer: the client's own wording, per language.
  const name = trim(studio.brand) || trim(tenant.name)
  const enName = name
  const monoText = initials(enName).toLowerCase() || name.slice(0, 2)
  const base = `/${tenant.slug}`

  // ── Work ───────────────────────────────────────────────────────────────
  const typeOf = (p: (typeof projects)[number]): WorkType =>
    // As the classic grid sorts them: only an explicit "video" is a landscape video.
    (p.mediaType || 'image') === 'image' ? 'designs' : p.videoKind === 'video' ? 'videos' : 'reels'
  const studioProjects: StudioProject[] = projects
    .map((p) => {
      // No cover chosen: the project's first picture stands in, as on its page.
      const cover =
        mediaUrl(p.cover, 'card') ||
        (p.images ?? []).map((im) => mediaUrl(im.image as never, 'card')).find((u): u is string => !!u) ||
        null
      const type = typeOf(p)
      const video = type === 'designs' ? null : resolveVideoUrl(p.videoUrl)
      return {
        id: p.id,
        title: trim(p.title),
        category: trim(p.category),
        type,
        coverUrl: cover || '',
        video,
        pageHref: `${base}/project/${p.id}${q}`,
        videoHref: type === 'designs' ? null : trim(p.videoUrl) || null,
      }
    })
    .filter((p) => p.coverUrl || p.video)
  const catRows = {
    image: toCategoryRows(settings?.categories?.image ?? []),
    video: toCategoryRows(settings?.categories?.video ?? []),
  }
  const catsFor = (type: WorkType) => {
    const used = Array.from(new Set(studioProjects.filter((p) => p.type === type).map((p) => p.category).filter(Boolean)))
    const rows = type === 'designs' ? catRows.image : catRows.video
    return used.map((id) => {
      const row = rows.find((r) => r.name === id)
      return { id, label: row ? catLabel(row, lang) : id }
    })
  }
  const tabLabels = (settings?.projTabs ?? {}) as Record<string, { label?: string | null } | undefined>
  const defaultTab: Record<WorkType, string> = { designs: lang === 'en' ? 'Designs' : 'التصاميم', reels: lang === 'en' ? 'Reels' : 'الريلز', videos: lang === 'en' ? 'Videos' : 'الفيديوهات' }
  const tabs = (['designs', 'reels', 'videos'] as WorkType[])
    .filter((t) => studioProjects.some((p) => p.type === t))
    .map((id) => ({ id, label: trim(tabLabels[id]?.label) || defaultTab[id] }))
  const designs = studioProjects.filter((p) => p.type === 'designs' && p.coverUrl)

  // ── Digital products ──────────────────────────────────────────────────
  const prods = products.map((p) => {
    const url = safeHref(trim(p.url), '')
    return {
      id: p.id,
      title: trim(p.title),
      tag: trim(p.tag),
      description: trim(p.description),
      details: trim(p.details),
      image: mediaUrl(p.image, 'card') || trim(p.previewImage) || null,
      url,
      btn: trim(p.btnLabel) || ui.visit,
      host: url ? host(url) : '',
      detailsLabel: trim(p.detailsLabel) || ui.details,
      featured: (p as { featured?: boolean | null }).featured === true,
      preview: (['site', 'landing', 'chart'].includes(String(p.preview)) ? p.preview : 'image') as 'image' | 'site' | 'landing' | 'chart',
      mock: {
        brand: trim(p.mockBrand),
        tagline: trim(p.mockTagline),
        headline: lines(p.mockHeadline),
        cta: trim(p.mockCta),
        imgs: [] as string[],
      },
    }
  })

  // A drawn website shows the client's latest four designs as its grid.
  for (const p of prods) if (p.preview === 'site') p.mock.imgs = designs.slice(0, 4).map((d) => d.coverUrl)

  // ── Hero ───────────────────────────────────────────────────────────────
  const hero = (c.hero ?? {}) as Record<string, unknown>
  const tiles: StudioData['hero']['tiles'] = []
  if (style.heroGallery !== false && on('projects') && designs.length) {
    const prod = on('products') ? prods.find((p) => p.title) : undefined
    const first = designs[0]
    tiles.push({ kind: 'image', cls: 'identity', href: '#projects', img: first.coverUrl, caption: first.title })
    if (prod) {
      tiles.push({
        kind: 'digital',
        href: '#products',
        brand: prod.host || prod.title,
        message: prod.host ? prod.title : prod.tag || prod.title,
        imgs: [prod.image, ...designs.slice(1, 3).map((d) => d.coverUrl)].filter((u): u is string => !!u).slice(0, 3),
        caption: trim(c.products?.title) || ui.nav.digitalLong,
      })
    } else if (designs[2]) {
      tiles.push({ kind: 'image', cls: 'middle', href: '#projects', img: designs[2].coverUrl, caption: designs[2].title })
    }
    if (designs[1]) tiles.push({ kind: 'image', cls: 'campaign', href: '#projects', img: designs[1].coverUrl, caption: designs[1].title })
  }
  const hasDigital = on('products') && prods.length > 0

  // ── About ──────────────────────────────────────────────────────────────
  const about = (c.about ?? {}) as Record<string, unknown>
  const statValue = trim(about.statValue)
  const aboutTitle = lines(about.title)
  const aboutData: StudioData['about'] =
    on('about') && (aboutTitle.length || trim(about.text) || mediaUrl(brand.photo as never) || words(about.tags).length)
      ? {
          photo: mediaUrl(brand.photo as never, 'card'),
          frame: {
            fit: (settings?.aboutPhoto as { size?: string } | undefined)?.size === 'contain' ? 'contain' : 'cover',
            posX: Number((settings?.aboutPhoto as { posX?: number } | undefined)?.posX ?? 50),
            posY: Number((settings?.aboutPhoto as { posY?: number } | undefined)?.posY ?? 35),
          },
          stat: statValue ? { ...splitStat(statValue), label: trim(about.statLabel) } : null,
          heading: { lines: aboutTitle, accentLast: aboutTitle.length > 1 },
          paragraphs: lines(about.text),
          chips: words(about.tags),
        }
      : null

  // ── Services ───────────────────────────────────────────────────────────
  const exp = (c.expertise ?? {}) as { title?: string; items?: Record<string, unknown>[] }
  const servicesTitle = lines(exp.title)
  const services = (exp.items ?? [])
    .map((it, i) => ({
      title: trim(it.title),
      desc: trim(it.description),
      iconUrl: mediaUrl(it.icon as never, 'thumb'),
      icon: serviceIcon(trim(it.title), i),
    }))
    .filter((s) => s.title)

  // ── Contact ────────────────────────────────────────────────────────────
  const contact = (c.contact ?? {}) as Record<string, unknown>
  const rawPhone = trim(contact.phone)
  const tel = telTarget(rawPhone)
  const wa = waNumber(social.whatsapp)
  const socialLinks: { label: string; href: string }[] = (
    [
      ['behance', 'Behance'],
      ['vimeo', 'Vimeo'],
      ['instagram', 'Instagram'],
      ['linkedin', 'LinkedIn'],
      ['facebook', 'Facebook'],
    ] as const
  )
    .filter(([k]) => visibleSocial.has(k) && trim(social[k]))
    .map(([k, label]) => ({ label, href: safeHref(trim(social[k])) }))

  const education = ((c.education ?? {}) as { title?: string; items?: Record<string, unknown>[] })
  const experience = ((c.experience ?? {}) as { title?: string; items?: Record<string, unknown>[] })
  const tools = ((c.tools ?? {}) as { title?: string; items?: Record<string, unknown>[] })

  /* The sections in the client's own order. The template's ids map onto
     the section editor's; clients and numbers share one section, placed
     where the first of the two is. */
  const SECTION_OF: Record<string, StudioSection> = {
    hero: 'hero', about: 'about', projects: 'work', products: 'digital', expertise: 'services',
    testimonials: 'reviews', team: 'team', logos: 'clients', achievements: 'clients', experience: 'experience',
    tools: 'tools', education: 'education', skills: 'skills', contact: 'contact',
  }
  const DEFAULT_ORDER: StudioSection[] = ['hero', 'about', 'work', 'digital', 'services', 'reviews', 'team', 'clients', 'experience', 'tools', 'education', 'skills', 'contact']
  const savedOrder = [...(settings?.sections ?? [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s) => SECTION_OF[String(s.sectionId)])
    .filter((x): x is StudioSection => !!x)
  const order: StudioSection[] = []
  for (const id of savedOrder) if (!order.includes(id)) order.push(id)
  DEFAULT_ORDER.forEach((id, i) => {
    if (order.includes(id)) return
    const prev = DEFAULT_ORDER.slice(0, i).reverse().find((p) => order.includes(p))
    order.splice(prev ? order.indexOf(prev) + 1 : 0, 0, id)
  })
  // The hero leads the page whatever the order says, as in the classic look.
  const ordered: StudioSection[] = [...(on('hero') ? (['hero'] as StudioSection[]) : []), ...order.filter((x) => x !== 'hero')]

  return {
    lang,
    dir: style.direction === 'ltr' ? 'ltr' : style.direction === 'rtl' ? 'rtl' : lang === 'en' ? 'ltr' : 'rtl',
    order: ordered,
    cursor: style.cursor === 'dot-ring',
    ui,
    ...studioRootVars(settings as unknown as StudioLookInput),
    name,
    homeHref: `${base}${q}`,
    workHref: `${base}/projects${q}`,
    monogram: { text: monoText, logoUrl: mediaUrl(brand.brandLogo as never, 'thumb') },
    langHref: `${base}?lang=${lang === 'en' ? 'ar' : 'en'}`,
    hero: {
      kicker: trim(hero.title),
      title: lines(hero.name).length ? lines(hero.name) : [name],
      desc: trim(hero.desc),
      btn1: trim(hero.btn1) || ui.seeWork,
      btn2: trim(hero.btn2),
      btn2Href: hasDigital ? '#products' : '#contact',
      tilesMobile: style.heroGalleryMobile !== false,
      cover: (() => {
        const url = mediaUrl(brand.heroCover as never)
        if (!url) return null
        const hc = (settings?.heroCover ?? {}) as Record<string, unknown>
        const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d)
        return {
          url,
          posX: num(hc.posX, 50),
          posY: num(hc.posY, 50),
          fit: hc.size === 'contain' ? 'contain' : 'cover',
          dark: num(hc.overlay, 45),
          light: num(hc.overlayLight, 25),
        }
      })(),
      tiles,
    },
    strip: on('hero') ? words(studio.strip) : [],
    about: aboutData,
    work:
      on('projects') && studioProjects.length
        ? {
            title: trim(c.projects?.title) || (lang === 'en' ? 'Selected work.' : 'أعمال مختارة.'),
            subtitle: trim(c.projects?.subtitle),
            tabs,
            categories: { designs: catsFor('designs'), reels: catsFor('reels'), videos: catsFor('videos') },
            projects: studioProjects,
            more: trim(social.behance) && visibleSocial.has('behance') ? { href: safeHref(trim(social.behance)), label: ui.more } : null,
            cols: (() => {
              /* The grid keeps the reference's own columns until the client
                 picks others: the stored defaults (4 / 3 / 2) are what every
                 site has without choosing, so they read as "not chosen". */
              const g = (settings?.gridCols ?? {}) as Record<string, number | null | undefined>
              const pick = (v: number | null | undefined, def: number) => (typeof v === 'number' && v > 0 && v !== def ? v : undefined)
              const image = { d: pick(g.imageDesktop, 4), t: pick(g.imageTablet, 3), m: pick(g.imageMobile, 2) }
              const video = { d: pick(g.videoDesktop, 4), t: pick(g.videoTablet, 3), m: pick(g.videoMobile, 2) }
              return { designs: image, reels: video, videos: video }
            })(),
          }
        : null,
    digital: hasDigital
      ? {
          title: trim(c.products?.title) || (lang === 'en' ? 'Beyond the image.' : 'أبعد من الصورة.'),
          subtitle: trim(c.products?.subtitle),
          items: prods,
          endText: trim(studio.digitalEnd),
          endBtn: trim(studio.digitalEndBtn),
        }
      : null,
    services:
      on('expertise') && services.length
        ? {
            heading: { lines: servicesTitle.length ? servicesTitle : [ui.nav.services], accentLast: servicesTitle.length > 1 },
            subtitle: trim(studio.servicesSub),
            items: services,
          }
        : null,
    reviews:
      on('testimonials')
        ? {
            title: trim(c.testimonials?.title) || (lang === 'en' ? 'Words I value.' : 'كلمات أعتز بها.'),
            subtitle: trim(studio.reviewsSub),
            addHref: `/testimonial/${tenant.slug}${lang === 'en' ? '?lang=en' : ''}`,
            items: testimonials.map((t) => ({
              id: t.id,
              text: trim(t.content),
              rating: Math.max(0, Math.min(5, Math.round(Number(t.rating ?? 5)))),
              name: trim(t.name),
              role: [trim(t.role), trim(t.company)].filter(Boolean).join(' · '),
              avatar: mediaUrl(t.avatar, 'thumb'),
              initials: initials(trim(t.name)),
            })),
          }
        : null,
    clients:
      (on('logos') && logos.length) || (on('achievements') && achievements.length)
        ? {
            title: trim(c.clients?.title) || (lang === 'en' ? 'Brands along the way.' : 'علامات شاركتها الرحلة.'),
            logos: on('logos')
              ? logos
                  .map((l) => ({ id: l.id, name: trim(l.name), img: mediaUrl(l.logo) || '', href: trim(l.websiteUrl) ? safeHref(trim(l.websiteUrl)) : null }))
                  .filter((l) => l.img)
              : [],
            stats: on('achievements')
              ? achievements.map((a) => ({ value: trim(a.value), label: trim(a.title) })).filter((s) => s.value)
              : [],
          }
        : null,
    experience:
      on('experience') && (experience.items ?? []).length
        ? {
            title: trim(experience.title) || (lang === 'en' ? 'Experience.' : 'الخبرات.'),
            subtitle: trim(studio.experienceSub),
            jobs: (experience.items ?? []).map((j) => ({
              date: trim(j.period),
              company: trim(j.company),
              role: trim(j.role),
              place: trim(j.description),
            })),
          }
        : null,
    tools:
      on('tools') && (tools.items ?? []).length
        ? {
            title: trim(tools.title) || (lang === 'en' ? 'Tools.' : 'الأدوات.'),
            items: (tools.items ?? [])
              .map((t) => ({ name: trim(t.name), iconUrl: mediaUrl(t.icon as never, 'thumb'), ...toolTile(trim(t.name)) }))
              .filter((t) => t.name),
          }
        : null,
    education:
      on('education') && (education.items ?? []).length
        ? {
            title: trim(education.title) || (lang === 'en' ? 'Education.' : 'التعليم.'),
            items: (education.items ?? []).map((e) => ({
              title: trim(e.title),
              org: trim(e.org),
              text: trim(e.description),
              period: trim(e.period),
            })),
          }
        : null,
    contact: on('contact')
      ? {
          title: trim(contact.title) || (lang === 'en' ? 'Your next idea?' : 'فكرتك التالية؟'),
          subtitle: trim(contact.subtitle),
          body: trim(studio.contactBody),
          email: trim(contact.email),
          phone: tel ? { href: `tel:${tel}`, display: rawPhone } : null,
          whatsapp: wa && visibleSocial.has('whatsapp') ? { href: `https://wa.me/${wa}`, display: `+${wa}` } : null,
          socials: socialLinks,
          formTitle: trim(studio.formTitle) || (lang === 'en' ? 'Tell me about your project' : 'احكِ لي عن مشروعك'),
          services: services.map((s) => s.title),
          tenantId: tenant.id,
        }
      : null,
    team:
      on('team') && data.team.length
        ? {
            title: trim(c.team?.title) || (lang === 'en' ? 'The team.' : 'الفريق.'),
            members: data.team.map((m) => ({
              id: m.id,
              name: trim(m.name),
              role: trim(m.role),
              bio: trim(m.bio),
              photo: mediaUrl(m.photo, 'thumb'),
              initials: initials(trim(m.name)),
            })),
          }
        : null,
    skills:
      on('skills') && words(c.skills?.items).length
        ? { title: trim(c.skills?.title) || (lang === 'en' ? 'Skills.' : 'المهارات.'), items: words(c.skills?.items) }
        : null,
    sectionBg: (() => {
      const out: Partial<Record<StudioSection, SectionBgConfig>> = {}
      for (const row of settings?.sectionBg ?? []) {
        const id = SECTION_OF[String(row.section)]
        if (!id || out[id]) continue
        out[id] = { ...row, imageUrl: mediaUrl(row.image as never, 'card') } as SectionBgConfig
      }
      return out
    })(),
    nav: (() => {
      // Never configured: the template's own links. Configured with every
      // link hidden: none.
      const all = settings?.navbarLinks ?? []
      if (!all.length) return null
      return all
        .filter((l) => l.visible !== false && l.linkId)
        .map((l) => ({ id: String(l.linkId), label: trim(l.label) || String(l.linkId) }))
    })(),
    footer: trim(studio.footer),
    call: tel ? `tel:${tel}` : wa && visibleSocial.has('whatsapp') ? `https://wa.me/${wa}` : null,
  }
}
