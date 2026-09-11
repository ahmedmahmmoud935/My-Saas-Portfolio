'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import { useDashLang } from './DashLang'
import MediaUploader from './MediaUploader'
import SectionBgRows from './SectionBgRows'
import { ColorInput, Opt } from './controls'
import { saveLanding, type LandingImages, type LandingStyle, type LandingTheme, type LandingTools } from '@/lib/landing-actions'
import { LANDING_COPY } from '@/lib/landing-copy'
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
  const [f, setF] = useState<Form>(initial)
  const [sec, setSec] = useState<SectionId>(shown[0]?.items[0]?.id ?? 'hero')
  const [busy, setBusy] = useState(false)
  const [light, setLight] = useState(false)
  const [toast, setToast] = useState(false)
  const { t } = useDashLang()

  // Deep-ish setters over the two locale copies.
  const setTheme = (p: Partial<LandingTheme>) => setF((f0) => ({ ...f0, theme: { ...f0.theme, ...p } }))
  const setImages = (p: Partial<LandingImages>) => setF((f0) => ({ ...f0, images: { ...f0.images, ...p } }))
  const setSectionBg = (rows: SectionBgForm[]) => setF((f0) => ({ ...f0, sectionBg: rows }))
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
  const setKeyBoth = (key: keyof Copy, v: string | string[]) =>
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
  const setPlanBoth = (i: number, field: 'hi' | 'color', v: boolean | string) =>
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
  const addPlan = () =>
    setF((p) => {
      const blank = { name: '', badge: '', price: '', per: '', note: '', feats: [''], cta: '', hi: false, color: '' }
      return { ...p, ar: { ...p.ar, plans: [...p.ar.plans, blank] }, en: { ...p.en, plans: [...p.en.plans, blank] } }
    })
  const removePlan = (i: number) =>
    setF((p) => ({
      ...p,
      ar: { ...p.ar, plans: p.ar.plans.filter((_, j) => j !== i) },
      en: { ...p.en, plans: p.en.plans.filter((_, j) => j !== i) },
    }))

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
  type RowList = 'features' | 'faqs' | 'how' | 'testimonials'
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
  const addRow = (arr: 'faqs' | 'testimonials') =>
    setF((p) => {
      const blank = arr === 'faqs' ? { q: '', a: '' } : { name: '', role: '', quote: '', photoUrl: '', url: '' }
      const grow = (loc: 'ar' | 'en') => [...(p[loc][arr] as unknown as object[]), blank]
      return { ...p, ar: { ...p.ar, [arr]: grow('ar') }, en: { ...p.en, [arr]: grow('en') } }
    })
  const removeRow = (arr: 'faqs' | 'testimonials', i: number) =>
    setF((p) => {
      const cut = (loc: 'ar' | 'en') => (p[loc][arr] as unknown as object[]).filter((_, j) => j !== i)
      return { ...p, ar: { ...p.ar, [arr]: cut('ar') }, en: { ...p.en, [arr]: cut('en') } }
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

  async function save() {
    setBusy(true)
    await saveLanding(f.ar, f.en, f.theme, f.images, f.sectionBg, f.style, f.tools)
    setBusy(false)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
  }

  return (
    <div>
      <PageHeader
        icon={groups?.includes('Design') && groups.length === 1 ? '🎨' : '🌍'}
        title={title ?? t('الصفحة الرئيسية', 'Landing page')}
        subtitle={subtitle ?? t('عدّل نصوص وهوية صفحة الموقع الرئيسية', 'Edit the marketing landing page copy')}
        actions={<button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? '…' : t('💾 حفظ', '💾 Save')}</button>}
      />

      <div className="lp-tabs">
        {shown.map((g) => (
          <div className="lp-tab-group" key={g.en}>
            {shown.length > 1 && <div className="nav-group-title">{t(g.ar, g.en)}</div>}
            <div className="cat-pills">
              {g.items.map((s) => (
                <button key={s.id} className={`pill ${sec === s.id ? 'active' : ''}`} onClick={() => setSec(s.id)}>
                  {t(s.ar, s.en)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
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

            <label className="lbl" style={{ display: 'block', marginTop: 8 }}>
              {t('رابط كل أزرار «ابدأ»', 'Where every "start" button goes')}
            </label>
            <Note style={{ margin: '0 0 8px' }}>
              {t(
                'زرار الشريط، والقسم الرئيسي، والفيديو، والخطوات، والأسعار، وآخر الصفحة — كلهم بيروحوا هنا. لو التسجيل لسه مش متاح، حط لينك واتساب (زي https://wa.me/20…) بدل صفحة الدخول.',
                'The nav, hero, video, steps, pricing and closing buttons all go here. Until sign-up is open, a WhatsApp link (like https://wa.me/20…) works better than the login page.',
              )}
            </Note>
            <input
              className="field"
              dir="ltr"
              placeholder="/login"
              value={f.ar.ctaUrl}
              onChange={(e) => setKeyBoth('ctaUrl', e.target.value)}
              style={{ textAlign: 'start' }}
            />
          </>
        )}

        {sec === 'hero' && (
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

            <div className="grid-2" style={{ marginBottom: 14 }}>
              {(['ar', 'en'] as const).map((loc) => (
                <div key={loc}>
                  <div className="lbl" style={{ marginBottom: 6 }}>
                    {loc === 'ar' ? t('حجم العنوان (عربي)', 'Title size (Arabic)') : t('حجم العنوان (إنجليزي)', 'Title size (English)')}: {f[loc].heroScale ?? 100}%
                  </div>
                  <input type="range" min={60} max={150} step={5} value={f[loc].heroScale ?? 100} onChange={(e) => setNum('heroScale', Number(e.target.value), loc)} style={{ width: '100%' }} />

                  <div className="lbl" style={{ margin: '12px 0 6px' }}>
                    {loc === 'ar' ? t('تباعد السطور (عربي)', 'Line spacing (Arabic)') : t('تباعد السطور (إنجليزي)', 'Line spacing (English)')}: {f[loc].heroLeading ?? 100}%
                  </div>
                  <input type="range" min={70} max={160} step={5} value={f[loc].heroLeading ?? 100} onChange={(e) => setNum('heroLeading', Number(e.target.value), loc)} style={{ width: '100%' }} />
                </div>
              ))}
            </div>

            {scalar('heroSub', t('الوصف', 'Subtitle'), true)}
            {scalar('heroBtn1', t('الزر الأساسي', 'Main button'))}
            {scalar('heroBtn2', t('الزر الثانوي (بيفتح أول بورتفوليو في الأمثلة)', 'Second button (opens the first showcase portfolio)'))}
            {scalar('heroNote', t('السطر الصغير تحت الأزرار', 'Small line under the buttons'))}
          </>
        )}

        {sec === 'compare' && (
          <>
            {scalar('compareEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('compareTitle', t('عنوان القسم', 'Section title'), true)}
            {scalar('compareSub', t('الوصف', 'Description'), true)}

            <Card title={t('العمود الأحمر', 'The red column')}>
              {scalar('compareOldTitle', t('عنوان العمود', 'Column title'))}
              {list('compareOld', t('النقاط', 'Points'))}
            </Card>

            <Card title={t('عمود ViralPX', 'The ViralPX column')}>
              {scalar('compareNewTitle', t('عنوان العمود', 'Column title'))}
              {list('compareNew', t('النقاط', 'Points'))}
            </Card>

            {scalar('compareLink', t('الرابط تحت الكروت', 'Link under the cards'))}
          </>
        )}

        {sec === 'panel' && (
          <>
            {scalar('panelEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('panelHeading', t('عنوان القسم', 'Section title'), true)}
            {scalar('panelSub', t('الوصف', 'Description'), true)}
            {scalar('panelTitle', t('عنوان شريط الإطار', 'Frame bar title'))}

            <Card title={t('الفيديو', 'The video')}>
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

              <label className="lbl" style={{ display: 'block', marginTop: 18 }}>
                {t('صورة الغلاف', 'Poster image')}
              </label>
              <Note style={{ margin: '0 0 8px' }}>
                {t(
                  'لقطة من موقع حقيقي جاهز، مش لوحة تحكم فاضية. من غيرها: يوتيوب بياخد صورته، والملف بيعرض أول لقطة منه.',
                  'A shot of a real, finished site — not an empty dashboard. Without one, YouTube uses its own still and a file shows its first frame.',
                )}
              </Note>
              <MediaUploader
                compact
                accept="image/*"
                previewUrl={f.ar.panelPoster || null}
                onUploaded={(m) => setKeyBoth('panelPoster', m.url ?? m.thumbUrl ?? '')}
                onRemove={f.ar.panelPoster ? () => setKeyBoth('panelPoster', '') : undefined}
              />

              <div style={{ marginTop: 16 }}>
                <Field
                  label={t('مدة الفيديو (زي 1:30)', 'Running time (like 1:30)')}
                  ar={f.ar.panelDuration}
                  en={f.en.panelDuration}
                  onAr={(v) => setKey('panelDuration', v, 'ar')}
                  onEn={(v) => setKey('panelDuration', v, 'en')}
                />
              </div>
            </Card>

            {scalar('panelBtn', t('الزر تحت الفيديو', 'Button under the video'))}
            {scalar('panelNote', t('السطر الصغير تحت الزر', 'Small line under the button'), true)}

            <Card title={t('الرسمة الافتراضية', 'The default drawing')}>
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
            </Card>
          </>
        )}

        {sec === 'features' && (
          <>
            {scalar('featuresEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('featuresTitle', t('عنوان القسم', 'Section title'), true)}
            {scalar('featuresSub', t('الوصف', 'Description'), true)}

            {f.ar.features.map((_, i) => (
              <Card key={i} title={`#${i + 1}`}>
                <IconInput label={t('الأيقونة', 'Icon')} value={f.ar.features[i].icon} url={f.ar.features[i].iconUrl} onChange={(v) => setArrBoth('features', i, 'icon', v)} onUrl={(v) => setArrBoth('features', i, 'iconUrl', v)} />

                <label className="lbl" style={{ display: 'block' }}>{t('خلفية الكارت', 'Card background')}</label>
                <Note style={{ margin: '0 0 8px' }}>
                  {t(
                    'اختيارية. الصورة بتتحط تحت طبقة خفيفة عشان الكلام يفضل مقروء.',
                    'Optional. It sits under a light veil so the words stay readable.',
                  )}
                </Note>
                <MediaUploader
                  compact
                  accept="image/*"
                  previewUrl={f.ar.features[i].bgUrl || null}
                  onUploaded={(m) => setArrBoth('features', i, 'bgUrl', m.url ?? m.thumbUrl ?? '')}
                  onRemove={f.ar.features[i].bgUrl ? () => setArrBoth('features', i, 'bgUrl', '') : undefined}
                />
                <Field label={t('العنوان', 'Title')} ar={f.ar.features[i].t} en={f.en.features[i].t} onAr={(v) => setArr('features', i, 't', v, 'ar')} onEn={(v) => setArr('features', i, 't', v, 'en')} />
                <Field label={t('الوصف', 'Description')} ar={f.ar.features[i].d} en={f.en.features[i].d} onAr={(v) => setArr('features', i, 'd', v, 'ar')} onEn={(v) => setArr('features', i, 'd', v, 'en')} multiline />
              </Card>
            ))}
          </>
        )}

        {sec === 'audience' && (
          <>
            {scalar('audienceEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('audienceTitle', t('عنوان القسم', 'Section title'), true)}
            {list('audience', t('التخصصات', 'Who it is for'))}
            <Note>
              {t('امسح كل السطور عشان القسم يختفي من الصفحة.', 'Remove every line to take the section off the page.')}
            </Note>
          </>
        )}

        {sec === 'how' && (
          <>
            {scalar('howEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('howTitle', t('عنوان القسم', 'Section title'), true)}

            {f.ar.how.map((_, i) => (
              <Card key={i} title={`#${i + 1}`}>
                <IconInput label={t('العلامة (رقم أو صورة)', 'Marker (number or image)')} value={f.ar.how[i].n} url={f.ar.how[i].iconUrl} onChange={(v) => setArrBoth('how', i, 'n', v)} onUrl={(v) => setArrBoth('how', i, 'iconUrl', v)} />
                <Field label={t('العنوان', 'Title')} ar={f.ar.how[i].t} en={f.en.how[i].t} onAr={(v) => setArr('how', i, 't', v, 'ar')} onEn={(v) => setArr('how', i, 't', v, 'en')} />
                <Field label={t('الوصف', 'Description')} ar={f.ar.how[i].d} en={f.en.how[i].d} onAr={(v) => setArr('how', i, 'd', v, 'ar')} onEn={(v) => setArr('how', i, 'd', v, 'en')} multiline />
              </Card>
            ))}

            {scalar('howBtn', t('الزر تحت الخطوات', 'Button under the steps'))}
          </>
        )}

        {sec === 'showcase' && (
          <>
            {scalar('showcaseEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('showcaseTitle', t('عنوان القسم', 'Section title'), true)}
            {scalar('showcaseSub', t('الوصف', 'Description'), true)}
            {scalar('visit', t('زرار الكارت', 'Card button'))}
            {scalar('showcaseEmpty', t('النص لو مفيش أمثلة', 'Text when there are none'))}

            <Card title={t('البورتفوليوهات اللي بتظهر', 'Which portfolios show')}>
              <Note>
                {t(
                  'بتظهر أحدث ٦. شيل العلامة من أي حساب تجريبي أو مش جاهز — بيختفي، واللي بعده بياخد مكانه.',
                  'The newest six show. Untick a test or unfinished account to take it off; the next one takes its place.',
                )}
              </Note>
              {f.tenants.map((tn) => (
                <label key={tn.slug} className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={!(f.ar.showcaseHidden ?? []).includes(tn.slug)}
                    onChange={(e) => toggleHidden(tn.slug, e.target.checked)}
                  />
                  {tn.name} <span style={{ opacity: 0.6 }} dir="ltr">/{tn.slug}</span>
                </label>
              ))}
            </Card>

            <Card title={t('شريط الأرقام', 'The numbers bar')}>
              <Note>
                {t(
                  'الأرقام نفسها بتتحسب من قاعدة البيانات، والشريط بيظهر لما يبقى عندك ١٢ بورتفوليو — دي الكلمات اللي تحتها.',
                  'The numbers are counted from the database, and the bar appears at twelve portfolios. These are the words under them.',
                )}
              </Note>
              <Field label={t('البورتفوليوهات', 'Portfolios')} ar={f.ar.metricsLabels.sites} en={f.en.metricsLabels.sites} onAr={(v) => setMetric('sites', v, 'ar')} onEn={(v) => setMetric('sites', v, 'en')} />
              <Field label={t('المشاريع', 'Projects')} ar={f.ar.metricsLabels.projects} en={f.en.metricsLabels.projects} onAr={(v) => setMetric('projects', v, 'ar')} onEn={(v) => setMetric('projects', v, 'en')} />
              <Field label={t('الزيارات', 'Visits')} ar={f.ar.metricsLabels.visits} en={f.en.metricsLabels.visits} onAr={(v) => setMetric('visits', v, 'ar')} onEn={(v) => setMetric('visits', v, 'en')} />
            </Card>
          </>
        )}

        {sec === 'pricing' && (
          <>
            {scalar('pricingEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('pricingTitle', t('عنوان القسم', 'Section title'), true)}
            {scalar('pricingSub', t('الوصف', 'Description'), true)}

            {f.ar.plans.map((_, i) => (
              <Card
                key={i}
                title={`${t('خطة', 'Plan')} #${i + 1}`}
                action={
                  <button className="btn btn-sm" onClick={() => removePlan(i)}>
                    {t('حذف الخطة', 'Remove plan')}
                  </button>
                }
              >
                <Field label={t('الاسم', 'Name')} ar={f.ar.plans[i]?.name ?? ''} en={f.en.plans[i]?.name ?? ''} onAr={(v) => setPlan(i, 'name', v, 'ar')} onEn={(v) => setPlan(i, 'name', v, 'en')} />
                <Field label={t('البادج (اختياري)', 'Badge (optional)')} ar={f.ar.plans[i]?.badge ?? ''} en={f.en.plans[i]?.badge ?? ''} onAr={(v) => setPlan(i, 'badge', v, 'ar')} onEn={(v) => setPlan(i, 'badge', v, 'en')} />
                <Field label={t('السعر', 'Price')} ar={f.ar.plans[i]?.price ?? ''} en={f.en.plans[i]?.price ?? ''} onAr={(v) => setPlan(i, 'price', v, 'ar')} onEn={(v) => setPlan(i, 'price', v, 'en')} />
                <Field label={t('المدة', 'Per')} ar={f.ar.plans[i]?.per ?? ''} en={f.en.plans[i]?.per ?? ''} onAr={(v) => setPlan(i, 'per', v, 'ar')} onEn={(v) => setPlan(i, 'per', v, 'en')} />
                <Field label={t('سطر تحت السعر', 'Line under the price')} ar={f.ar.plans[i]?.note ?? ''} en={f.en.plans[i]?.note ?? ''} onAr={(v) => setPlan(i, 'note', v, 'ar')} onEn={(v) => setPlan(i, 'note', v, 'en')} />
                <Field label={t('نص الزر', 'Button text')} ar={f.ar.plans[i]?.cta ?? ''} en={f.en.plans[i]?.cta ?? ''} onAr={(v) => setPlan(i, 'cta', v, 'ar')} onEn={(v) => setPlan(i, 'cta', v, 'en')} />

                <div className="grid-2" style={{ alignItems: 'end', marginBottom: 14 }}>
                  <ColorInput
                    label={t('لون الخطة', 'Plan colour')}
                    value={f.ar.plans[i]?.color || f.theme.accent}
                    onChange={(v) => setPlanBoth(i, 'color', v)}
                  />
                  <div>
                    <label className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={f.ar.plans[i]?.hi === true}
                        onChange={(e) => setPlanBoth(i, 'hi', e.target.checked)}
                      />
                      {t('الخطة المميّزة', 'Highlighted plan')}
                    </label>
                    {f.ar.plans[i]?.color && (
                      <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => setPlanBoth(i, 'color', '')}>
                        {t('رجّع لون الصفحة', 'Back to the page colour')}
                      </button>
                    )}
                  </div>
                </div>
                <Note style={{ margin: '-6px 0 14px' }}>
                  {t(
                    'اللون بيغيّر كل حاجة جوّه الكارت — الاسم والعلامات والإطار والزرار. ولون نص الزرار بيتحسب لوحده عشان يفضل مقروء.',
                    'The colour repaints everything inside the card — the name, the ticks, the border, the button. The button label is worked out from it, so it stays readable.',
                  )}
                </Note>

                <label className="lbl" style={{ display: 'block', marginBottom: 8 }}>{t('النقاط', 'Points')}</label>
                {(f.ar.plans[i]?.feats ?? []).map((_, j) => (
                  <div className="grid-2" key={j} style={{ marginBottom: 8, gridTemplateColumns: '1fr 1fr auto', gap: 10 }}>
                    <input className="field" value={f.ar.plans[i]?.feats[j] ?? ''} onChange={(e) => setFeat(i, j, e.target.value, 'ar')} />
                    <input className="field" dir="ltr" style={{ textAlign: 'start' }} value={f.en.plans[i]?.feats[j] ?? ''} onChange={(e) => setFeat(i, j, e.target.value, 'en')} />
                    <button className="btn btn-sm" onClick={() => removeFeat(i, j)}>✕</button>
                  </div>
                ))}
                <button className="btn btn-sm" onClick={() => addFeat(i)}>
                  + {t('نقطة', 'Point')}
                </button>
              </Card>
            ))}

            <button className="btn" onClick={addPlan} style={{ marginBottom: 20 }}>
              + {t('خطة جديدة', 'Add a plan')}
            </button>

            <Card title={t('الشريط تحت الكروت', 'The band under the cards')}>
              <Note>
                {t(
                  'اللي موجود في كل الخطط، مكتوب مرة واحدة بدل ما يتكرر في كل كارت.',
                  'What every plan has, said once instead of repeated in each card.',
                )}
              </Note>
              {scalar('pricingIncludedTitle', t('عنوان الشريط', 'Band title'))}
              {list('pricingIncluded', t('العناصر', 'Items'))}
            </Card>

            {scalar('pricingNote', t('السطر الأخير', 'Closing line'))}
          </>
        )}

        {sec === 'testimonials' && (
          <>
            {scalar('testimonialsEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('testimonialsTitle', t('عنوان القسم', 'Section title'), true)}
            <Note>
              {t(
                'القسم مش بيظهر على الصفحة غير لما تضيف رأي واحد على الأقل. حط آراء حقيقية بس — رأي واحد حقيقي أحسن من تلاتة مش حقيقيين.',
                'The section stays off the page until there is at least one. Real ones only — one genuine quote beats three made-up ones.',
              )}
            </Note>

            {f.ar.testimonials.map((_, i) => (
              <Card
                key={i}
                title={`#${i + 1}`}
                action={
                  <button className="btn btn-sm" onClick={() => removeRow('testimonials', i)}>
                    {t('حذف', 'Remove')}
                  </button>
                }
              >
                <label className="lbl" style={{ display: 'block' }}>{t('الصورة', 'Photo')}</label>
                <MediaUploader
                  compact
                  accept="image/*"
                  previewUrl={f.ar.testimonials[i]?.photoUrl || null}
                  onUploaded={(m) => setArrBoth('testimonials', i, 'photoUrl', m.thumbUrl ?? m.url ?? '')}
                  onRemove={f.ar.testimonials[i]?.photoUrl ? () => setArrBoth('testimonials', i, 'photoUrl', '') : undefined}
                />
                <div style={{ marginTop: 12 }}>
                  <Field label={t('الاسم', 'Name')} ar={f.ar.testimonials[i]?.name ?? ''} en={f.en.testimonials[i]?.name ?? ''} onAr={(v) => setArr('testimonials', i, 'name', v, 'ar')} onEn={(v) => setArr('testimonials', i, 'name', v, 'en')} />
                </div>
                <Field label={t('التخصص', 'Role')} ar={f.ar.testimonials[i]?.role ?? ''} en={f.en.testimonials[i]?.role ?? ''} onAr={(v) => setArr('testimonials', i, 'role', v, 'ar')} onEn={(v) => setArr('testimonials', i, 'role', v, 'en')} />
                <Field label={t('الرأي', 'Quote')} ar={f.ar.testimonials[i]?.quote ?? ''} en={f.en.testimonials[i]?.quote ?? ''} onAr={(v) => setArr('testimonials', i, 'quote', v, 'ar')} onEn={(v) => setArr('testimonials', i, 'quote', v, 'en')} multiline rows={3} />
                <label className="lbl" style={{ display: 'block' }}>{t('لينك البورتفوليو بتاعه', 'Their portfolio link')}</label>
                <input
                  className="field"
                  dir="ltr"
                  placeholder="https://viralpx.com/…"
                  value={f.ar.testimonials[i]?.url ?? ''}
                  onChange={(e) => setArrBoth('testimonials', i, 'url', e.target.value)}
                  style={{ textAlign: 'start' }}
                />
              </Card>
            ))}

            <button className="btn" onClick={() => addRow('testimonials')}>
              + {t('رأي جديد', 'Add a testimonial')}
            </button>
          </>
        )}

        {sec === 'faq' && (
          <>
            {scalar('faqEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('faqTitle', t('عنوان القسم', 'Section title'), true)}

            {f.ar.faqs.map((_, i) => (
              <Card
                key={i}
                title={`#${i + 1}`}
                action={
                  <button className="btn btn-sm" onClick={() => removeRow('faqs', i)}>
                    {t('حذف', 'Remove')}
                  </button>
                }
              >
                <Field label={t('السؤال', 'Question')} ar={f.ar.faqs[i]?.q ?? ''} en={f.en.faqs[i]?.q ?? ''} onAr={(v) => setArr('faqs', i, 'q', v, 'ar')} onEn={(v) => setArr('faqs', i, 'q', v, 'en')} />
                <Field label={t('الإجابة', 'Answer')} ar={f.ar.faqs[i]?.a ?? ''} en={f.en.faqs[i]?.a ?? ''} onAr={(v) => setArr('faqs', i, 'a', v, 'ar')} onEn={(v) => setArr('faqs', i, 'a', v, 'en')} multiline />
              </Card>
            ))}

            <button className="btn" onClick={() => addRow('faqs')}>
              + {t('سؤال جديد', 'Add a question')}
            </button>
          </>
        )}

        {sec === 'cta' && (
          <>
            {scalar('ctaTitle', t('العنوان', 'Title'), true)}
            {scalar('ctaSub', t('الوصف', 'Subtitle'), true)}
            {scalar('ctaBtn', t('الزر', 'Button'))}
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

      {toast && <div className="toast">{t('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
