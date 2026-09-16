'use client'

import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from './PageHeader'
import { useDashLang } from './DashLang'
import MediaUploader from './MediaUploader'
import SectionBgRows from './SectionBgRows'
import LandingPreview from './LandingPreview'
import { ColorInput, Opt, Slider } from './controls'
import { saveLanding, type LandingImages, type LandingStyle, type LandingTheme, type LandingTools } from '@/lib/landing-actions'
import { LANDING_COPY } from '@/lib/landing-copy'
import { LANDING_BANDS, type LandingOrderItem } from '@/lib/landing-order'
import {
  DARK_PALETTES,
  FONT_AR_OPTIONS,
  FONT_LATIN_OPTIONS,
  LIGHT_PALETTES,
  LANDING_BG_SECTIONS,
  type SectionBgForm,
} from '@/lib/design-types'

type Copy = (typeof LANDING_COPY)['ar']
type Form = {
  ar: Copy
  en: Copy
  theme: LandingTheme
  images: LandingImages
  style: LandingStyle
  tools: LandingTools
  sectionBg: SectionBgForm[]
  order: LandingOrderItem[]
  tenants: { slug: string; name: string }[]
}

/**
 * The editor's tabs, in the same three groups the client dashboard uses.
 *
 * The content tabs follow the page from top to bottom, and each one holds
 * everything its section says — the heading and the sentence under it
 * included — so a section is edited in one place rather than split between
 * its own tab and a shared one for titles.
 */
const SECTION_GROUPS = [
  {
    ar: 'المحتوى',
    en: 'Content',
    items: [
      { id: 'hero', ar: 'القسم الرئيسي', en: 'Hero' },
      { id: 'compare', ar: 'الفرق', en: 'Comparison' },
      { id: 'panel', ar: 'فيديو الشرح', en: 'Explainer video' },
      { id: 'features', ar: 'المميزات', en: 'Features' },
      { id: 'dash', ar: 'قسم لوحة التحكم', en: 'Dashboard tour' },
      { id: 'audience', ar: 'لمين؟', en: 'Who it is for' },
      { id: 'how', ar: 'الخطوات', en: 'Steps' },
      { id: 'showcase', ar: 'الأمثلة', en: 'Showcase' },
      { id: 'pricing', ar: 'الأسعار', en: 'Pricing' },
      { id: 'testimonials', ar: 'آراء العملاء', en: 'Testimonials' },
      { id: 'faq', ar: 'الأسئلة', en: 'FAQ' },
      { id: 'cta', ar: 'دعوة الفعل', en: 'Call to action' },
    ],
  },
  {
    ar: 'التصميم',
    en: 'Design',
    items: [
      { id: 'order', ar: 'ترتيب الأقسام', en: 'Section order' },
      { id: 'style', ar: 'الألوان', en: 'Colours' },
      { id: 'cards', ar: 'شكل الكروت', en: 'Card style' },
      { id: 'images', ar: 'الصور', en: 'Images' },
      { id: 'backgrounds', ar: 'خلفيات الأقسام', en: 'Section backgrounds' },
    ],
  },
  {
    ar: 'الموقع',
    en: 'Site',
    items: [
      { id: 'header', ar: 'الشريط العلوي', en: 'Header' },
      { id: 'footer', ar: 'الفوتر', en: 'Footer' },
      { id: 'legal', ar: 'الصفحات القانونية', en: 'Legal pages' },
      { id: 'tools', ar: 'جوجل و SEO', en: 'Google & SEO' },
    ],
  },
] as const

type SectionId = (typeof SECTION_GROUPS)[number]['items'][number]['id']

/**
 * Where each section sits on the page, for the preview beside the editor: the
 * id its band carries, or one of the page's two ends.
 */
const SPOT: Record<SectionId, string> = {
  hero: 'top',
  compare: 'compare',
  panel: 'panel',
  features: 'features',
  dash: 'dashboard',
  audience: 'audience',
  how: 'how',
  showcase: 'showcase',
  pricing: 'pricing',
  testimonials: 'testimonials',
  faq: 'faq',
  cta: 'cta',
  order: 'top',
  style: 'top',
  cards: 'features',
  images: 'top',
  backgrounds: 'top',
  header: 'top',
  footer: 'bottom',
  legal: 'bottom',
  tools: 'top',
}

/** The repeated things a section holds — cards, steps, plans, questions. */
type ItemKey = 'features' | 'how' | 'faqs' | 'testimonials' | 'dash' | 'plans'

/** One entry in a section's outline: a group of its fields, or one of its items. */
type Pane = { id: string; label: string; mark?: string; item?: { key: ItemKey; i: number } }

/** A section as a short list: what comes before its items, the items, and after. */
type Outline = {
  before: Pane[]
  items?: { key: ItemKey; panes: Pane[]; add: string; noun: string }
  after?: Pane[]
}

/** What each of those groups is called when it is the whole page. */
const HEADINGS = {
  Content: {
    icon: '📝',
    ar: 'المحتوى',
    en: 'Content',
    subAr: 'كلام الصفحة الرئيسية، قسم قسم — بنفس ترتيب ظهورهم للزائر.',
    subEn: 'What the landing page says, section by section, in the order a visitor reads it.',
  },
  Site: {
    icon: '🌍',
    ar: 'الموقع',
    en: 'Site',
    subAr: 'اللي حوالين الصفحة: الشريط العلوي، الفوتر، الصفحات القانونية، وجوجل.',
    subEn: 'What sits around the page: the bar on top, the footer, the legal pages, and Google.',
  },
  Design: {
    icon: '🎨',
    ar: 'التصميم',
    en: 'Design',
    subAr: 'ترتيب الأقسام وألوانها وخلفياتها وشكل الكروت.',
    subEn: 'The order of the sections, their colours and backdrops, and the shape of a card.',
  },
  All: {
    icon: '🌍',
    ar: 'الصفحة الرئيسية',
    en: 'Landing page',
    subAr: 'عدّل نصوص وهوية صفحة الموقع الرئيسية',
    subEn: 'Edit the marketing landing page copy',
  },
} as const

/** The lists of one-line strings, edited as rows in both languages at once. */
type StrList = 'compareOld' | 'compareNew' | 'audience' | 'pricingIncluded'

/**
 * One icon: a file you upload, or a character you type.
 *
 * The uploaded one wins whenever it is there, so the typed character is the
 * fallback rather than a competing setting — and clearing the upload brings it
 * straight back without anything to retype.
 *
 * Both are shared between the two languages on purpose. A picture doesn't get
 * translated, and a copy per locale means setting it twice and watching the
 * Arabic and English pages drift apart.
 */
function IconInput({
  label,
  value,
  url,
  onChange,
  onUrl,
}: {
  label: string
  value: string
  url?: string
  onChange: (v: string) => void
  onUrl: (v: string) => void
}) {
  const { t } = useDashLang()
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="lbl" style={{ display: 'block' }}>{label}</label>
      <div className="icon-picker">
        <MediaUploader
          compact
          accept="image/*"
          previewUrl={url || null}
          onUploaded={(m) => onUrl(m.thumbUrl || m.url || '')}
          onRemove={url ? () => onUrl('') : undefined}
        />
        <div className="icon-alt">
          <span className="icon-alt-note">
            {url
              ? t('الصورة المرفوعة هي الظاهرة', 'The uploaded image is what shows')
              : t('أو اكتب رمزاً', 'Or type a character')}
          </span>
          <input
            className="field icon-field"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={8}
            disabled={Boolean(url)}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * A list of one-line strings, in both languages — the two sides of the
 * comparison, the audience chips, and anything else shaped like them. Rows are
 * added and removed in both languages together, so the two never end up with
 * a different number of lines writing into each other.
 */
function ListField({
  label,
  ar,
  en,
  onAr,
  onEn,
  onAdd,
  onRemove,
}: {
  label: string
  ar: string[]
  en: string[]
  onAr: (i: number, v: string) => void
  onEn: (i: number, v: string) => void
  onAdd?: () => void
  onRemove?: (i: number) => void
}) {
  const { t } = useDashLang()
  return (
    <div style={{ marginBottom: 18 }}>
      <label className="lbl" style={{ display: 'block', marginBottom: 8 }}>{label}</label>
      {ar.map((_, i) => (
        <div
          className="grid-2"
          key={i}
          style={{ marginBottom: 8, ...(onRemove ? { gridTemplateColumns: '1fr 1fr auto', gap: 10 } : {}) }}
        >
          <input className="field" value={ar[i] ?? ''} onChange={(e) => onAr(i, e.target.value)} />
          <input className="field" dir="ltr" value={en[i] ?? ''} onChange={(e) => onEn(i, e.target.value)} style={{ textAlign: 'start' }} />
          {onRemove && (
            <button className="btn btn-sm" onClick={() => onRemove(i)}>✕</button>
          )}
        </div>
      ))}
      {onAdd && (
        <button className="btn btn-sm" onClick={onAdd}>
          + {t('سطر', 'Line')}
        </button>
      )}
    </div>
  )
}

/* Bilingual text field (AR + EN side by side). */
function Field({
  label,
  ar,
  en,
  onAr,
  onEn,
  multiline,
  rows,
}: {
  label: string
  ar: string
  en: string
  onAr: (v: string) => void
  onEn: (v: string) => void
  multiline?: boolean
  rows?: number
}) {
  const { t } = useDashLang()
  const C = (multiline ? 'textarea' : 'input') as 'input'
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="lbl" style={{ display: 'block' }}>{label}</label>
      <div className="grid-2">
        <C className="field" placeholder={t('عربي', 'Arabic')} value={ar} onChange={(e) => onAr(e.target.value)} {...(multiline ? { rows: rows ?? 2 } : {})} />
        <C className="field" dir="ltr" placeholder="English" value={en} onChange={(e) => onEn(e.target.value)} style={{ textAlign: 'start' }} {...(multiline ? { rows: rows ?? 2 } : {})} />
      </div>
    </div>
  )
}

/** A grey sentence explaining the control above or below it. */
function Note({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p className="icon-alt-note" style={{ margin: '0 0 14px', ...style }}>
      {children}
    </p>
  )
}

/** A titled box grouping the fields of one card, plan or column. */
function Card({ title, action, children }: { title: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mod-card">
      <div className="mod-card-head">
        <span />
        <strong style={{ color: 'var(--sub)' }}>{title}</strong>
        {action}
      </div>
      {children}
    </div>
  )
}

/**
 * Where one button goes.
 *
 * Left empty it follows the shared start link, so the page keeps its single
 * address by default and only the buttons that should differ carry one of
 * their own. The two shortcuts are the two answers that are actually typed
 * here — a WhatsApp number, and one of the portfolios on the site.
 */
function LinkField({
  label,
  value,
  onChange,
  tenants,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  tenants: { slug: string; name: string }[]
  hint?: string
}) {
  const { t } = useDashLang()
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="lbl" style={{ display: 'block' }}>{label}</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
        <input
          className="field"
          dir="ltr"
          style={{ textAlign: 'start' }}
          placeholder={t('فاضي = رابط «ابدأ» الموحّد', 'Empty = the shared start link')}
          title={t(
            'رقم واتساب، أو لينك كامل، أو مسار جوّه الموقع زي /kamal',
            'A WhatsApp number, a full link, or a path on this site like /kamal',
          )}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          className="btn btn-sm"
          onClick={() => onChange('https://wa.me/20')}
          title={t(
            'الرقم لازم يكون بكود الدولة من غير الصفر — 201001234567 مش 01001234567.',
            'The number needs its country code and no leading zero — 201001234567, not 01001234567.',
          )}
        >
          {t('واتساب', 'WhatsApp')}
        </button>
        <select
          className="field"
          style={{ width: 'auto' }}
          value=""
          onChange={(e) => e.target.value && onChange(e.target.value)}
        >
          <option value="">{t('بورتفوليو…', 'Portfolio…')}</option>
          {tenants.map((tn) => (
            <option key={tn.slug} value={`/${tn.slug}`}>
              {tn.name} /{tn.slug}
            </option>
          ))}
        </select>
      </div>
      {hint && <Note style={{ margin: '6px 0 0' }}>{hint}</Note>}
    </div>
  )
}

export default function LandingEditor({
  initial,
  groups,
  title,
  subtitle,
}: {
  initial: Form
  /** Which of the three groups this page shows. All of them when omitted. */
  groups?: readonly string[]
  title?: string
  subtitle?: string
}) {
  const shown = groups ? SECTION_GROUPS.filter((g) => groups.includes(g.en)) : SECTION_GROUPS
  /* Each group is its own page now, so the heading says which one you are on
     rather than naming the whole editor three times over. */
  const head = HEADINGS[(groups?.length === 1 ? groups[0] : '') as keyof typeof HEADINGS] ?? HEADINGS.All
  const [f, setF] = useState<Form>(initial)
  const [sec, setSec] = useState<SectionId>(shown[0]?.items[0]?.id ?? 'hero')
  /* Which part of the section is open. One at a time: a section used to be
     every one of its fields and cards stacked in a column, and changing the
     fourth card meant scrolling past the first three to find it. */
  const [pane, setPane] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [version, setVersion] = useState(0)
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initial))
  const dirty = useMemo(() => JSON.stringify(f) !== savedJson, [f, savedJson])
  const [busy, setBusy] = useState(false)
  const [light, setLight] = useState(false)
  const [toast, setToast] = useState(false)
  const { t } = useDashLang()

  // Deep-ish setters over the two locale copies.
  const setTheme = (p: Partial<LandingTheme>) => setF((f0) => ({ ...f0, theme: { ...f0.theme, ...p } }))
  const setImages = (p: Partial<LandingImages>) => setF((f0) => ({ ...f0, images: { ...f0.images, ...p } }))
  const setSectionBg = (rows: SectionBgForm[]) => setF((f0) => ({ ...f0, sectionBg: rows }))
  const moveBand = (i: number, dir: -1 | 1) =>
    setF((f0) => {
      const j = i + dir
      if (j < 0 || j >= f0.order.length) return f0
      const next = [...f0.order]
      ;[next[i], next[j]] = [next[j], next[i]]
      return { ...f0, order: next }
    })
  const toggleBand = (i: number) =>
    setF((f0) => ({
      ...f0,
      order: f0.order.map((b, j) => (j === i ? { ...b, on: !b.on } : b)),
    }))
  const setStyle = (p: Partial<LandingStyle>) => setF((f0) => ({ ...f0, style: { ...f0.style, ...p } }))
  const setTools = (p: Partial<LandingTools>) => setF((f0) => ({ ...f0, tools: { ...f0.tools, ...p } }))
  // Which half of the palette the Colours tab is editing.
  const k = light
    ? { accent: 'accentLight', bg: 'bgLight', bg2: 'bg2Light', text: 'textLight', sub: 'subtextLight' }
    : { accent: 'accent', bg: 'bg', bg2: 'bg2', text: 'text', sub: 'subtext' }
  const tv = (key: string) => (f.theme as unknown as Record<string, string>)[key] || ''
  const setKey = (key: keyof Copy, v: string, loc: 'ar' | 'en') =>
    setF((p) => ({ ...p, [loc]: { ...p[loc], [key]: v } }))
  // For what is not translated — an address, a picture — one edit, both copies.
  const setKeyBoth = (key: keyof Copy, v: string | string[] | number) =>
    setF((p) => ({ ...p, ar: { ...p.ar, [key]: v }, en: { ...p.en, [key]: v } }))
  const setNav = (key: keyof Copy['nav'], v: string, loc: 'ar' | 'en') =>
    setF((p) => ({ ...p, [loc]: { ...p[loc], nav: { ...p[loc].nav, [key]: v } } }))
  /* Plans. The words are per language; whether a plan is highlighted and what
     colour it wears are not, so those two are written to both at once. */
  const setPlan = (
    i: number,
    field: 'name' | 'badge' | 'price' | 'per' | 'note' | 'cta',
    v: string,
    loc: 'ar' | 'en',
  ) =>
    setF((p) => ({
      ...p,
      [loc]: { ...p[loc], plans: p[loc].plans.map((x, j) => (j === i ? { ...x, [field]: v } : x)) },
    }))
  const setPlanBoth = (i: number, field: 'hi' | 'color' | 'url', v: boolean | string) =>
    setF((p) => {
      const patch = (loc: 'ar' | 'en') =>
        p[loc].plans.map((x, j) => (j === i ? { ...x, [field]: v } : x))
      return { ...p, ar: { ...p.ar, plans: patch('ar') }, en: { ...p.en, plans: patch('en') } }
    })
  const setFeat = (i: number, j: number, v: string, loc: 'ar' | 'en') =>
    setF((p) => ({
      ...p,
      [loc]: {
        ...p[loc],
        plans: p[loc].plans.map((x, k) =>
          k === i ? { ...x, feats: x.feats.map((ft, m) => (m === j ? v : ft)) } : x,
        ),
      },
    }))
  const addFeat = (i: number) =>
    setF((p) => {
      const patch = (loc: 'ar' | 'en') =>
        p[loc].plans.map((x, k) => (k === i ? { ...x, feats: [...x.feats, ''] } : x))
      return { ...p, ar: { ...p.ar, plans: patch('ar') }, en: { ...p.en, plans: patch('en') } }
    })
  const removeFeat = (i: number, j: number) =>
    setF((p) => {
      const patch = (loc: 'ar' | 'en') =>
        p[loc].plans.map((x, k) => (k === i ? { ...x, feats: x.feats.filter((_, m) => m !== j) } : x))
      return { ...p, ar: { ...p.ar, plans: patch('ar') }, en: { ...p.en, plans: patch('en') } }
    })
  /* Footer link groups. Both languages are kept in step by index — the same
     link written twice, not two different footers. */
  const setGroupTitle = (g: number, v: string, loc: 'ar' | 'en') =>
    setF((p) => ({
      ...p,
      [loc]: {
        ...p[loc],
        footerGroups: p[loc].footerGroups.map((x, i) => (i === g ? { ...x, title: v } : x)),
      },
    }))
  const setGroupLink = (g: number, i: number, field: 'label' | 'url', v: string, loc: 'ar' | 'en') =>
    setF((p) => ({
      ...p,
      [loc]: {
        ...p[loc],
        footerGroups: p[loc].footerGroups.map((x, j) =>
          j === g
            ? { ...x, links: x.links.map((l, k) => (k === i ? { ...l, [field]: v } : l)) }
            : x,
        ),
      },
    }))
  /* Adding and removing touch both languages at once, so the two never end up
     with a different number of rows and start writing into each other. */
  const bothGroups = (fn: (groups: Form['ar']['footerGroups']) => Form['ar']['footerGroups']) =>
    setF((p) => ({
      ...p,
      ar: { ...p.ar, footerGroups: fn(p.ar.footerGroups) },
      en: { ...p.en, footerGroups: fn(p.en.footerGroups) },
    }))
  const addGroup = () => bothGroups((g) => [...g, { title: '', links: [{ label: '', url: '' }] }])
  const removeGroup = (g: number) => bothGroups((gs) => gs.filter((_, i) => i !== g))
  const addGroupLink = (g: number) =>
    bothGroups((gs) => gs.map((x, i) => (i === g ? { ...x, links: [...x.links, { label: '', url: '' }] } : x)))
  const removeGroupLink = (g: number, i: number) =>
    bothGroups((gs) => gs.map((x, j) => (j === g ? { ...x, links: x.links.filter((_, k) => k !== i) } : x)))

  // The two headline dials are numbers, and each language keeps its own.
  const setNum = (key: 'heroScale' | 'heroLeading', v: number, loc: 'ar' | 'en') =>
    setF((p) => ({ ...p, [loc]: { ...p[loc], [key]: v } }))

  const setMetric = (key: keyof Copy['metricsLabels'], v: string, loc: 'ar' | 'en') =>
    setF((p) => ({ ...p, [loc]: { ...p[loc], metricsLabels: { ...p[loc].metricsLabels, [key]: v } } }))
  const setMockName = (v: string, loc: 'ar' | 'en') =>
    setF((p) => ({ ...p, [loc]: { ...p[loc], mock: { ...p[loc].mock, panel: v } } }))
  const setMockList = (key: 'items' | 'circles' | 'cards', i: number, v: string, loc: 'ar' | 'en') =>
    setF((p) => ({
      ...p,
      [loc]: {
        ...p[loc],
        mock: { ...p[loc].mock, [key]: p[loc].mock[key].map((x, j) => (j === i ? v : x)) },
      },
    }))
  type RowList = 'features' | 'faqs' | 'how' | 'testimonials' | 'dash'
  const setArr = (arr: RowList, i: number, field: string, v: string, loc: 'ar' | 'en') =>
    setF((p) => ({
      ...p,
      [loc]: {
        ...p[loc],
        [arr]: (p[loc][arr] as unknown as Record<string, string>[]).map((x, j) => (j === i ? { ...x, [field]: v } : x)),
      },
    }))

  // Icons, step markers, faces and links aren't translated, so one edit lands in both copies.
  const setArrBoth = (arr: RowList, i: number, field: string, v: string) =>
    setF((p) => {
      const patch = (loc: 'ar' | 'en') =>
        (p[loc][arr] as unknown as Record<string, string>[]).map((x, j) => (j === i ? { ...x, [field]: v } : x))
      return { ...p, ar: { ...p.ar, [arr]: patch('ar') }, en: { ...p.en, [arr]: patch('en') } }
    })
  // String lists: one line at an index, and whole lines added or removed in both.
  const setList = (key: StrList, i: number, v: string, loc: 'ar' | 'en') =>
    setF((p) => ({
      ...p,
      [loc]: { ...p[loc], [key]: p[loc][key].map((x, j) => (j === i ? v : x)) },
    }))
  const addListItem = (key: StrList) =>
    setF((p) => ({ ...p, ar: { ...p.ar, [key]: [...p.ar[key], ''] }, en: { ...p.en, [key]: [...p.en[key], ''] } }))
  const removeListItem = (key: StrList, i: number) =>
    setF((p) => ({
      ...p,
      ar: { ...p.ar, [key]: p.ar[key].filter((_, j) => j !== i) },
      en: { ...p.en, [key]: p.en[key].filter((_, j) => j !== i) },
    }))
  const list = (key: StrList, label: string) => (
    <ListField
      label={label}
      ar={f.ar[key]}
      en={f.en[key]}
      onAr={(i, v) => setList(key, i, v, 'ar')}
      onEn={(i, v) => setList(key, i, v, 'en')}
      onAdd={() => addListItem(key)}
      onRemove={(i) => removeListItem(key, i)}
    />
  )

  const setLegal = (i: number, field: 'title' | 'body', v: string, loc: 'ar' | 'en') =>
    setF((p) => ({
      ...p,
      [loc]: { ...p[loc], legal: p[loc].legal.map((x, j) => (j === i ? { ...x, [field]: v } : x)) },
    }))

  const toggleHidden = (slug: string, show: boolean) => {
    const now = f.ar.showcaseHidden ?? []
    setKeyBoth('showcaseHidden', show ? now.filter((s) => s !== slug) : [...now, slug])
  }

  const link = (key: keyof Copy, label: string, hint?: string) => (
    <LinkField
      label={label}
      value={String(f.ar[key] ?? '')}
      onChange={(v) => setKeyBoth(key, v)}
      tenants={f.tenants}
      hint={hint}
    />
  )

  const scalar = (key: keyof Copy, label: string, multiline?: boolean) => (
    <Field
      label={label}
      ar={String(f.ar[key] ?? '')}
      en={String(f.en[key] ?? '')}
      onAr={(v) => setKey(key, v, 'ar')}
      onEn={(v) => setKey(key, v, 'en')}
      multiline={multiline}
    />
  )

  /* ── Items: added, moved, copied and removed in both languages at once, so
     the Arabic and English lists never drift out of step by index. ───────── */
  const mutateBoth = (key: ItemKey, fn: (arr: unknown[]) => unknown[]) =>
    setF((p) => ({
      ...p,
      ar: { ...p.ar, [key]: fn(p.ar[key] as unknown[]) },
      en: { ...p.en, [key]: fn(p.en[key] as unknown[]) },
    }))
  const blankItem = (key: ItemKey, len: number): unknown => {
    switch (key) {
      case 'features':
        return { icon: '✨', iconUrl: '', bgUrl: '', t: '', d: '' }
      case 'how':
        return { n: String(len + 1), iconUrl: '', t: '', d: '' }
      case 'faqs':
        return { q: '', a: '' }
      case 'testimonials':
        return { name: '', role: '', quote: '', photoUrl: '', url: '' }
      case 'dash':
        return { t: '', d: '', imageUrl: '', videoUrl: '', poster: '' }
      case 'plans':
        return { name: '', badge: '', price: '', per: '', note: '', feats: [''], cta: '', url: '', hi: false, color: '' }
    }
  }
  const addItem = (key: ItemKey) => {
    const len = (f.ar[key] as unknown[]).length
    mutateBoth(key, (arr) => [...arr, blankItem(key, len)])
    setPane(`${key}:${len}`)
  }
  const moveItem = (key: ItemKey, i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= (f.ar[key] as unknown[]).length) return
    mutateBoth(key, (arr) => {
      const next = [...arr]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
    // The selection follows the item, not the slot it left.
    setPane(`${key}:${j}`)
  }
  const copyItem = (key: ItemKey, i: number) => {
    mutateBoth(key, (arr) => [...arr.slice(0, i + 1), JSON.parse(JSON.stringify(arr[i])), ...arr.slice(i + 1)])
    setPane(`${key}:${i + 1}`)
  }
  const removeItem = (key: ItemKey, i: number, noun: string) => {
    if (!confirm(t(`حذف ${noun} ده؟`, `Remove this ${noun}?`))) return
    const len = (f.ar[key] as unknown[]).length
    mutateBoth(key, (arr) => arr.filter((_, j) => j !== i))
    setPane(len > 1 ? `${key}:${Math.max(0, i - 1)}` : '')
  }

  /* ── Each content section as a short list of what it holds. ──────────── */
  const headPane: Pane = { id: 'head', label: t('عنوان القسم', 'Section heading'), mark: 'Aa' }
  const items = (
    key: ItemKey,
    label: (i: number) => string | undefined,
    mark?: (i: number) => string | undefined,
  ): Pane[] =>
    (f.ar[key] as unknown[]).map((_, i) => ({
      id: `${key}:${i}`,
      label: (label(i) ?? '').trim() || `#${i + 1}`,
      mark: mark?.(i),
      item: { key, i },
    }))

  const outlines: Partial<Record<SectionId, Outline>> = {
    hero: {
      before: [
        { id: 'text', label: t('النصوص', 'The words'), mark: 'Aa' },
        { id: 'size', label: t('حجم العنوان وتباعده', 'Headline size and spacing'), mark: '↕' },
        { id: 'buttons', label: t('الأزرار', 'The buttons'), mark: '▭' },
      ],
    },
    compare: {
      before: [
        headPane,
        { id: 'old', label: f.ar.compareOldTitle || t('العمود الأحمر', 'The red column'), mark: '✕' },
        { id: 'new', label: f.ar.compareNewTitle || t('عمود ViralPX', 'The ViralPX column'), mark: '✓' },
        { id: 'link', label: t('الرابط تحت الكروت', 'The link under the cards'), mark: '↗' },
      ],
    },
    panel: {
      before: [
        headPane,
        { id: 'video', label: t('الفيديو والغلاف', 'Video and poster'), mark: '▶' },
        { id: 'button', label: t('الزر تحت الفيديو', 'The button under it'), mark: '▭' },
        { id: 'mock', label: t('الرسمة الافتراضية', 'The default drawing'), mark: '▦' },
      ],
    },
    features: {
      before: [headPane],
      items: {
        key: 'features',
        panes: items('features', (i) => f.ar.features[i]?.t, (i) => (f.ar.features[i]?.iconUrl ? '🖼' : f.ar.features[i]?.icon)),
        add: t('ميزة جديدة', 'Add a feature'),
        noun: t('الكارت', 'card'),
      },
    },
    dash: {
      before: [headPane, { id: 'frame', label: t('إطار الصورة', 'The picture frame'), mark: '▣' }],
      items: {
        key: 'dash',
        panes: items('dash', (i) => f.ar.dash[i]?.t, (i) => (f.ar.dash[i]?.videoUrl ? '▶' : f.ar.dash[i]?.imageUrl ? '🖼' : '·')),
        add: t('سطر جديد', 'Add a line'),
        noun: t('السطر', 'line'),
      },
    },
    audience: {
      before: [headPane, { id: 'list', label: t('التخصصات', 'Who it is for'), mark: '☰' }],
    },
    how: {
      before: [headPane],
      items: {
        key: 'how',
        panes: items('how', (i) => f.ar.how[i]?.t, (i) => (f.ar.how[i]?.iconUrl ? '🖼' : f.ar.how[i]?.n)),
        add: t('خطوة جديدة', 'Add a step'),
        noun: t('الخطوة', 'step'),
      },
      after: [{ id: 'button', label: t('الزر تحت الخطوات', 'The button under them'), mark: '▭' }],
    },
    showcase: {
      before: [
        headPane,
        { id: 'sites', label: t('البورتفوليوهات اللي بتظهر', 'Which portfolios show'), mark: '☑' },
        { id: 'metrics', label: t('شريط الأرقام', 'The numbers bar'), mark: '#' },
      ],
    },
    pricing: {
      before: [headPane],
      items: {
        key: 'plans',
        panes: items('plans', (i) => f.ar.plans[i]?.name, (i) => (f.ar.plans[i]?.hi ? '★' : '$')),
        add: t('خطة جديدة', 'Add a plan'),
        noun: t('الخطة', 'plan'),
      },
      after: [{ id: 'included', label: t('الشريط تحت الكروت', 'The band under the cards'), mark: '☰' }],
    },
    testimonials: {
      before: [headPane],
      items: {
        key: 'testimonials',
        panes: items('testimonials', (i) => f.ar.testimonials[i]?.name, () => '❝'),
        add: t('رأي جديد', 'Add a testimonial'),
        noun: t('الرأي', 'testimonial'),
      },
    },
    faq: {
      before: [headPane],
      items: {
        key: 'faqs',
        panes: items('faqs', (i) => f.ar.faqs[i]?.q, () => '?'),
        add: t('سؤال جديد', 'Add a question'),
        noun: t('السؤال', 'question'),
      },
    },
  }

  const outline = outlines[sec]
  const panes: Pane[] = outline
    ? [...outline.before, ...(outline.items?.panes ?? []), ...(outline.after ?? [])]
    : []
  // The open part, or the first one when what was open has gone (a removed item).
  const current = panes.find((p) => p.id === pane) ?? panes[0]
  const cur = current?.id ?? ''
  const at = current?.item?.i ?? -1

  const secLabel = (() => {
    for (const g of SECTION_GROUPS) for (const it of g.items) if (it.id === sec) return t(it.ar, it.en)
    return ''
  })()

  const row = (p: Pane) => (
    <button
      key={p.id}
      className={`lx-row${p.id === cur ? ' on' : ''}${p.item ? ' is-item' : ''}`}
      onClick={() => setPane(p.id)}
    >
      <span className="lx-mark">{p.mark || '·'}</span>
      <span className="lx-label">{p.label}</span>
    </button>
  )

  const openSection = (id: SectionId) => {
    setSec(id)
    setPane('')
  }

  /* The preview is opened on a wide screen and left for the reader to open on
     a narrower one, where it would take the room the fields need. */
  useEffect(() => {
    setShowPreview(window.matchMedia('(min-width: 1500px)').matches)
  }, [])

  async function save() {
    if (busy) return
    setBusy(true)
    await saveLanding(f.ar, f.en, f.theme, f.images, f.sectionBg, f.style, f.tools, f.order)
    setBusy(false)
    setSavedJson(JSON.stringify(f))
    setVersion((v) => v + 1)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
  }

  /* ⌘S / Ctrl+S saves, and leaving with unsaved edits asks first — the three
     pages share one form, and the sidebar is a link that reloads. */
  const saveRef = React.useRef(save)
  saveRef.current = save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void saveRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    if (!dirty) return
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [dirty])

  return (
    <div>
      <PageHeader
        icon={head.icon}
        title={title ?? t(head.ar, head.en)}
        subtitle={subtitle ?? t(head.subAr, head.subEn)}
        actions={
          <div className="lx-save">
            {dirty && <span className="lx-dirty">{t('تعديلات مش محفوظة', 'Unsaved changes')}</span>}
            <button className="btn btn-primary" onClick={save} disabled={busy || !dirty} title="⌘S">
              {busy ? '…' : dirty ? t('💾 حفظ', '💾 Save') : t('✓ محفوظ', '✓ Saved')}
            </button>
          </div>
        }
      />

      {/* A row across the top rather than a second sidebar down the side. Two
          columns of navigation for one page read as a maze; the group is the
          page you are on now, so all that is left to choose is the section —
          one line of it, in the order the page itself runs. */}
      <div className="lp-editor">
        <nav className="lp-tabs">
          {shown.map((g) =>
            g.items.map((s) => (
              <button
                key={s.id}
                className={`lp-tab ${sec === s.id ? 'active' : ''}`}
                onClick={() => openSection(s.id)}
              >
                {t(s.ar, s.en)}
              </button>
            )),
          )}
        </nav>

        {/* The section as a short list, the one part of it that is open, and
            the page it ends up on. What used to be a column of every field and
            every card is now three things side by side, none of them long. */}
        <div className={`lx${outline ? '' : ' lx-flat'}${showPreview ? ' lx-with-pv' : ''}`}>
          {outline && (
            <aside className="lx-outline">
              {outline.before.map(row)}
              {outline.items && (
                <div className="lx-items">
                  <div className="lx-items-title">
                    {t('العناصر', 'Items')} <span>{outline.items.panes.length}</span>
                  </div>
                  {outline.items.panes.map(row)}
                  <button className="lx-add" onClick={() => addItem(outline.items!.key)}>
                    + {outline.items.add}
                  </button>
                </div>
              )}
              {outline.after?.map(row)}
            </aside>
          )}

          <section className="lx-editor">
            <header className="lx-head">
              <div className="lx-head-title">
                {current && <span>{secLabel}</span>}
                <strong>{current?.label ?? secLabel}</strong>
              </div>
              <div className="lx-head-actions">
                {current?.item && outline?.items && (
                  <>
                    <button className="lx-icon" title={t('لفوق', 'Move up')} disabled={at === 0} onClick={() => moveItem(current.item!.key, at, -1)}>
                      ▲
                    </button>
                    <button
                      className="lx-icon"
                      title={t('لتحت', 'Move down')}
                      disabled={at === outline.items.panes.length - 1}
                      onClick={() => moveItem(current.item!.key, at, 1)}
                    >
                      ▼
                    </button>
                    <button className="lx-icon" title={t('نسخة منه', 'Duplicate')} onClick={() => copyItem(current.item!.key, at)}>
                      ⧉
                    </button>
                    <button
                      className="lx-icon danger"
                      title={t('حذف', 'Remove')}
                      onClick={() => removeItem(current.item!.key, at, outline.items!.noun)}
                    >
                      🗑
                    </button>
                  </>
                )}
                {!showPreview && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowPreview(true)}>
                    👁 {t('معاينة', 'Preview')}
                  </button>
                )}
              </div>
            </header>

            <div className="panel lx-body">
        {sec === 'header' && (
          <>
            <Field label={t('رابط: المميزات', 'Nav: Features')} ar={f.ar.nav.features} en={f.en.nav.features} onAr={(v) => setNav('features', v, 'ar')} onEn={(v) => setNav('features', v, 'en')} />
            <Field label={t('رابط: الطريقة', 'Nav: How')} ar={f.ar.nav.how} en={f.en.nav.how} onAr={(v) => setNav('how', v, 'ar')} onEn={(v) => setNav('how', v, 'en')} />
            <Field label={t('رابط: أمثلة', 'Nav: Showcase')} ar={f.ar.nav.showcase} en={f.en.nav.showcase} onAr={(v) => setNav('showcase', v, 'ar')} onEn={(v) => setNav('showcase', v, 'en')} />
            <Field label={t('رابط: الأسعار', 'Nav: Pricing')} ar={f.ar.nav.pricing} en={f.en.nav.pricing} onAr={(v) => setNav('pricing', v, 'ar')} onEn={(v) => setNav('pricing', v, 'en')} />
            <Field label={t('رابط: المقارنة', 'Nav: Comparison')} ar={f.ar.nav.compare} en={f.en.nav.compare} onAr={(v) => setNav('compare', v, 'ar')} onEn={(v) => setNav('compare', v, 'en')} />
            <Field label={t('رابط: الأسئلة', 'Nav: FAQ')} ar={f.ar.nav.faq} en={f.en.nav.faq} onAr={(v) => setNav('faq', v, 'ar')} onEn={(v) => setNav('faq', v, 'en')} />
            {scalar('tagline', t('السطر تحت الاسم', 'Line under the wordmark'))}
            {scalar('login', t('زر الدخول', 'Login button'))}
            {scalar('cta', t('زر ابدأ', 'Start button'))}

            <LinkField
              label={t('رابط أزرار «ابدأ» الموحّد', 'The shared "start" button link')}
              value={f.ar.ctaUrl}
              onChange={(v) => setKeyBoth('ctaUrl', v)}
              tenants={f.tenants}
              hint={t(
                'كل زرار مالهوش لينك خاص بيروح هنا: زرار الشريط، والقسم الرئيسي، والفيديو، والخطوات، والأسعار، وآخر الصفحة. وأي زرار فيهم تقدر تديله لينك لوحده من تبويب قسمه. لو التسجيل لسه مش متاح، حط لينك واتساب.',
                'Every button without a link of its own comes here: the nav, hero, video, steps, pricing and closing buttons. Any one of them can be given its own address from its section tab. Until sign-up is open, point it at WhatsApp.',
              )}
            />
          </>
        )}

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        {sec === 'hero' && cur === 'text' && (
          <>
            {scalar('heroEyebrow', t('البادج', 'Badge'))}
            {scalar('heroTitle', t('العنوان', 'Title'), true)}
            {scalar('heroTitleAccent', t('الكلمة المميّزة', 'Accent word'), true)}
            <label className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '-2px 0 12px' }}>
              <input
                type="checkbox"
                checked={f.ar.heroTitleBreak !== false}
                onChange={(e) =>
                  setF((p) => ({
                    ...p,
                    ar: { ...p.ar, heroTitleBreak: e.target.checked },
                    en: { ...p.en, heroTitleBreak: e.target.checked },
                  }))
                }
              />
              {t('الكلمة المميّزة في سطر لوحدها', 'Accent word on its own line')}
            </label>
            <Note style={{ margin: '-4px 0 14px' }}>
              {t(
                'اضغط Enter جوّه العنوان عشان تنزل سطر في المكان اللي انت عايزه. من غير Enter الصفحة بتلف السطور لوحدها.',
                'Press Enter inside a heading to break the line where you want it. Without one, the page wraps on its own.',
              )}
            </Note>
            {scalar('heroSub', t('الوصف', 'Subtitle'), true)}
            {scalar('heroNote', t('السطر الصغير تحت الأزرار', 'Small line under the buttons'))}
          </>
        )}

        {sec === 'hero' && cur === 'size' && (
          <div className="grid-2">
            {(['ar', 'en'] as const).map((loc) => (
              <div key={loc}>
                <div className="lbl" style={{ marginBottom: 6 }}>
                  {loc === 'ar' ? t('حجم العنوان (عربي)', 'Title size (Arabic)') : t('حجم العنوان (إنجليزي)', 'Title size (English)')}: {f[loc].heroScale ?? 100}%
                </div>
                <input type="range" min={60} max={150} step={5} value={f[loc].heroScale ?? 100} onChange={(e) => setNum('heroScale', Number(e.target.value), loc)} style={{ width: '100%' }} />

                <div className="lbl" style={{ margin: '14px 0 6px' }}>
                  {loc === 'ar' ? t('تباعد السطور (عربي)', 'Line spacing (Arabic)') : t('تباعد السطور (إنجليزي)', 'Line spacing (English)')}: {f[loc].heroLeading ?? 100}%
                </div>
                <input type="range" min={70} max={160} step={5} value={f[loc].heroLeading ?? 100} onChange={(e) => setNum('heroLeading', Number(e.target.value), loc)} style={{ width: '100%' }} />
              </div>
            ))}
          </div>
        )}

        {sec === 'hero' && cur === 'buttons' && (
          <>
            {scalar('heroBtn1', t('الزر الأساسي', 'Main button'))}
            {link('heroBtn1Url', t('رابط الزر الأساسي', 'Main button link'))}
            <div className="lx-sep" />
            {scalar('heroBtn2', t('الزر الثانوي', 'Second button'))}
            {link(
              'heroBtn2Url',
              t('رابط الزر الثانوي', 'Second button link'),
              t(
                'سيبه فاضي عشان يفتح أول بورتفوليو في قسم الأمثلة لوحده.',
                'Leave it empty and it opens the first portfolio in the showcase on its own.',
              ),
            )}
          </>
        )}

        {/* ── Comparison ───────────────────────────────────────────────── */}
        {sec === 'compare' && cur === 'head' && (
          <>
            {scalar('compareEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('compareTitle', t('عنوان القسم', 'Section title'), true)}
            {scalar('compareSub', t('الوصف', 'Description'), true)}
          </>
        )}
        {sec === 'compare' && cur === 'old' && (
          <>
            {scalar('compareOldTitle', t('عنوان العمود', 'Column title'))}
            {list('compareOld', t('النقاط', 'Points'))}
          </>
        )}
        {sec === 'compare' && cur === 'new' && (
          <>
            {scalar('compareNewTitle', t('عنوان العمود', 'Column title'))}
            {list('compareNew', t('النقاط', 'Points'))}
          </>
        )}
        {sec === 'compare' && cur === 'link' && (
          <>
            {scalar('compareLink', t('نص الرابط', 'Link text'))}
            {link('compareLinkUrl', t('وجهة الرابط', 'Where it goes'))}
          </>
        )}

        {/* ── Explainer video ──────────────────────────────────────────── */}
        {sec === 'panel' && cur === 'head' && (
          <>
            {scalar('panelEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('panelHeading', t('عنوان القسم', 'Section title'), true)}
            {scalar('panelSub', t('الوصف', 'Description'), true)}
            {scalar('panelTitle', t('عنوان شريط الإطار', 'Frame bar title'))}
          </>
        )}
        {sec === 'panel' && cur === 'video' && (
          <>
            <Note>
              {t(
                'الفيديو مش بيشتغل لوحده — الزائر بيشوف صورة الغلاف وزرار تشغيل، والفيديو بيتحمّل بس لما يدوس. الأفضل ترفعه على يوتيوب (Unlisted) وتحط اللينك، عشان الجودة بتتظبط على سرعة نت الزائر.',
                'The video never plays on its own — visitors see the poster and a play button, and the player loads only when they press it. YouTube (Unlisted) is the better host: it adapts the quality to the visitor’s connection.',
              )}
            </Note>
            <Field
              label={t('لينك الفيديو (يوتيوب / فيميو)', 'Video link (YouTube / Vimeo)')}
              ar={f.ar.panelVideo}
              en={f.en.panelVideo}
              onAr={(v) => setKey('panelVideo', v, 'ar')}
              onEn={(v) => setKey('panelVideo', v, 'en')}
            />
            <Note style={{ margin: '-4px 0 16px' }}>
              {t(
                'لكل لغة لينك لوحدها، عشان الترجمة محروقة على الفيديو. لو لغة لينكها فاضي، بيظهر فيها الملف المرفوع تحت — أو الرسمة لو مفيش.',
                'One link per language, because the subtitles are burned in. A language with no link shows the uploaded file below — or the drawing if there is none.',
              )}
            </Note>
            <Field
              label={t('مدة الفيديو (زي 1:30)', 'Running time (like 1:30)')}
              ar={f.ar.panelDuration}
              en={f.en.panelDuration}
              onAr={(v) => setKey('panelDuration', v, 'ar')}
              onEn={(v) => setKey('panelDuration', v, 'en')}
            />

            <div className="grid-2 lx-media">
              <div>
                <label className="lbl" style={{ display: 'block' }}>
                  {t('أو ارفع ملف (فيديو أو صورة)', 'Or upload a file (video or image)')}
                </label>
                <MediaUploader
                  big
                  accept="image/*,video/*"
                  aspect="16 / 10"
                  previewUrl={f.images.panelUrl}
                  onUploaded={(m) =>
                    setImages({
                      panelId: m.id,
                      panelUrl: m.url ?? m.thumbUrl,
                      panelKind: m.mimeType?.startsWith('video/') ? 'video' : 'image',
                    })
                  }
                  onRemove={
                    f.images.panelUrl
                      ? () => setImages({ panelId: null, panelUrl: null, panelKind: null })
                      : undefined
                  }
                />
              </div>
              <div>
                <label className="lbl" style={{ display: 'block' }}>
                  {t('صورة الغلاف', 'Poster image')}
                </label>
                <MediaUploader
                  big
                  accept="image/*"
                  aspect="16 / 10"
                  previewUrl={f.ar.panelPoster || null}
                  onUploaded={(m) => setKeyBoth('panelPoster', m.url ?? m.thumbUrl ?? '')}
                  onRemove={f.ar.panelPoster ? () => setKeyBoth('panelPoster', '') : undefined}
                />
                <Note style={{ margin: '8px 0 0' }}>
                  {t(
                    'لقطة من موقع حقيقي جاهز، مش لوحة تحكم فاضية. من غيرها: يوتيوب بياخد صورته، والملف بيعرض أول لقطة منه.',
                    'A shot of a real, finished site — not an empty dashboard. Without one, YouTube uses its own still and a file shows its first frame.',
                  )}
                </Note>
              </div>
            </div>
          </>
        )}
        {sec === 'panel' && cur === 'button' && (
          <>
            {scalar('panelBtn', t('نص الزر', 'Button text'))}
            {link('panelBtnUrl', t('وجهة الزر', 'Where it goes'))}
            {scalar('panelNote', t('السطر الصغير تحت الزر', 'Small line under the button'), true)}
          </>
        )}
        {sec === 'panel' && cur === 'mock' && (
          <>
            <Note>
              {t(
                'دي كلمات رسمة لوحة التحكم اللي بتظهر لحد ما تحط فيديو أو صورة.',
                'The words of the drawn dashboard, shown until a video or image is set.',
              )}
            </Note>
            <Field label={t('اسم اللوحة', 'Panel name')} ar={f.ar.mock.panel} en={f.en.mock.panel} onAr={(v) => setMockName(v, 'ar')} onEn={(v) => setMockName(v, 'en')} />
            <ListField label={t('عناصر القائمة', 'Sidebar items')} ar={f.ar.mock.items} en={f.en.mock.items} onAr={(i, v) => setMockList('items', i, v, 'ar')} onEn={(i, v) => setMockList('items', i, v, 'en')} />
            <ListField label={t('الدوائر', 'Circles')} ar={f.ar.mock.circles} en={f.en.mock.circles} onAr={(i, v) => setMockList('circles', i, v, 'ar')} onEn={(i, v) => setMockList('circles', i, v, 'en')} />
            <ListField label={t('الكروت', 'Cards')} ar={f.ar.mock.cards} en={f.en.mock.cards} onAr={(i, v) => setMockList('cards', i, v, 'ar')} onEn={(i, v) => setMockList('cards', i, v, 'en')} />
          </>
        )}

        {/* ── Features ─────────────────────────────────────────────────── */}
        {sec === 'features' && cur === 'head' && (
          <>
            {scalar('featuresEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('featuresTitle', t('عنوان القسم', 'Section title'), true)}
            {scalar('featuresSub', t('الوصف', 'Description'), true)}
          </>
        )}
        {sec === 'features' && current?.item && f.ar.features[at] && (
          <>
            <Field label={t('العنوان', 'Title')} ar={f.ar.features[at].t} en={f.en.features[at]?.t ?? ''} onAr={(v) => setArr('features', at, 't', v, 'ar')} onEn={(v) => setArr('features', at, 't', v, 'en')} />
            <Field label={t('الوصف', 'Description')} ar={f.ar.features[at].d} en={f.en.features[at]?.d ?? ''} onAr={(v) => setArr('features', at, 'd', v, 'ar')} onEn={(v) => setArr('features', at, 'd', v, 'en')} multiline rows={3} />
            <div className="grid-2 lx-media">
              <div>
                <IconInput label={t('الأيقونة', 'Icon')} value={f.ar.features[at].icon} url={f.ar.features[at].iconUrl} onChange={(v) => setArrBoth('features', at, 'icon', v)} onUrl={(v) => setArrBoth('features', at, 'iconUrl', v)} />
              </div>
              <div>
                <label className="lbl" style={{ display: 'block' }}>{t('خلفية الكارت (اختيارية)', 'Card background (optional)')}</label>
                <MediaUploader
                  compact
                  accept="image/*"
                  previewUrl={f.ar.features[at].bgUrl || null}
                  onUploaded={(m) => setArrBoth('features', at, 'bgUrl', m.url ?? m.thumbUrl ?? '')}
                  onRemove={f.ar.features[at].bgUrl ? () => setArrBoth('features', at, 'bgUrl', '') : undefined}
                />
                <Note style={{ margin: '8px 0 0' }}>
                  {t('بتتحط تحت طبقة خفيفة عشان الكلام يفضل مقروء.', 'It sits under a light veil so the words stay readable.')}
                </Note>
              </div>
            </div>
          </>
        )}

        {/* ── Dashboard tour ───────────────────────────────────────────── */}
        {sec === 'dash' && cur === 'head' && (
          <>
            {scalar('dashEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('dashTitle', t('عنوان القسم', 'Section title'), true)}
            {scalar('dashSub', t('الوصف', 'Description'), true)}
            <Note style={{ margin: '6px 0 0' }}>
              {t(
                'كل سطر في القسم بيتفتح لوحده — لما الزائر يفتح واحد، اللي قبله بيتقفل والصورة أو الفيديو جنبه بيتغيّر للي فتحه.',
                'One line opens at a time — opening one closes the last, and the picture beside it becomes that line’s.',
              )}
            </Note>
          </>
        )}
        {/* The frame the screenshots sit in. One setting for all of them: they
            are shots of the same dashboard, and four separate sets of dials
            would be four chances to make them disagree. */}
        {sec === 'dash' && cur === 'frame' && (
          <>
            <Opt
              label={t('الصورة يمين ولا شمال', 'Which side the picture sits on')}
              value={f.ar.dashSide === 'end' ? 'end' : 'start'}
              options={[
                { value: 'start', label: t('يمين (بداية السطر)', 'Start of the line') },
                { value: 'end', label: t('شمال (نهاية السطر)', 'End of the line') },
              ]}
              onChange={(v) => setKeyBoth('dashSide', v)}
            />
            <Opt
              label={t('مكانها جنب القائمة', 'Where it sits beside the list')}
              value={f.ar.dashAlign === 'center' ? 'center' : 'start'}
              options={[
                { value: 'start', label: t('فوق', 'At the top') },
                { value: 'center', label: t('في النص', 'Centred') },
              ]}
              onChange={(v) => setKeyBoth('dashAlign', v)}
            />
            <Slider
              label={t('الارتفاع (٠ = على شكل الصورة)', 'Height (0 = the picture’s own shape)')}
              value={Number(f.ar.dashHeight ?? 0)}
              min={0}
              max={760}
              suffix={Number(f.ar.dashHeight ?? 0) === 0 ? '' : 'px'}
              onChange={(v) => setKeyBoth('dashHeight', v)}
            />
            <Opt
              label={t('الصورة جوّه الإطار', 'The picture inside the frame')}
              value={f.ar.dashFit === 'contain' ? 'contain' : 'cover'}
              options={[
                { value: 'cover', label: t('تملا الإطار', 'Fills the frame') },
                { value: 'contain', label: t('تظهر كاملة', 'Shown whole') },
              ]}
              onChange={(v) => setKeyBoth('dashFit', v)}
            />
            {f.ar.dashFit !== 'contain' && Number(f.ar.dashHeight ?? 0) > 0 && (
              <>
                <div className="grid-2">
                  <Slider
                    label={t('موضع الصورة — أفقي', 'Framing — across')}
                    value={Number(f.ar.dashPosX ?? 50)}
                    min={0}
                    max={100}
                    suffix="%"
                    onChange={(v) => setKeyBoth('dashPosX', v)}
                  />
                  <Slider
                    label={t('موضع الصورة — رأسي', 'Framing — up and down')}
                    value={Number(f.ar.dashPosY ?? 50)}
                    min={0}
                    max={100}
                    suffix="%"
                    onChange={(v) => setKeyBoth('dashPosY', v)}
                  />
                </div>
                <Note>
                  {t(
                    'لما الصورة تملا إطار أطول أو أقصر منها بيتقص منها جزء — دول بيحدّدوا الجزء اللي يفضل باين.',
                    'A picture filling a frame of a different shape loses some of itself — these decide which part stays.',
                  )}
                </Note>
              </>
            )}
          </>
        )}
        {sec === 'dash' && current?.item && f.ar.dash[at] && (
          <>
            <Field label={t('العنوان', 'Title')} ar={f.ar.dash[at]?.t ?? ''} en={f.en.dash[at]?.t ?? ''} onAr={(v) => setArr('dash', at, 't', v, 'ar')} onEn={(v) => setArr('dash', at, 't', v, 'en')} />
            <Field label={t('الوصف', 'Description')} ar={f.ar.dash[at]?.d ?? ''} en={f.en.dash[at]?.d ?? ''} onAr={(v) => setArr('dash', at, 'd', v, 'ar')} onEn={(v) => setArr('dash', at, 'd', v, 'en')} multiline rows={3} />

            <div className="grid-2 lx-media">
              <div>
                <label className="lbl" style={{ display: 'block' }}>{t('الصورة', 'Image')}</label>
                <MediaUploader
                  big
                  accept="image/*"
                  aspect="16 / 10"
                  previewUrl={f.ar.dash[at]?.imageUrl || null}
                  onUploaded={(m) => setArrBoth('dash', at, 'imageUrl', m.url ?? m.thumbUrl ?? '')}
                  onRemove={f.ar.dash[at]?.imageUrl ? () => setArrBoth('dash', at, 'imageUrl', '') : undefined}
                />
                <Note style={{ margin: '8px 0 0' }}>
                  {t('لقطة من لوحة التحكم بتوضّح السطر ده.', 'A shot of the dashboard showing this line.')}
                </Note>
              </div>
              <div>
                <label className="lbl" style={{ display: 'block' }}>{t('أو لينك فيديو', 'Or a video link')}</label>
                <input
                  className="field"
                  dir="ltr"
                  placeholder="https://youtube.com/watch?v=…"
                  value={f.ar.dash[at]?.videoUrl ?? ''}
                  onChange={(e) => setArrBoth('dash', at, 'videoUrl', e.target.value)}
                  style={{ textAlign: 'start' }}
                />
                <Note style={{ margin: '8px 0 12px' }}>
                  {t('لو فيه لينك، الفيديو بيكسب الصورة.', 'A video link wins over the image.')}
                </Note>
                <label className="lbl" style={{ display: 'block' }}>{t('غلاف الفيديو', 'Video poster')}</label>
                <MediaUploader
                  compact
                  accept="image/*"
                  previewUrl={f.ar.dash[at]?.poster || null}
                  onUploaded={(m) => setArrBoth('dash', at, 'poster', m.url ?? m.thumbUrl ?? '')}
                  onRemove={f.ar.dash[at]?.poster ? () => setArrBoth('dash', at, 'poster', '') : undefined}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Who it is for ────────────────────────────────────────────── */}
        {sec === 'audience' && cur === 'head' && (
          <>
            {scalar('audienceEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('audienceTitle', t('عنوان القسم', 'Section title'), true)}
          </>
        )}
        {sec === 'audience' && cur === 'list' && (
          <>
            {list('audience', t('التخصصات', 'Who it is for'))}
            <Note>
              {t('امسح كل السطور عشان القسم يختفي من الصفحة.', 'Remove every line to take the section off the page.')}
            </Note>
          </>
        )}

        {/* ── Steps ────────────────────────────────────────────────────── */}
        {sec === 'how' && cur === 'head' && (
          <>
            {scalar('howEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('howTitle', t('عنوان القسم', 'Section title'), true)}
          </>
        )}
        {sec === 'how' && current?.item && f.ar.how[at] && (
          <>
            <Field label={t('العنوان', 'Title')} ar={f.ar.how[at].t} en={f.en.how[at]?.t ?? ''} onAr={(v) => setArr('how', at, 't', v, 'ar')} onEn={(v) => setArr('how', at, 't', v, 'en')} />
            <Field label={t('الوصف', 'Description')} ar={f.ar.how[at].d} en={f.en.how[at]?.d ?? ''} onAr={(v) => setArr('how', at, 'd', v, 'ar')} onEn={(v) => setArr('how', at, 'd', v, 'en')} multiline rows={3} />
            <IconInput label={t('العلامة (رقم أو صورة)', 'Marker (number or image)')} value={f.ar.how[at].n} url={f.ar.how[at].iconUrl} onChange={(v) => setArrBoth('how', at, 'n', v)} onUrl={(v) => setArrBoth('how', at, 'iconUrl', v)} />
          </>
        )}
        {sec === 'how' && cur === 'button' && (
          <>
            {scalar('howBtn', t('نص الزر', 'Button text'))}
            {link('howBtnUrl', t('وجهة الزر', 'Where it goes'))}
          </>
        )}

        {/* ── Showcase ─────────────────────────────────────────────────── */}
        {sec === 'showcase' && cur === 'head' && (
          <>
            {scalar('showcaseEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('showcaseTitle', t('عنوان القسم', 'Section title'), true)}
            {scalar('showcaseSub', t('الوصف', 'Description'), true)}
            {scalar('visit', t('زرار الكارت', 'Card button'))}
            {scalar('showcaseEmpty', t('النص لو مفيش أمثلة', 'Text when there are none'))}
          </>
        )}
        {sec === 'showcase' && cur === 'sites' && (
          <>
            <Note>
              {t(
                'بتظهر أحدث ٦. شيل العلامة من أي حساب تجريبي أو مش جاهز — بيختفي، واللي بعده بياخد مكانه.',
                'The newest six show. Untick a test or unfinished account to take it off; the next one takes its place.',
              )}
            </Note>
            <div className="lx-checks">
              {f.tenants.map((tn) => (
                <label key={tn.slug} className="lx-check">
                  <input
                    type="checkbox"
                    checked={!(f.ar.showcaseHidden ?? []).includes(tn.slug)}
                    onChange={(e) => toggleHidden(tn.slug, e.target.checked)}
                  />
                  <span>{tn.name}</span>
                  <small dir="ltr">/{tn.slug}</small>
                </label>
              ))}
            </div>
          </>
        )}
        {sec === 'showcase' && cur === 'metrics' && (
          <>
            <Note>
              {t(
                'الأرقام نفسها بتتحسب من قاعدة البيانات، والشريط بيظهر لما يبقى عندك ١٢ بورتفوليو — دي الكلمات اللي تحتها.',
                'The numbers are counted from the database, and the bar appears at twelve portfolios. These are the words under them.',
              )}
            </Note>
            <Field label={t('البورتفوليوهات', 'Portfolios')} ar={f.ar.metricsLabels.sites} en={f.en.metricsLabels.sites} onAr={(v) => setMetric('sites', v, 'ar')} onEn={(v) => setMetric('sites', v, 'en')} />
            <Field label={t('المشاريع', 'Projects')} ar={f.ar.metricsLabels.projects} en={f.en.metricsLabels.projects} onAr={(v) => setMetric('projects', v, 'ar')} onEn={(v) => setMetric('projects', v, 'en')} />
            <Field label={t('الزيارات', 'Visits')} ar={f.ar.metricsLabels.visits} en={f.en.metricsLabels.visits} onAr={(v) => setMetric('visits', v, 'ar')} onEn={(v) => setMetric('visits', v, 'en')} />
          </>
        )}

        {/* ── Pricing ──────────────────────────────────────────────────── */}
        {sec === 'pricing' && cur === 'head' && (
          <>
            {scalar('pricingEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('pricingTitle', t('عنوان القسم', 'Section title'), true)}
            {scalar('pricingSub', t('الوصف', 'Description'), true)}
            {scalar('pricingNote', t('السطر الأخير تحت الأسعار', 'Closing line under the prices'))}
          </>
        )}
        {sec === 'pricing' && current?.item && f.ar.plans[at] && (
          <>
            <Field label={t('الاسم', 'Name')} ar={f.ar.plans[at]?.name ?? ''} en={f.en.plans[at]?.name ?? ''} onAr={(v) => setPlan(at, 'name', v, 'ar')} onEn={(v) => setPlan(at, 'name', v, 'en')} />
            <div className="lx-row-2">
              <Field label={t('السعر', 'Price')} ar={f.ar.plans[at]?.price ?? ''} en={f.en.plans[at]?.price ?? ''} onAr={(v) => setPlan(at, 'price', v, 'ar')} onEn={(v) => setPlan(at, 'price', v, 'en')} />
              <Field label={t('المدة', 'Per')} ar={f.ar.plans[at]?.per ?? ''} en={f.en.plans[at]?.per ?? ''} onAr={(v) => setPlan(at, 'per', v, 'ar')} onEn={(v) => setPlan(at, 'per', v, 'en')} />
            </div>
            <div className="lx-row-2">
              <Field label={t('البادج (اختياري)', 'Badge (optional)')} ar={f.ar.plans[at]?.badge ?? ''} en={f.en.plans[at]?.badge ?? ''} onAr={(v) => setPlan(at, 'badge', v, 'ar')} onEn={(v) => setPlan(at, 'badge', v, 'en')} />
              <Field label={t('سطر تحت السعر', 'Line under the price')} ar={f.ar.plans[at]?.note ?? ''} en={f.en.plans[at]?.note ?? ''} onAr={(v) => setPlan(at, 'note', v, 'ar')} onEn={(v) => setPlan(at, 'note', v, 'en')} />
            </div>

            <label className="lbl" style={{ display: 'block', margin: '6px 0 8px' }}>{t('النقاط', 'Points')}</label>
            {(f.ar.plans[at]?.feats ?? []).map((_, j) => (
              <div className="grid-2" key={j} style={{ marginBottom: 8, gridTemplateColumns: '1fr 1fr auto', gap: 10 }}>
                <input className="field" value={f.ar.plans[at]?.feats[j] ?? ''} onChange={(e) => setFeat(at, j, e.target.value, 'ar')} />
                <input className="field" dir="ltr" style={{ textAlign: 'start' }} value={f.en.plans[at]?.feats[j] ?? ''} onChange={(e) => setFeat(at, j, e.target.value, 'en')} />
                <button className="btn btn-sm" onClick={() => removeFeat(at, j)}>✕</button>
              </div>
            ))}
            <button className="btn btn-sm" onClick={() => addFeat(at)} style={{ marginBottom: 18 }}>
              + {t('نقطة', 'Point')}
            </button>

            <div className="lx-sep" />
            <Field label={t('نص الزر', 'Button text')} ar={f.ar.plans[at]?.cta ?? ''} en={f.en.plans[at]?.cta ?? ''} onAr={(v) => setPlan(at, 'cta', v, 'ar')} onEn={(v) => setPlan(at, 'cta', v, 'en')} />
            <LinkField
              label={t('وجهة الزر', 'Where the button goes')}
              value={f.ar.plans[at]?.url ?? ''}
              onChange={(v) => setPlanBoth(at, 'url', v)}
              tenants={f.tenants}
            />

            <div className="lx-sep" />
            <div className="grid-2" style={{ alignItems: 'end' }}>
              <ColorInput
                label={t('لون الخطة', 'Plan colour')}
                value={f.ar.plans[at]?.color || f.theme.accent}
                onChange={(v) => setPlanBoth(at, 'color', v)}
              />
              <div>
                <label className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={f.ar.plans[at]?.hi === true}
                    onChange={(e) => setPlanBoth(at, 'hi', e.target.checked)}
                  />
                  {t('الخطة المميّزة', 'Highlighted plan')}
                </label>
                {f.ar.plans[at]?.color && (
                  <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => setPlanBoth(at, 'color', '')}>
                    {t('رجّع لون الصفحة', 'Back to the page colour')}
                  </button>
                )}
              </div>
            </div>
            <Note style={{ margin: '10px 0 0' }}>
              {t(
                'اللون بيغيّر كل حاجة جوّه الكارت — الاسم والعلامات والإطار والزرار. ولون نص الزرار بيتحسب لوحده عشان يفضل مقروء.',
                'The colour repaints everything inside the card — the name, the ticks, the border, the button. The button label is worked out from it, so it stays readable.',
              )}
            </Note>
          </>
        )}
        {sec === 'pricing' && cur === 'included' && (
          <>
            <Note>
              {t(
                'اللي موجود في كل الخطط، مكتوب مرة واحدة بدل ما يتكرر في كل كارت.',
                'What every plan has, said once instead of repeated in each card.',
              )}
            </Note>
            {scalar('pricingIncludedTitle', t('عنوان الشريط', 'Band title'))}
            {list('pricingIncluded', t('العناصر', 'Items'))}
          </>
        )}

        {/* ── Testimonials ─────────────────────────────────────────────── */}
        {sec === 'testimonials' && cur === 'head' && (
          <>
            {scalar('testimonialsEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('testimonialsTitle', t('عنوان القسم', 'Section title'), true)}
            <Note>
              {t(
                'القسم مش بيظهر على الصفحة غير لما تضيف رأي واحد على الأقل. حط آراء حقيقية بس — رأي واحد حقيقي أحسن من تلاتة مش حقيقيين.',
                'The section stays off the page until there is at least one. Real ones only — one genuine quote beats three made-up ones.',
              )}
            </Note>
          </>
        )}
        {sec === 'testimonials' && current?.item && f.ar.testimonials[at] && (
          <>
            <div className="lx-person">
              <MediaUploader
                compact
                accept="image/*"
                previewUrl={f.ar.testimonials[at]?.photoUrl || null}
                onUploaded={(m) => setArrBoth('testimonials', at, 'photoUrl', m.thumbUrl ?? m.url ?? '')}
                onRemove={f.ar.testimonials[at]?.photoUrl ? () => setArrBoth('testimonials', at, 'photoUrl', '') : undefined}
              />
              <div style={{ minWidth: 0 }}>
                <Field label={t('الاسم', 'Name')} ar={f.ar.testimonials[at]?.name ?? ''} en={f.en.testimonials[at]?.name ?? ''} onAr={(v) => setArr('testimonials', at, 'name', v, 'ar')} onEn={(v) => setArr('testimonials', at, 'name', v, 'en')} />
                <Field label={t('التخصص', 'Role')} ar={f.ar.testimonials[at]?.role ?? ''} en={f.en.testimonials[at]?.role ?? ''} onAr={(v) => setArr('testimonials', at, 'role', v, 'ar')} onEn={(v) => setArr('testimonials', at, 'role', v, 'en')} />
              </div>
            </div>
            <Field label={t('الرأي', 'Quote')} ar={f.ar.testimonials[at]?.quote ?? ''} en={f.en.testimonials[at]?.quote ?? ''} onAr={(v) => setArr('testimonials', at, 'quote', v, 'ar')} onEn={(v) => setArr('testimonials', at, 'quote', v, 'en')} multiline rows={4} />
            <label className="lbl" style={{ display: 'block' }}>{t('لينك البورتفوليو بتاعه', 'Their portfolio link')}</label>
            <input
              className="field"
              dir="ltr"
              placeholder="https://viralpx.com/…"
              value={f.ar.testimonials[at]?.url ?? ''}
              onChange={(e) => setArrBoth('testimonials', at, 'url', e.target.value)}
              style={{ textAlign: 'start' }}
            />
          </>
        )}

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        {sec === 'faq' && cur === 'head' && (
          <>
            {scalar('faqEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('faqTitle', t('عنوان القسم', 'Section title'), true)}
          </>
        )}
        {sec === 'faq' && current?.item && f.ar.faqs[at] && (
          <>
            <Field label={t('السؤال', 'Question')} ar={f.ar.faqs[at]?.q ?? ''} en={f.en.faqs[at]?.q ?? ''} onAr={(v) => setArr('faqs', at, 'q', v, 'ar')} onEn={(v) => setArr('faqs', at, 'q', v, 'en')} />
            <Field label={t('الإجابة', 'Answer')} ar={f.ar.faqs[at]?.a ?? ''} en={f.en.faqs[at]?.a ?? ''} onAr={(v) => setArr('faqs', at, 'a', v, 'ar')} onEn={(v) => setArr('faqs', at, 'a', v, 'en')} multiline rows={5} />
          </>
        )}

        {/* ── Call to action ───────────────────────────────────────────── */}
        {sec === 'cta' && (
          <>
            {scalar('ctaTitle', t('العنوان', 'Title'), true)}
            {scalar('ctaSub', t('الوصف', 'Subtitle'), true)}
            {scalar('ctaBtn', t('الزر', 'Button'))}
            {link('ctaBtnUrl', t('وجهة الزر', 'Where it goes'))}
          </>
        )}

        {sec === 'footer' && (
          <>
            {scalar('footerNote', t('سطر تعريفي', 'A line about the product'), true)}
            {scalar('rights', t('حقوق النشر', 'Copyright text'))}

            <Note style={{ margin: '4px 0 14px' }}>
              {t(
                'الروابط في أعمدة. الرابط اللي بيبدأ بـ # بينقل لقسم في نفس الصفحة (زي #pricing)، وأي حاجة تانية بتتفتح كرابط كامل. رابط المدوّنة بيتحط لوحده في أول عمود، وروابط الصفحات القانونية في عمود لوحدها.',
                'Links sit in columns. One starting with # jumps to a section of this page (like #pricing); anything else opens as a full link. The blog link is added on its own in the first column, and the legal pages get a column of their own.',
              )}
            </Note>

            {f.ar.footerGroups.map((_, g) => (
              <Card
                key={g}
                title={`${t('عمود', 'Column')} #${g + 1}`}
                action={
                  <button className="btn btn-sm" onClick={() => removeGroup(g)}>
                    {t('حذف العمود', 'Remove column')}
                  </button>
                }
              >
                <Field
                  label={t('عنوان العمود', 'Column heading')}
                  ar={f.ar.footerGroups[g]?.title ?? ''}
                  en={f.en.footerGroups[g]?.title ?? ''}
                  onAr={(v) => setGroupTitle(g, v, 'ar')}
                  onEn={(v) => setGroupTitle(g, v, 'en')}
                />

                {(f.ar.footerGroups[g]?.links ?? []).map((_l, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 8 }}>
                    <input className="field" placeholder={t('الاسم', 'Label')} value={f.ar.footerGroups[g]?.links[i]?.label ?? ''} onChange={(e) => setGroupLink(g, i, 'label', e.target.value, 'ar')} />
                    <input className="field" dir="ltr" style={{ textAlign: 'start' }} placeholder="Label" value={f.en.footerGroups[g]?.links[i]?.label ?? ''} onChange={(e) => setGroupLink(g, i, 'label', e.target.value, 'en')} />
                    <button className="btn btn-sm" onClick={() => removeGroupLink(g, i)}>✕</button>
                    <input className="field" dir="ltr" style={{ textAlign: 'start', gridColumn: 'span 2' }} placeholder="#pricing" value={f.ar.footerGroups[g]?.links[i]?.url ?? ''} onChange={(e) => { setGroupLink(g, i, 'url', e.target.value, 'ar'); setGroupLink(g, i, 'url', e.target.value, 'en') }} />
                  </div>
                ))}

                <button className="btn btn-sm" onClick={() => addGroupLink(g)}>
                  + {t('رابط', 'Link')}
                </button>
              </Card>
            ))}

            <button className="btn" onClick={addGroup}>
              + {t('عمود جديد', 'Add a column')}
            </button>
          </>
        )}

        {sec === 'legal' && (
          <>
            <Note>
              {t(
                'اكتب النص عادي: سطر فاضي يبدأ فقرة جديدة، والسطر اللي بيبدأ بـ ## بيبقى عنوان، واللي بيبدأ بـ - بيبقى نقطة. الصفحة ولينكها في الفوتر بيظهروا أول ما يكون فيها نص.',
                'Write plain text: a blank line starts a paragraph, a line starting with ## is a heading, and one starting with - is a bullet. A page and its footer link appear as soon as it has text.',
              )}
            </Note>
            {scalar('legalHeading', t('عنوان العمود في الفوتر', 'Footer column heading'))}

            {f.ar.legal.map((pg, i) => (
              <Card key={pg.slug} title={<span dir="ltr">/legal/{pg.slug}</span>}>
                <Field label={t('العنوان', 'Title')} ar={f.ar.legal[i]?.title ?? ''} en={f.en.legal[i]?.title ?? ''} onAr={(v) => setLegal(i, 'title', v, 'ar')} onEn={(v) => setLegal(i, 'title', v, 'en')} />
                <Field label={t('النص', 'Text')} ar={f.ar.legal[i]?.body ?? ''} en={f.en.legal[i]?.body ?? ''} onAr={(v) => setLegal(i, 'body', v, 'ar')} onEn={(v) => setLegal(i, 'body', v, 'en')} multiline rows={14} />
              </Card>
            ))}
          </>
        )}

        {sec === 'order' && (
          <>
            <Note>
              {t(
                'رتّب أقسام الصفحة بالسهمين، واقفل أي قسم لحد ما يبقى جاهز. الشريط العلوي والفوتر ثابتين.',
                'Reorder the page with the arrows, and switch a section off until it is ready. The header and footer stay put.',
              )}
            </Note>
            {f.order.map((b, i) => {
              const band = LANDING_BANDS.find((x) => x.id === b.id)
              return (
                <div className="list-row" key={b.id} style={{ alignItems: 'stretch' }}>
                  <div
                    className={`toggle ${b.on ? 'on' : ''}`}
                    onClick={() => toggleBand(i)}
                    role="switch"
                    aria-checked={b.on}
                  />
                  <div
                    className="field"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span style={{ color: 'var(--sub)', fontSize: 12 }}>{band?.en ?? b.id}</span>
                    <span style={{ fontWeight: 700 }}>{band?.ar ?? b.id}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button className="icon-btn" style={{ height: 20 }} onClick={() => moveBand(i, -1)}>▲</button>
                    <button className="icon-btn" style={{ height: 20 }} onClick={() => moveBand(i, 1)}>▼</button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {sec === 'style' && (
          <>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <Opt label={t('الخط العربي', 'Arabic font')} value={f.style.fontAr} options={FONT_AR_OPTIONS} onChange={(v) => setStyle({ fontAr: v })} />
              <Opt label={t('الخط اللاتيني (العناوين)', 'Latin font (headings)')} value={f.style.fontLatin} options={FONT_LATIN_OPTIONS} onChange={(v) => setStyle({ fontLatin: v })} />
            </div>

            <div className="design-subtabs">
              <button className={`dst ${!light ? 'active' : ''}`} onClick={() => setLight(false)}>
                🌙 {t('داكن', 'Dark')}
              </button>
              <button className={`dst ${light ? 'active' : ''}`} onClick={() => setLight(true)}>
                ☀️ {t('فاتح', 'Light')}
              </button>
            </div>

            <div className="palette-row">
              {(light ? LIGHT_PALETTES : DARK_PALETTES).map((p) => (
                <button
                  key={p.name}
                  className="palette-chip"
                  onClick={() =>
                    setTheme({
                      [k.accent]: p.accent,
                      [k.bg]: p.bg,
                      [k.bg2]: p.bg2,
                      [k.text]: p.text,
                      [k.sub]: p.subtext,
                    } as Partial<LandingTheme>)
                  }
                >
                  <span className="palette-swatch">
                    <i style={{ background: p.accent }} />
                    <i style={{ background: p.bg }} />
                    <i style={{ background: p.bg2 }} />
                  </span>
                  {p.name}
                </button>
              ))}
            </div>

            <div className="de-colors" style={{ marginTop: 14 }}>
              <ColorInput label={t('المميّز', 'Accent')} value={tv(k.accent)} onChange={(v) => setTheme({ [k.accent]: v } as Partial<LandingTheme>)} />
              <ColorInput label={t('الخلفية', 'Background')} value={tv(k.bg)} onChange={(v) => setTheme({ [k.bg]: v } as Partial<LandingTheme>)} />
              <ColorInput label={t('خلفية الكروت', 'Cards')} value={tv(k.bg2)} onChange={(v) => setTheme({ [k.bg2]: v } as Partial<LandingTheme>)} />
              <ColorInput label={t('النص', 'Text')} value={tv(k.text)} onChange={(v) => setTheme({ [k.text]: v } as Partial<LandingTheme>)} />
              <ColorInput label={t('النص الخافت', 'Muted')} value={tv(k.sub)} onChange={(v) => setTheme({ [k.sub]: v } as Partial<LandingTheme>)} />
            </div>

            <p style={{ color: 'var(--sub)', fontSize: 13, marginTop: 14 }}>
              {t(
                'الزائر بيقلّب بين الوضعين من زر الشمس/القمر في شريط الصفحة، واختياره بيتحفظ عنده.',
                'Visitors switch with the sun/moon button in the page nav, and their choice is remembered.',
              )}
            </p>
          </>
        )}

        {sec === 'cards' && (
          <>
            <Opt
              label={t('عرض البورتفوليوهات', 'Showcase layout')}
              value={f.style.showcaseLayout}
              options={[
                { value: 'slider', label: t('سلايدر', 'Slider') },
                { value: 'grid', label: t('شبكة', 'Grid') },
              ]}
              onChange={(v) => setStyle({ showcaseLayout: v })}
            />
            <p style={{ color: 'var(--sub)', fontSize: 13, margin: '0 0 20px' }}>
              {t(
                'الشبكة بتسيب فراغ لو العدد مش من مضاعفات ٣. السلايدر مبيفرقش معاه العدد.',
                'A grid leaves a hole when the count is not a multiple of three. A slider does not care about the count.',
              )}
            </p>

            <Opt
              label={t('كروت البورتفوليوهات', 'Showcase cards')}
              value={f.style.showcase}
              options={[
                { value: 'portrait', label: t('صورة دائرية', 'Portrait') },
                { value: 'plate', label: t('صورة بارزة', 'Plate') },
                { value: 'cover', label: t('غلاف عريض', 'Cover') },
                { value: 'row', label: t('صف مضغوط', 'Compact row') },
              ]}
              onChange={(v) => setStyle({ showcase: v })}
            />
            <p style={{ color: 'var(--sub)', fontSize: 13, margin: '0 0 20px' }}>
              {t(
                'الكارت بيعرض صورة صاحب البورتفوليو وعنوانه من إعداداته — «غلاف عريض» بيستخدم صورة الغلاف. اللي مرفعش صورة بيظهر أول حرف من اسمه زي الأول.',
                "The card shows each owner's photo and their own one-line title — Cover uses their cover image instead. Anyone without a picture keeps the initial.",
              )}
            </p>

            <Opt
              label={t('شكل كل الكروت', 'Card finish')}
              value={f.style.card}
              options={[
                { value: 'solid', label: t('مصمت', 'Solid') },
                { value: 'outline', label: t('حدود فقط', 'Outline') },
                { value: 'glass', label: t('زجاجي', 'Glass') },
                { value: 'elevated', label: t('ظل مرتفع', 'Elevated') },
              ]}
              onChange={(v) => setStyle({ card: v })}
            />
            <p style={{ color: 'var(--sub)', fontSize: 13, margin: 0 }}>
              {t(
                'بيتطبّق على كروت المميزات والبورتفوليوهات والأسعار والأسئلة والآراء مع بعض.',
                'Applies to the feature, showcase, pricing, FAQ and testimonial cards together.',
              )}
            </p>
          </>
        )}

        {sec === 'tools' && (
          <>
            <Field label={t('عنوان الصفحة في جوجل', 'Page title in Google')} ar={f.ar.seoTitle} en={f.en.seoTitle} onAr={(v) => setKey('seoTitle', v, 'ar')} onEn={(v) => setKey('seoTitle', v, 'en')} />
            <Field label={t('وصف الصفحة في جوجل', 'Page description in Google')} ar={f.ar.seoDescription} en={f.en.seoDescription} onAr={(v) => setKey('seoDescription', v, 'ar')} onEn={(v) => setKey('seoDescription', v, 'en')} multiline rows={3} />
            <Note style={{ margin: '-4px 0 22px' }}>
              {t(
                'العنوان أقل من ٦٠ حرف والوصف أقل من ١٦٠ عشان جوجل ميقصّهمش. الوصف ده كمان بيظهر لما حد يشارك اللينك.',
                'Keep the title under 60 characters and the description under 160 so Google does not cut them. The description also shows when the link is shared.',
              )}
            </Note>

            <label className="lbl">{t('كود التحقق من Search Console', 'Search Console verification token')}</label>
            <input className="field" dir="ltr" value={f.tools.searchConsole} placeholder="abc123..." onChange={(e) => setTools({ searchConsole: e.target.value })} style={{ textAlign: 'start' }} />
            <p className="lbl" style={{ opacity: 0.7, marginTop: 4 }}>
              {t(
                'من Search Console → طريقة «HTML tag»، وانسخ قيمة content بس.',
                'In Search Console, pick the “HTML tag” method and copy only the content value.',
              )}
            </p>

            <label className="lbl" style={{ marginTop: 16, display: 'block' }}>
              {t('معرّف Google Analytics', 'Google Analytics measurement id')}
            </label>
            <input className="field" dir="ltr" value={f.tools.analyticsId} placeholder="G-XXXXXXXXXX" onChange={(e) => setTools({ analyticsId: e.target.value })} style={{ textAlign: 'start' }} />
            <p className="lbl" style={{ opacity: 0.7, marginTop: 4 }}>
              {t(
                'دي للموقع الأساسي بس — كل عميل بيربط حساباته من لوحته هو.',
                'These are for the platform site only — each client connects their own from their dashboard.',
              )}
            </p>
          </>
        )}

        {sec === 'backgrounds' && (
          <SectionBgRows rows={f.sectionBg} sections={LANDING_BG_SECTIONS} tr={t} onChange={setSectionBg} />
        )}

        {sec === 'images' && (
          <>
            <label className="lbl">{t('لوجو الشريط العلوي', 'Nav logo')}</label>
            <MediaUploader compact previewUrl={f.images.logoUrl} onUploaded={(m) => setImages({ logoId: m.id, logoUrl: m.thumbUrl })} />

            <label className="lbl" style={{ marginTop: 18, display: 'block' }}>
              {t('صورة القسم الرئيسي', 'Hero image')}
            </label>
            <MediaUploader big dim={f.images.heroDim} previewUrl={f.images.heroUrl} onUploaded={(m) => setImages({ heroId: m.id, heroUrl: m.url ?? m.thumbUrl })} />
            <div style={{ marginTop: 12 }}>
              <div className="lbl" style={{ marginBottom: 4 }}>
                {t('التعتيم', 'Dim')}: {f.images.heroDim}%
              </div>
              <input type="range" min={0} max={100} value={f.images.heroDim} onChange={(e) => setImages({ heroDim: Number(e.target.value) })} style={{ width: '100%' }} />
            </div>

            <label className="lbl" style={{ marginTop: 18, display: 'block' }}>
              {t('صورة المشاركة (واتساب/تويتر)', 'Share preview image')}
            </label>
            <MediaUploader compact previewUrl={f.images.ogUrl} onUploaded={(m) => setImages({ ogId: m.id, ogUrl: m.url ?? m.thumbUrl })} />

            <Note style={{ marginTop: 22 }}>
              {t(
                'فيديو الشرح وصورة غلافه اتنقلوا لتبويب «فيديو الشرح» في صفحة المحتوى.',
                'The explainer video and its poster now live in the Explainer video tab of the content page.',
              )}
            </Note>
          </>
        )}
            </div>
          </section>

          {showPreview && (
            <LandingPreview spot={SPOT[sec]} version={version} onClose={() => setShowPreview(false)} />
          )}
        </div>
      </div>

      {toast && <div className="toast">{t('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
