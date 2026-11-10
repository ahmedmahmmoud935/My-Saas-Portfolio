import type { PortfolioData } from './portfolio'
import { mediaUrl } from './portfolio'
import { resolveVideoUrl } from './video'
import { telTarget, waNumber } from './phone'
import { safeHref } from './safe-url'
import { toCategoryRows, catLabel } from './category-types'
import { STUDIO_LOOK } from './design-types'

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
    addReview: 'أضف رأيك',
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
    previewLabel: 'معاينة الواجهة',
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
    addReview: 'Add your review',
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
    previewLabel: 'Interface preview',
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

export type StudioData = {
  lang: Lang
  ui: StudioUI
  vars: Record<string, string>
  name: string
  monogram: { text: string; logoUrl: string | null }
  langHref: string
  hero: {
    kicker: string
    title: string[]
    desc: string
    btn1: string
    btn2: string
    btn2Href: string
    tiles: (
      | { kind: 'image'; cls: 'identity' | 'middle' | 'campaign'; href: string; img: string; caption: string }
      | { kind: 'digital'; href: string; brand: string; message: string; imgs: string[]; caption: string }
    )[]
  }
  strip: string[]
  about: {
    photo: string | null
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
    socials: { label: string; href: string }[]
    formTitle: string
    services: string[]
    tenantId: number
  } | null
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

/* The reference's own surfaces for its palette. With other colours they are
   worked out from the client's, in the same proportions. */
const REF = {
  light: { soft: '#efeae1', line: '#ddd6cb', accentLight: '#f5e0d3', hover: '#963918' },
  dark: { soft: '#252923', line: '#464a40', accentLight: '#37362b', strong: '#c77649' },
}

type Colors = Record<string, string | null | undefined>

function paletteVars(c: Colors): Record<string, string> {
  const pick = (k: string, d: string) => (trim(c[k]) || d).toLowerCase()
  const L = {
    bg: pick('bgLight', STUDIO_LOOK.colors.bgLight),
    surface: pick('bg2Light', STUDIO_LOOK.colors.bg2Light),
    ink: pick('textLight', STUDIO_LOOK.colors.textLight),
    muted: pick('subtextLight', STUDIO_LOOK.colors.subtextLight),
    accent: pick('accentLight', STUDIO_LOOK.colors.accentLight),
  }
  const D = {
    bg: pick('bg', STUDIO_LOOK.colors.bg),
    surface: pick('bg2', STUDIO_LOOK.colors.bg2),
    ink: pick('text', STUDIO_LOOK.colors.text),
    muted: pick('subtext', STUDIO_LOOK.colors.subtext),
    accent: pick('accent', STUDIO_LOOK.colors.accent),
  }
  const isRef = (o: Record<string, string>, ref: Record<string, string>) =>
    Object.entries(o).every(([k, v]) => v === ref[k].toLowerCase())
  const refL = isRef(L, { bg: STUDIO_LOOK.colors.bgLight, surface: STUDIO_LOOK.colors.bg2Light, ink: STUDIO_LOOK.colors.textLight, muted: STUDIO_LOOK.colors.subtextLight, accent: STUDIO_LOOK.colors.accentLight })
  const refD = isRef(D, { bg: STUDIO_LOOK.colors.bg, surface: STUDIO_LOOK.colors.bg2, ink: STUDIO_LOOK.colors.text, muted: STUDIO_LOOK.colors.subtext, accent: STUDIO_LOOK.colors.accent })
  return {
    '--t-bg': L.bg,
    '--t-surface': L.surface,
    '--t-ink': L.ink,
    '--t-muted': L.muted,
    '--t-accent': L.accent,
    '--t-soft': refL ? REF.light.soft : `color-mix(in srgb, ${L.ink} 6%, ${L.bg})`,
    '--t-line': refL ? REF.light.line : `color-mix(in srgb, ${L.ink} 14%, ${L.bg})`,
    '--t-accent-light': refL ? REF.light.accentLight : `color-mix(in srgb, ${L.accent} 16%, ${L.surface})`,
    '--t-accent-hover': refL ? REF.light.hover : `color-mix(in srgb, ${L.accent} 80%, #000)`,
    '--t-bg-d': D.bg,
    '--t-surface-d': D.surface,
    '--t-ink-d': D.ink,
    '--t-muted-d': D.muted,
    '--t-accent-d': D.accent,
    '--t-soft-d': refD ? REF.dark.soft : `color-mix(in srgb, ${D.surface} 45%, ${D.bg})`,
    '--t-line-d': refD ? REF.dark.line : `color-mix(in srgb, ${D.ink} 22%, ${D.bg})`,
    '--t-accent-light-d': refD ? REF.dark.accentLight : `color-mix(in srgb, ${D.accent} 12%, ${D.surface})`,
    '--t-accent-strong-d': refD ? REF.dark.strong : `color-mix(in srgb, ${D.accent} 78%, #000)`,
  }
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

  const name = trim(tenant.name)
  const enName = name
  const monoText = initials(enName).toLowerCase() || name.slice(0, 2)
  const base = `/${tenant.slug}`

  // ── Work ───────────────────────────────────────────────────────────────
  const typeOf = (p: (typeof projects)[number]): WorkType =>
    (p.mediaType || 'image') === 'image' ? 'designs' : p.videoKind === 'reel' ? 'reels' : 'videos'
  const studioProjects: StudioProject[] = projects
    .map((p) => {
      const cover = mediaUrl(p.cover, 'card')
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
    }
  })

  // ── Hero ───────────────────────────────────────────────────────────────
  const hero = (c.hero ?? {}) as Record<string, unknown>
  const tiles: StudioData['hero']['tiles'] = []
  if (style.heroGallery !== false && designs.length) {
    const prod = on('products') ? prods.find((p) => p.title) : undefined
    const first = designs[0]
    tiles.push({ kind: 'image', cls: 'identity', href: '#work', img: first.coverUrl, caption: first.title })
    if (prod) {
      tiles.push({
        kind: 'digital',
        href: '#digital',
        brand: prod.host || prod.title,
        message: prod.host ? prod.title : prod.tag || prod.title,
        imgs: [prod.image, ...designs.slice(1, 3).map((d) => d.coverUrl)].filter((u): u is string => !!u).slice(0, 3),
        caption: trim(c.products?.title) || ui.nav.digitalLong,
      })
    } else if (designs[2]) {
      tiles.push({ kind: 'image', cls: 'middle', href: '#work', img: designs[2].coverUrl, caption: designs[2].title })
    }
    if (designs[1]) tiles.push({ kind: 'image', cls: 'campaign', href: '#work', img: designs[1].coverUrl, caption: designs[1].title })
  }
  const hasDigital = on('products') && prods.length > 0

  // ── About ──────────────────────────────────────────────────────────────
  const about = (c.about ?? {}) as Record<string, unknown>
  const statValue = trim(about.statValue)
  const aboutTitle = lines(about.title)
  const aboutData: StudioData['about'] =
    on('about') && (aboutTitle.length || trim(about.text))
      ? {
          photo: mediaUrl(brand.photo as never, 'card'),
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
      icon: SERVICE_ICONS[i % SERVICE_ICONS.length],
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

  return {
    lang,
    ui,
    vars: paletteVars((settings?.colors ?? {}) as Colors),
    name,
    monogram: { text: monoText, logoUrl: mediaUrl(brand.brandLogo as never, 'thumb') },
    langHref: `${base}?lang=${lang === 'en' ? 'ar' : 'en'}`,
    hero: {
      kicker: trim(hero.title),
      title: lines(hero.name).length ? lines(hero.name) : [name],
      desc: trim(hero.desc),
      btn1: trim(hero.btn1) || ui.seeWork,
      btn2: trim(hero.btn2),
      btn2Href: hasDigital ? '#digital' : '#contact',
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
            more: trim(social.behance) ? { href: safeHref(trim(social.behance)), label: ui.more } : null,
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
      on('testimonials') && testimonials.length
        ? {
            title: trim(c.testimonials?.title) || (lang === 'en' ? 'Words I value.' : 'كلمات أعتز بها.'),
            subtitle: trim(studio.reviewsSub),
            addHref: `/testimonial/${tenant.slug}`,
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
          socials: socialLinks,
          formTitle: trim(studio.formTitle) || (lang === 'en' ? 'Tell me about your project' : 'احكِ لي عن مشروعك'),
          services: services.map((s) => s.title),
          tenantId: tenant.id,
        }
      : null,
    footer: trim(studio.footer),
    call: tel ? `tel:${tel}` : wa ? `https://wa.me/${wa}` : null,
  }
}
